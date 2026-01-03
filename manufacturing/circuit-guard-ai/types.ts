
export interface Defect {
  component: string;
  type: 'Short Circuit' | 'Missing Component' | 'Poor Solder' | 'Burnt' | 'Misalignment' | 'None';
  confidence: number;
  description: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Info';
  location: { x: number; y: number; width: number; height: number };
}

export interface InspectionResult {
  status: 'Pass' | 'Fail';
  defects: Defect[];
  summary: string;
  timestamp: string;
  image?: string;
}

export interface Statistics {
  totalInspected: number;
  passCount: number;
  failCount: number;
  defectTypes: Record<string, number>;
}

export enum ViewMode {
  INSPECTION = 'INSPECTION',
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY'
}
