export type PRDSectionId = 
  | 'overview'
  | 'personas'
  | 'absensi'
  | 'payroll'
  | 'cuti'
  | 'kinerja'
  | 'manpower'
  | 'arsitektur'
  | 'database'
  | 'api'
  | 'regulasi'
  | 'simulators'
  | 'wireframes'
  | 'roadmap';

export interface UserPersona {
  role: string;
  title: string;
  description: string;
  painPoints: string[];
  keyNeeds: string[];
  moduleAccess: string[];
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  summary: string;
  module: string;
  authRequired: boolean;
  requestBodyExample?: string;
  responseExample?: string;
}

export interface DatabaseField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  nullable: boolean;
  description: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  fields: DatabaseField[];
}

export interface PRDSubSection {
  id: string;
  title: string;
  content: string;
  callout?: {
    type: 'info' | 'warning' | 'regulation' | 'tech';
    title: string;
    text: string;
  };
  acceptanceCriteria?: string[];
}

export interface PRDSection {
  id: PRDSectionId;
  title: string;
  badge?: string;
  description: string;
  subsections: PRDSubSection[];
}

// Simulator types
export interface PayrollInput {
  basicSalary: number;
  fixedAllowance: number;
  variableAllowance: number;
  overtimeHours: number;
  ptkpStatus: 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3' | 'K/0' | 'K/1' | 'K/2' | 'K/3';
  includeBPJSKesehatan: boolean;
  includeBPJSKetenagakerjaan: boolean;
  unpaidLeaveDays: number;
}

export interface PayrollResult {
  grossSalary: number;
  overtimePay: number;
  unpaidDeduction: number;
  bpjsKesEmployee: number;
  bpjsKesCompany: number;
  bpjsJhtEmployee: number;
  bpjsJhtCompany: number;
  bpjsJpEmployee: number;
  bpjsJpCompany: number;
  bpjsJkkCompany: number;
  bpjsJkmCompany: number;
  taxCategoryTER: 'A' | 'B' | 'C';
  taxRateTERPercentage: number;
  pph21Monthly: number;
  totalEmployeeDeductions: number;
  netTakeHomePay: number;
  totalCompanyCost: number;
}
