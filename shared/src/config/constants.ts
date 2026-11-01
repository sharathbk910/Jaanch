export const INPUT_LIMITS = {
  textMin: 20,
  textMax: 50000,
} as const;

export interface OfficialPortal {
  id: string;
  name: string;
  description: string;
  url: string;
  domain: string;
}

export const OFFICIAL_PORTALS: readonly OfficialPortal[] = [
  {
    id: 'aicte',
    name: 'AICTE Internship Portal',
    description: 'Government platform offering verified corporate and public sector internships.',
    url: 'https://internship.aicte-india.org',
    domain: 'aicte-india.org',
  },
  {
    id: 'nsp',
    name: 'National Scholarship Portal (NSP)',
    description: 'Central portal for national and state government student scholarships.',
    url: 'https://scholarships.gov.in',
    domain: 'scholarships.gov.in',
  },
  {
    id: 'ncs',
    name: 'National Career Service',
    description: 'Ministry of Labour & Employment initiative connecting jobseekers with employers.',
    url: 'https://www.ncs.gov.in',
    domain: 'ncs.gov.in',
  },
  {
    id: 'ugc',
    name: 'University Grants Commission (UGC)',
    description: 'Apex higher education portal for recognized universities and colleges.',
    url: 'https://www.ugc.gov.in',
    domain: 'ugc.gov.in',
  },
  {
    id: 'cybercrime',
    name: 'National Cyber Crime Reporting Portal',
    description: 'Government portal to report financial and digital fraud incidents.',
    url: 'https://cybercrime.gov.in',
    domain: 'cybercrime.gov.in',
  },
] as const;

export interface HelplineInfo {
  number: string;
  name: string;
  description: string;
  availableHours: string;
}

export const HELPLINE: readonly HelplineInfo[] = [
  {
    number: '1930',
    name: 'National Cyber Crime Helpline',
    description: 'Citizen Financial Cyber Fraud Reporting and Management System.',
    availableHours: '24x7',
  },
  {
    number: '1915',
    name: 'National Consumer Helpline',
    description: 'Department of Consumer Affairs grievance portal.',
    availableHours: '8:00 AM - 8:00 PM (Except National Holidays)',
  },
] as const;

export const LINK_RISK_LEVELS = {
  HIGH_RISK: 'HIGH_RISK',
  NEEDS_VERIFICATION: 'NEEDS_VERIFICATION',
  NO_MAJOR_WARNING_SIGNS: 'NO_MAJOR_WARNING_SIGNS',
} as const;

export type LinkRiskLevel = (typeof LINK_RISK_LEVELS)[keyof typeof LINK_RISK_LEVELS];

