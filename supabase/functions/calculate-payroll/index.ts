// Deno Edge Function: calculate-payroll
// Description: Implements payroll calculation engine including BPJS Capping and PPh 21 TER (PMK 168/2023)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""

// PPh 21 TER Monthly Categories and Rates Helper according to PMK 168/2023
// Simplification of TER threshold lookup
function getTERRate(category: 'A' | 'B' | 'C', grossSalary: number): number {
  if (category === 'A') {
    if (grossSalary <= 5400000) return 0.0;
    if (grossSalary <= 5650000) return 0.25;
    if (grossSalary <= 5950000) return 0.5;
    if (grossSalary <= 6300000) return 0.75;
    if (grossSalary <= 6750000) return 1.0;
    if (grossSalary <= 7500000) return 1.25;
    if (grossSalary <= 8500000) return 1.5;
    if (grossSalary <= 9500000) return 1.75;
    if (grossSalary <= 10500000) return 2.0;
    if (grossSalary <= 12500000) return 3.0;
    if (grossSalary <= 15000000) return 4.0;
    if (grossSalary <= 20000000) return 5.0;
    return 6.0; // Simple bracket limit representation
  } else if (category === 'B') {
    if (grossSalary <= 6200000) return 0.0;
    if (grossSalary <= 6500000) return 0.25;
    if (grossSalary <= 6850000) return 0.5;
    if (grossSalary <= 7300000) return 0.75;
    if (grossSalary <= 7800000) return 1.0;
    if (grossSalary <= 8800000) return 1.25;
    if (grossSalary <= 9800000) return 1.5;
    if (grossSalary <= 10900000) return 1.75;
    if (grossSalary <= 11200000) return 2.0;
    if (grossSalary <= 13900000) return 3.0;
    if (grossSalary <= 16500000) return 4.0;
    if (grossSalary <= 22000000) return 5.0;
    return 6.5;
  } else { // Category C
    if (grossSalary <= 7200000) return 0.0;
    if (grossSalary <= 7600000) return 0.25;
    if (grossSalary <= 8000000) return 0.5;
    if (grossSalary <= 8500000) return 0.75;
    if (grossSalary <= 9000000) return 1.0;
    if (grossSalary <= 10000000) return 1.25;
    if (grossSalary <= 11000000) return 1.5;
    if (grossSalary <= 12000000) return 1.75;
    if (grossSalary <= 13500000) return 2.0;
    if (grossSalary <= 15000000) return 3.0;
    if (grossSalary <= 18000000) return 4.0;
    if (grossSalary <= 25000000) return 5.0;
    return 7.0;
  }
}

// Maps PTKP status to TER category
function getTERCategory(ptkp: string): 'A' | 'B' | 'C' {
  if (['TK/0', 'TK/1', 'K/0'].includes(ptkp)) return 'A';
  if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(ptkp)) return 'B';
  return 'C'; // K/3
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { payroll_run_id } = await req.json()

    if (!payroll_run_id) {
      return new Response(JSON.stringify({ error: 'Missing payroll_run_id' }), { status: 400 })
    }

    // 1. Fetch Payroll Run Details
    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('*')
      .eq('id', payroll_run_id)
      .single()

    if (runError || !run) {
      return new Response(JSON.stringify({ error: 'Payroll run period not found' }), { status: 404 })
    }

    // 2. Fetch all employees in this company
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', run.company_id)
      .eq('status', 'active')

    if (empError || !employees) {
      return new Response(JSON.stringify({ error: 'Error fetching active employees' }), { status: 500 })
    }

    // Calculate dates for current month
    const startOfMonth = new Date(run.year, run.month - 1, 1).toISOString()
    const endOfMonth = new Date(run.year, run.month, 0, 23, 59, 59).toISOString()

    const details = []

    for (const emp of employees) {
      // 3. Query attendance statistics
      const { data: attendance } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('employee_id', emp.id)
        .gte('clock_in', startOfMonth)
        .lte('clock_in', endOfMonth)

      const lateLogs = attendance?.filter(log => log.is_late) || []
      const latePenalty = lateLogs.length * 50000 // Rp 50,000 deduction per late

      // 4. Query Overtime logs for current period
      const { data: approvedOvertimes } = await supabase
        .from('overtime_requests')
        .select('actual_hours')
        .eq('employee_id', emp.id)
        .eq('status', 'APPROVED')
        .gte('date', startOfMonth.split('T')[0])
        .lte('date', endOfMonth.split('T')[0])

      const totalOTHours = approvedOvertimes?.reduce((sum, item) => sum + (Number(item.actual_hours) || 0), 0) || 0
      // Overtime Pay Formula (Simple 1.5x on average standard base)
      const hourlyRate = (Number(emp.basic_salary) / 173)
      const overtimePay = totalOTHours * hourlyRate * 1.5

      // 5. Query approved leave requests that are Unpaid
      const { data: unpaidLeaves } = await supabase
        .from('leave_requests')
        .select('total_days')
        .eq('employee_id', emp.id)
        .eq('status', 'APPROVED')
        .eq('leave_policy_id', 'a8c78dbd-021c-4b50-9c1c-99d9b4b00000') // Placeholder for unpaid leave uuid
        .gte('start_date', startOfMonth.split('T')[0])
        .lte('end_date', endOfMonth.split('T')[0])

      const unpaidLeaveDays = unpaidLeaves?.reduce((sum, item) => sum + Number(item.total_days), 0) || 0
      const unpaidLeaveDeduction = unpaidLeaveDays * (Number(emp.basic_salary) / 22) // divided by 22 working days

      // 6. BPJS Calculation Engines
      // BPJS Health: Batas Atas Gaji = Rp 12,000,000
      const basicSal = Number(emp.basic_salary)
      const bpjsHealthBase = Math.min(basicSal, 12000000)
      const bpjsHealthCompany = bpjsHealthBase * 0.04
      const bpjsHealthEmployee = bpjsHealthBase * 0.01

      // BPJS Ketenagakerjaan: Batas Atas Jaminan Pensiun (JP) = Rp 10,042,300 (or newer)
      const jHTCompany = basicSal * 0.037
      const jHTEmployee = basicSal * 0.02
      
      const bpjsJPBase = Math.min(basicSal, 10042300)
      const jpCompany = bpjsJPBase * 0.02
      const jpEmployee = bpjsJPBase * 0.01

      const jKKCompany = basicSal * 0.0024 // assume lowest industry risk (0.24%)
      const jKMCompany = basicSal * 0.003

      const bpjsKetenagakerjaanCompany = jHTCompany + jpCompany + jKKCompany + jKMCompany
      const bpjsKetenagakerjaanEmployee = jHTEmployee + jpEmployee

      // 7. Calculate Gross and PPh 21 TER
      const allowances = { transport: 500000, meal: 500000 } // standard default allowances
      const totalAllowanceVal = 1000000 + overtimePay
      const grossSalary = basicSal + totalAllowanceVal
      
      const terCategory = getTERCategory(emp.ptkp_status)
      const terRatePercentage = getTERRate(terCategory, grossSalary)
      const pph21Tax = grossSalary * (terRatePercentage / 100)

      // 8. Deductions Total and Net Salary
      const totalDeductionsVal = latePenalty + unpaidLeaveDeduction + bpjsHealthEmployee + bpjsKetenagakerjaanEmployee + pph21Tax
      const netSalary = grossSalary - totalDeductionsVal

      details.push({
        payroll_run_id,
        employee_id: emp.id,
        basic_salary: basicSal,
        allowances: {
          transport: 500000,
          meal: 500000,
          overtime_pay: overtimePay
        },
        deductions: {
          late_penalty: latePenalty,
          unpaid_leave_deduction: unpaidLeaveDeduction
        },
        overtime_pay,
        bonus: 0,
        bpjs_health_company: bpjsHealthCompany,
        bpjs_health_employee: bpjsHealthEmployee,
        bpjs_ketenagakerjaan_company: bpjsKetenagakerjaanCompany,
        bpjs_ketenagakerjaan_employee: bpjsKetenagakerjaanEmployee,
        pph21_tax: pph21Tax,
        pph21_category: `TER ${terCategory}`,
        pph21_rate: terRatePercentage,
        gross_salary: grossSalary,
        net_salary: netSalary
      })
    }

    // Insert calculated rows into database
    if (details.length > 0) {
      // Clean previous payroll calculations for this run
      await supabase
        .from('payroll_details')
        .delete()
        .eq('payroll_run_id', payroll_run_id)

      const { error: insertError } = await supabase
        .from('payroll_details')
        .insert(details)

      if (insertError) throw insertError
    }

    return new Response(JSON.stringify({ 
      status: 'success', 
      processed_count: details.length 
    }), {
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
