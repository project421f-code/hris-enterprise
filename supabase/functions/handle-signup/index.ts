// Deno Edge Function: handle-signup
// Description: Handles new user signup by creating company + employee records
// Uses service_role key to bypass RLS policies

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""

serve(async (req) => {
  // CORS
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
    const { auth_user_id, email, full_name } = await req.json()

    if (!auth_user_id || !email || !full_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields: auth_user_id, email, full_name' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    // 1. Check if there's an existing company, or create a default one
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)

    let companyId: string

    if (existingCompanies && existingCompanies.length > 0) {
      companyId = existingCompanies[0].id
    } else {
      // Create default company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({ name: 'Perusahaan Demo', code: 'DEMO' })
        .select('id')
        .single()

      if (companyError || !newCompany) {
        throw new Error(`Failed to create company: ${companyError?.message || 'Unknown error'}`)
      }

      companyId = newCompany.id

      // Create default departments
      const defaultDepartments = [
        'Teknologi Informasi',
        'Sumber Daya Manusia', 
        'Keuangan',
        'Marketing',
        'Operasional',
      ]

      const { error: deptError } = await supabase.from('departments').insert(
        defaultDepartments.map((name) => ({
          company_id: companyId,
          name,
        }))
      )

      if (deptError) {
        console.error('Error creating default departments:', deptError.message)
      }
    }

    // 2. Check if employee record already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('auth_user_id', auth_user_id)
      .single()

    if (existingEmployee) {
      return new Response(JSON.stringify({ 
        status: 'exists', 
        message: 'Employee record already exists',
        company_id: companyId 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 3. Create employee record
    const randomNik = `EMP${String(Math.floor(Math.random() * 90000) + 10000)}`
    
    const { data: newEmployee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        auth_user_id,
        company_id: companyId,
        nik: randomNik,
        full_name: full_name,
        email: email,
        phone: '',
        position: 'Administrator',
        role: 'super_admin',
        status: 'active',
        join_date: new Date().toISOString().split('T')[0],
        ptkp_status: 'TK/0',
        basic_salary: 5000000,
      })
      .select('id, role, company_id')
      .single()

    if (employeeError) {
      throw new Error(`Failed to create employee: ${employeeError.message}`)
    }

    return new Response(JSON.stringify({ 
      status: 'success',
      data: newEmployee,
      company_id: companyId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    console.error('handle-signup error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
