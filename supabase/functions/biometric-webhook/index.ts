// Deno Edge Function: biometric-webhook
// Description: Receives biometric device pushes, parses PIN/NIK, matches logs, and inserts attendance record

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""

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

    // Example payload sent by biometric machine API:
    // { "pin": "NIK001", "timestamp": "2026-07-29T08:00:00Z", "device_sn": "ZK-9500-12345" }
    const { pin, timestamp, device_sn } = payload

    if (!pin || !timestamp) {
      return new Response(JSON.stringify({ error: 'Missing pin or timestamp in payload' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    // 1. Fetch employee details matching the biometric PIN/NIK
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, company_id')
      .eq('nik', pin)
      .eq('status', 'active')
      .single()

    if (empError || !employee) {
      console.error(`Employee mapping failed for biometric PIN: ${pin}`);
      return new Response(JSON.stringify({ error: 'Employee not found or inactive' }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    // 2. Identify active shift for this employee to match schedule
    // Querying active shift for the company
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('id, start_time, grace_period_minutes')
      .eq('company_id', employee.company_id)
      .limit(1)
      .single()

    // 3. Determine if this log is Clock-In or Clock-Out today
    const logDate = new Date(timestamp)
    const startOfDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate(), 0, 0, 0).toISOString()
    const endOfDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate(), 23, 59, 59).toISOString()

    const { data: existingLog, error: logFetchError } = await supabase
      .from('attendance_logs')
      .select('id, clock_in, clock_out')
      .eq('employee_id', employee.id)
      .gte('clock_in', startOfDay)
      .lte('clock_in', endOfDay)
      .maybeSingle()

    let responseData = {}

    if (existingLog) {
      // If there is an existing clock_in for today, update the clock_out log
      const { data: updatedLog, error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          clock_out: logDate.toISOString(),
          source: 'FINGERPRINT'
        })
        .eq('id', existingLog.id)
        .select()
        .single()

      if (updateError) throw updateError
      responseData = { status: 'clock_out_updated', data: updatedLog }
    } else {
      // Otherwise, record this as a new clock_in log
      let isLate = false
      let lateMinutes = 0

      if (shift && !shiftError) {
        // Simple logic: Compare clock_in time part with shift start_time
        const [shiftHour, shiftMin] = shift.start_time.split(':').map(Number)
        const clockInHour = logDate.getUTCHours() + 7 // convert to UTC+7 for Indo
        const clockInMin = logDate.getUTCMinutes()

        const shiftMinutesTotal = (shiftHour * 60) + shiftMin
        const clockInMinutesTotal = (clockInHour * 60) + clockInMin

        if (clockInMinutesTotal > (shiftMinutesTotal + shift.grace_period_minutes)) {
          isLate = true
          lateMinutes = clockInMinutesTotal - shiftMinutesTotal
        }
      }

      const { data: insertedLog, error: insertError } = await supabase
        .from('attendance_logs')
        .insert({
          employee_id: employee.id,
          shift_id: shift?.id || null,
          clock_in: logDate.toISOString(),
          source: 'FINGERPRINT',
          is_late: isLate,
          late_minutes: lateMinutes,
          wfh_notes: `Synced from Biometric: ${device_sn || 'N/A'}`
        })
        .select()
        .single()

      if (insertError) throw insertError
      responseData = { status: 'clock_in_registered', data: insertedLog }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    console.error(`Biometric Webhook Error: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
