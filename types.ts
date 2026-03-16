
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

export interface Milestone {
  id: string;
  title: string;
  date?: string;
  dependency?: string; // ID of another milestone or activity
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  milestones: Milestone[];
}

export interface Resource {
  id: string;
  name: string;
  email: string;
  role: string;
  availability: number; // Percentage
}

export interface Activity {
  id: string;
  task: string;
  startDate: string;
  endDate: string;
  duration: number;
  dependency?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignedResources?: string[]; // IDs of resources
}

export interface RiskItem {
  id: string;
  category: 'Technical' | 'Regulatory' | 'Operational';
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
  dependency?: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  objective?: string;
  acceptanceCriteria?: string[];
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

export interface ProjectDependency {
  id: string;
  sourceActivityId: string;
  targetActivityId: string;
  roadmapPhaseName?: string;
  description: string;
  type: 'Critical' | 'Technical' | 'Business';
  impact: 'Low' | 'Medium' | 'High';
  status: 'Identified' | 'Resolved' | 'At Risk';
}

export interface WeeklyStatus {
  headline: string;
  accomplishments: string[];
  focusNextWeek: string[];
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
  resources: Resource[];
  dependencies: ProjectDependency[];
  weeklyStatus?: WeeklyStatus;
  lastUpdated: string;
  isArchived?: boolean;
}

export type AssetType = 'DASHBOARD' | 'WBS' | 'HLD' | 'LLD' | 'ACTIVITIES' | 'ROADMAP' | 'RISK_LOG' | 'ARCHIVES' | 'BACKLOG' | 'SCRUM' | 'DEPENDENCIES' | 'RESOURCES' | 'WEEKLY_STATUS';
