// Deno Edge Function: clock-in-liveness
// Description: Handle Mobile Geofenced Clock-in with Location check & Liveness validation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""

// Office coordinates configuration (Example coordinates: Jakarta)
const OFFICE_LAT = -6.2088
const OFFICE_LON = 106.8456
const MAX_RADIUS_METERS = 50.0 // 50 meters geo radius

// Distance calculator helper (Haversine Formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

serve(async (req) => {
  // CORS configuration
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const payload = await req.json()
    const { employee_id, latitude, longitude, selfie_base64, is_wfh, wfh_notes } = payload

    if (!employee_id || latitude === undefined || longitude === undefined) {
      return new Response(JSON.stringify({ error: 'Missing employee_id or coordinates' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    // 1. Verify Geofencing radius (if not working WFH)
    if (!is_wfh) {
      const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LON)
      if (distance > MAX_RADIUS_METERS) {
        return new Response(JSON.stringify({ 
          error: `Out of office radius. Distance: ${distance.toFixed(1)}m. Maximum allowed: ${MAX_RADIUS_METERS}m.` 
        }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        })
      }
    }

    // 2. Selfie Face Recognition / Liveness Verification Mocking
    // In production, interface with Face recognition APIs (AWS Rekognition / Face++ / Custom Python Server)
    if (!selfie_base64) {
      return new Response(JSON.stringify({ error: 'Selfie upload required for clock-in liveness verification' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Liveness verification passed mock check for employee: ${employee_id}`);
    
    // Upload selfie image path simulation (typically uploaded to Supabase Storage 'selfies' bucket)
    const selfieUrl = `selfies/${employee_id}_${Date.now()}.jpg`

    // 3. Fetch active shift for check-in
    const { data: employee } = await supabase
      .from('employees')
      .select('company_id')
      .eq('id', employee_id)
      .single()

    const { data: shift } = await supabase
      .from('shifts')
      .select('id, start_time, grace_period_minutes')
      .eq('company_id', employee?.company_id)
      .limit(1)
      .single()

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

    // 4. Verify existing record
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('employee_id', employee_id)
      .gte('clock_in', startOfDay)
      .lte('clock_in', endOfDay)
      .maybeSingle()

    let responseData = {}

    if (existingLog) {
      // Clock-Out update
      const { data: updated } = await supabase
        .from('attendance_logs')
        .update({
          clock_out: now.toISOString(),
          clock_out_latitude: latitude,
          clock_out_longitude: longitude,
          source: is_wfh ? 'WFH_REMOTE' : 'MOBILE_GPS'
        })
        .eq('id', existingLog.id)
        .select()
        .single()

      responseData = { status: 'clock_out_success', data: updated }
    } else {
      // Clock-In insert
      let isLate = false
      let lateMinutes = 0

      if (shift) {
        const [shHour, shMin] = shift.start_time.split(':').map(Number)
        const curHour = now.getHours()
        const curMin = now.getMinutes()

        const shTotal = shHour * 60 + shMin
        const curTotal = curHour * 60 + curMin

        if (curTotal > (shTotal + shift.grace_period_minutes)) {
          isLate = true
          lateMinutes = curTotal - shTotal
        }
      }

      const { data: inserted } = await supabase
        .from('attendance_logs')
        .insert({
          employee_id,
          shift_id: shift?.id || null,
          clock_in: now.toISOString(),
          clock_in_latitude: latitude,
          clock_in_longitude: longitude,
          is_late: isLate,
          late_minutes: lateMinutes,
          selfie_image_url: selfieUrl,
          source: is_wfh ? 'WFH_REMOTE' : 'MOBILE_GPS',
          wfh_notes: is_wfh ? wfh_notes : null
        })
        .select()
        .single()

      responseData = { status: 'clock_in_success', data: inserted }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
