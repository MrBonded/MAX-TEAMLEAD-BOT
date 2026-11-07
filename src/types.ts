export type MentorTone = 'socrates' | 'buddy' | 'lead';
export type TechDirection = 'web' | 'python' | 'iot' | 'git';
export type AppTheme = 'dark' | 'light';
export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  socraticHint?: string;
  direction?: TechDirection;
  isLiveAi?: boolean;
  usedModel?: string;
}

export interface CriticalIssue {
  line: number | null;
  type: string;
  description: string;
  socraticHint: string;
}

export interface CodeReviewResult {
  score: number;
  summary: string;
  criticalIssues: CriticalIssue[];
  bestPractices: string[];
  praise: string;
}

export interface HazardItem {
  severity: 'Критично' | 'Предупреждение';
  component: string;
  message: string;
  advice: string;
}

export interface ChecklistItem {
  item: string;
  passed: boolean;
}

export interface PinConnectionItem {
  from: string;
  to: string;
  wireColor?: string;
  purpose?: string;
  status: 'ok' | 'warning' | 'danger';
  notes?: string;
}

export interface BreadboardDetails {
  hasBreadboard: boolean;
  railsStatus: string;
  description: string;
}

export interface IoTCheckResult {
  isElectronicsDetected?: boolean;
  boardName?: string;
  visualSummary?: string;
  breadboardDetails?: BreadboardDetails;
  safeToPowerOn: boolean;
  safetyScore: number;
  riskLevel: 'Высокий' | 'Средний' | 'Низкий' | 'Безопасно';
  identifiedComponents: string[];
  pinConnections?: PinConnectionItem[];
  plainExplanation?: string;
  hazards: HazardItem[];
  checklist: ChecklistItem[];
  stepByStepFix?: string[];
  mentorVerdict: string;
  isLiveAi?: boolean;
  usedModel?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  title: string;
  reviewsDone: number;
  circuitsChecked: number;
  questionsAsked: number;
  circuitsSaved: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardXp: number;
}

export interface DiaryEntry {
  id: string;
  timestamp: string;
  dateStr: string;
  category: 'code' | 'iot' | 'chat' | 'achievement' | 'note';
  title: string;
  details: string;
  xpEarned: number;
  icon: string;
}
