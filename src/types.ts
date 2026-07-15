export interface Project {
  id: string;
  name: string;
  baseResume: string;
  createdAt: string;
}

export type LocationType = 'remote' | 'hybrid' | 'on site';
export type WorkType = 'full-time' | 'part-time' | 'internship' | 'freelance';
export type ApplicationStatus = 'not_applied' | 'applied' | 'interview' | 'rejected' | 'job canceled';

export interface JobApplication {
  id: string;
  projectId: string; // Belongs to a project (target role)
  company: string;
  title: string;
  jobDescription: string;
  jobUrl?: string;
  platform?: string; // e.g. LinkedIn, Jobstreet, Indeed, etc.
  jobCategory: string; // e.g. Marketing, Engineering, Sales
  locationType: LocationType;
  workType: WorkType;
  country: string;
  timezone: string;
  status: ApplicationStatus;
  dateCreated: string;
  dateApplied: string;
  interviewDates: string[]; // List of interview days (YYYY-MM-DD)
  
  // AI Tailoring results
  atsScore?: number; // 0-100
  suitabilityScale?: number; // 1-10
  suitabilityExplanation?: string;
  optimizedResume?: string;
  gapAnalysis?: string;
  optimizationDetails?: string;
  
  notes?: string;
}

export interface OptimizationResponse {
  atsScore: number;
  suitabilityScale: number;
  suitabilityExplanation: string;
  optimizedResume: string;
  gapAnalysis: string;
  optimizationDetails: string;
  suggestedKeywords: string[];
}
