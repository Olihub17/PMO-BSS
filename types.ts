
export interface WBSItem {
  id: string;
  reqId: string;
  title: string;
  subtasks?: string[];
}

export interface HLDComponent {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  isApproved?: boolean;
  approvedBy?: string;
}

export interface LLDComponent {
  id: string;
  moduleName: string;
  details: string;
  dependencies: string[];
  isApproved?: boolean;
  approvedBy?: string;
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  milestones: string[];
}

export interface Activity {
  id: string;
  task: string;
  startDate: string;
  endDate: string;
  duration: number;
  dependency?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  jiraKey?: string;
}

export interface RiskItem {
  id: string;
  category: 'Technical' | 'Regulatory' | 'Operational';
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
  dependency?: string;
}

export interface JiraConfig {
  instanceUrl: string;
  projectKey: string;
  projectName?: string; // e.g., SHAB MOB
  isConnected: boolean;
  accountEmail?: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Backlog' | 'Ready' | 'In Progress' | 'Done';
  estimate?: number; // Story points
  type: 'User Story' | 'Bug' | 'Task' | 'Epic';
  sprintId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
}

export interface ProjectAssets {
  id: string;
  metadata: {
    projectName: string;
    preparedBy: string;
    date: string;
    organization: string;
  };
  summary: string;
  wbs: WBSItem[];
  hld: HLDComponent[];
  lld: LLDComponent[];
  roadmap: RoadmapPhase[];
  activities: Activity[];
  riskLog: RiskItem[];
  backlog: BacklogItem[];
  sprints: Sprint[];
  lastUpdated: string;
  jiraConfig?: JiraConfig;
  isArchived?: boolean;
}

export type AssetType = 'DASHBOARD' | 'WBS' | 'HLD' | 'LLD' | 'ACTIVITIES' | 'ROADMAP' | 'RISK_LOG' | 'ARCHIVES' | 'BACKLOG' | 'SCRUM';
