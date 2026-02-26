
import React, { useState, useRef, useEffect } from 'react';
import { WBSItem, HLDComponent, LLDComponent, RoadmapPhase, ProjectAssets, Activity, RiskItem, JiraConfig } from '../types';
import { ChevronDown, CheckCircle, Cpu, Calendar, Target, Layers, Box, Terminal, Activity as ActivityIcon, LayoutList, Plus, Trash2, Link2, Clock, ShieldAlert, AlertTriangle, Info, BarChart3, TrendingUp, Briefcase, PieChart, Users, ArrowRight, X, FolderOpen, Rocket, Share2, Globe, ExternalLink, Settings2, RefreshCw, Edit3, Save, CheckCircle2, FileUp, Archive, History, DownloadCloud, Database, Download, Kanban, ListTodo, GripVertical } from 'lucide-react';
import * as XLSX from 'xlsx';

// WBSView component
export const WBSView: React.FC<{ items: WBSItem[], onDownloadPDF?: () => void }> = ({ items, onDownloadPDF }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Work <span className="text-indigo-600">Breakdown</span></h2>
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <LayoutList className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                {item.reqId}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
            <div className="space-y-2">
              {item.subtasks?.map((sub, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <span>{sub}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// RiskLogView component
export const RiskLogView: React.FC<{ risks: RiskItem[], onUpdate: (risks: RiskItem[]) => void, onDownloadPDF?: () => void }> = ({ risks, onUpdate, onDownloadPDF }) => {
  const handleDelete = (id: string) => {
    onUpdate(risks.filter(r => r.id !== id));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900">Risk <span className="text-red-600">Inventory</span></h2>
        <div className="flex gap-2">
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> PDF
            </button>
          )}
          <button 
            onClick={() => onUpdate([...risks, { id: `R-${risks.length + 1}`, category: 'Technical', description: 'New identified risk', impact: 'Medium', mitigation: 'Mitigation plan pending' }])}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Add Risk
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {risks.map((risk) => (
          <div key={risk.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className={`p-4 rounded-2xl border ${getImpactColor(risk.impact)}`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{risk.id}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{risk.category}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getImpactColor(risk.impact)}`}>{risk.impact} Impact</span>
              </div>
              <h4 className="font-bold text-slate-800">{risk.description}</h4>
              <div className="flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                 <span className="shrink-0 mt-0.5 text-amber-600"><Info className="w-4 h-4" /></span>
                 <p className="text-xs text-amber-800"><strong>Mitigation:</strong> {risk.mitigation}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(risk.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GlobalDashboardView: React.FC<{ 
  projects: ProjectAssets[], 
  onOpenProject: (id: string) => void, 
  onDeleteProject: (id: string, e: React.MouseEvent) => void, 
  onToggleArchive: (id: string, e: React.MouseEvent) => void,
  onNewProject: () => void 
}> = ({ projects, onOpenProject, onDeleteProject, onToggleArchive, onNewProject }) => {
  const activeProjects = projects.filter(p => !p.isArchived);
  const archivedProjects = projects.filter(p => p.isArchived);
  
  const totalProjects = projects.length;
  const totalRisks = projects.reduce((acc, p) => acc + p.riskLog.length, 0);
  const totalTasks = projects.reduce((acc, p) => acc + p.activities.length, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.activities.filter(a => a.status === 'Done').length, 0);
  
  const avgProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Portfolio <span className="text-indigo-600">Overview</span></h1>
          <p className="text-slate-500">Enterprise intelligence hub for BSS-PMO</p>
        </div>
        <button 
          onClick={onNewProject}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Initialize New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{activeProjects.length}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><BarChart3 className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{avgProgress}%</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completion</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Archive className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{archivedProjects.length}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Archives</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalRisks}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Risks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2"><FolderOpen className="w-6 h-6 text-indigo-600" />Active Projects</h3>
             </div>
             <div className="space-y-4">
                {activeProjects.map(p => (
                  <ProjectCard key={p.id} project={p} onClick={() => onOpenProject(p.id)} onDelete={onDeleteProject} onToggleArchive={onToggleArchive} />
                ))}
             </div>
          </div>
          
          {archivedProjects.length > 0 && (
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 border-dashed">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-400 text-xl flex items-center gap-2"><History className="w-6 h-6" />Project Archives</h3>
               </div>
               <div className="space-y-4 opacity-60">
                  {archivedProjects.map(p => (
                    <ProjectCard key={p.id} project={p} onClick={() => onOpenProject(p.id)} onDelete={onDeleteProject} onToggleArchive={onToggleArchive} isArchive />
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-8 rounded-3xl text-white">
              <h3 className="font-bold text-lg mb-4">Portfolio Strategy</h3>
              <p className="text-slate-400 text-sm italic">"Ahmed, your BSS-PMO platform currently monitors {totalProjects} projects. Ensure HLD/LLD approvals are finalized before moving critical infrastructure to archives."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onClick, onDelete, onToggleArchive, isArchive = false }: any) => {
  const pPerc = project.activities.length > 0 ? Math.round((project.activities.filter((a: any) => a.status === 'Done').length / project.activities.length) * 100) : 0;
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${isArchive ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <Rocket className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{project.metadata.projectName}</h4>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Modified {new Date(project.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{pPerc}%</span>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full" style={{ width: `${pPerc}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => onToggleArchive(project.id, e)} 
            className={`p-2 rounded-lg transition-all ${isArchive ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-300 hover:text-indigo-600 hover:bg-slate-50'}`}
            title={isArchive ? "Restore from Archive" : "Move to Archive"}
          >
            <Archive className="w-4 h-4" />
          </button>
          <button onClick={(e) => onDelete(project.id, e)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
      </div>
    </div>
  );
};

export const HLDView: React.FC<{ components: HLDComponent[], onUpdate: (comps: HLDComponent[]) => void, onDownloadPDF?: () => void }> = ({ components, onUpdate, onDownloadPDF }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (id: string, updates: Partial<HLDComponent>) => {
    onUpdate(components.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingId(null);
  };

  const handleApprove = (id: string) => {
    onUpdate(components.map(c => c.id === id ? { ...c, isApproved: true, approvedBy: 'Ahmed Nabil' } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">High-Level <span className="text-blue-600">Design</span></h2>
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {components.map((comp) => (
          <div key={comp.id} className={`bg-white border rounded-3xl p-6 transition-all ${comp.isApproved ? 'border-emerald-200 shadow-emerald-50 shadow-lg' : 'border-slate-200'}`}>
            {editingId === comp.id ? (
              <div className="space-y-4">
                <input 
                  className="w-full text-lg font-bold bg-slate-50 p-2 rounded-lg outline-none border border-indigo-100" 
                  defaultValue={comp.name} 
                  onBlur={(e) => handleSave(comp.id, { name: e.target.value })}
                />
                <textarea 
                  className="w-full text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-indigo-100" 
                  rows={3}
                  defaultValue={comp.description}
                  onBlur={(e) => handleSave(comp.id, { description: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Finish</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${comp.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    {!comp.isApproved && (
                      <>
                        <button onClick={() => setEditingId(comp.id)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleApprove(comp.id)} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                      </>
                    )}
                    {comp.isApproved && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                         <CheckCircle2 className="w-3 h-3" /> Approved by {comp.approvedBy}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{comp.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{comp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {comp.techStack.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">{tech}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LLDView: React.FC<{ components: LLDComponent[], onUpdate: (comps: LLDComponent[]) => void, onDownloadPDF?: () => void }> = ({ components, onUpdate, onDownloadPDF }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (id: string, updates: Partial<LLDComponent>) => {
    onUpdate(components.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingId(null);
  };

  const handleApprove = (id: string) => {
    onUpdate(components.map(c => c.id === id ? { ...c, isApproved: true, approvedBy: 'Ahmed Nabil' } : c));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-black text-slate-900">Low-Level <span className="text-amber-600">Design</span></h2>
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>
      {components.map((comp) => (
        <div key={comp.id} className={`bg-white border rounded-2xl p-6 transition-all ${comp.isApproved ? 'border-emerald-200' : 'border-slate-200'}`}>
          {editingId === comp.id ? (
            <div className="space-y-4">
              <input className="w-full text-lg font-bold bg-slate-50 p-2 rounded-lg" defaultValue={comp.moduleName} onBlur={(e) => handleSave(comp.id, { moduleName: e.target.value })} />
              <textarea className="w-full text-sm text-slate-600 bg-slate-50 p-2 rounded-lg" rows={2} defaultValue={comp.details} onBlur={(e) => handleSave(comp.id, { details: e.target.value })} />
              <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">SAVE</button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Terminal className={`w-5 h-5 ${comp.isApproved ? 'text-emerald-500' : 'text-amber-500'}`} />
                <div>
                  <h4 className="font-bold text-slate-800">{comp.moduleName}</h4>
                  <p className="text-sm text-slate-500">{comp.details}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!comp.isApproved && (
                  <>
                    <button onClick={() => setEditingId(comp.id)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleApprove(comp.id)} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase hover:bg-emerald-100 transition-colors">Approve</button>
                  </>
                )}
                {comp.isApproved && <span className="text-[10px] font-black text-emerald-600 uppercase">Verified</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const ActivityTableView: React.FC<{ 
  activities: Activity[], 
  jiraConfig?: JiraConfig,
  onUpdate: (activities: Activity[]) => void,
  onDownloadPDF?: () => void
}> = ({ activities, jiraConfig, onUpdate, onDownloadPDF }) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isFetchingJira, setIsFetchingJira] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCellEdit = (id: string, field: keyof Activity, value: any) => {
    onUpdate(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      const newActivities: Activity[] = data.map((row, i) => ({
        id: row.id || row.ID || `T-${activities.length + i + 1}`,
        task: row.task || row.Activity || row.Task || 'Imported Task',
        startDate: row.startDate || row.Start || new Date().toISOString().split('T')[0],
        endDate: row.endDate || row.End || new Date().toISOString().split('T')[0],
        duration: parseInt(row.duration || row.Days || row.Duration) || 1,
        status: (row.status || row.Status || 'To Do') as any,
      }));
      onUpdate([...activities, ...newActivities]);
    };
    reader.readAsBinaryString(file);
  };

  const handleJiraSync = (id: string) => {
    if (!jiraConfig?.isConnected) return;
    setSyncingId(id);
    // Simulate API push to Jira Cloud
    setTimeout(() => {
      const jiraKey = `${jiraConfig.projectKey}-${Math.floor(100 + Math.random() * 900)}`;
      handleCellEdit(id, 'jiraKey', jiraKey);
      setSyncingId(null);
    }, 1200);
  };

  const handleFetchSHABMOB = () => {
    setIsFetchingJira(true);
    // Simulate fetching from SHAB MOB project for Ahmed Nabil
    setTimeout(() => {
      const mockJiraIssues: Activity[] = [
        { id: 'SM-101', task: '[SHAB MOB] Provisioning Engine Refactoring', startDate: '2025-04-01', endDate: '2025-04-10', duration: 10, status: 'In Progress', jiraKey: 'SM-101' },
        { id: 'SM-102', task: '[SHAB MOB] Real-time Balance Sync - KYC Validation', startDate: '2025-04-05', endDate: '2025-04-15', duration: 10, status: 'To Do', jiraKey: 'SM-102' },
        { id: 'SM-103', task: '[SHAB MOB] SIM Lifecycle Webhook Implementation', startDate: '2025-03-25', endDate: '2025-03-30', duration: 5, status: 'Done', jiraKey: 'SM-103' },
      ];
      // Append and notify
      onUpdate([...activities, ...mockJiraIssues]);
      setIsFetchingJira(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Implementation <span className="text-indigo-600">Schedule</span></h2>
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h4 className="text-lg font-black text-slate-800">BSS Activity Orchestration</h4>
             <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Targeting: Ahmed.nabil@bssconnects.com</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleExcelUpload} />
            
            <button 
              onClick={handleFetchSHABMOB}
              disabled={isFetchingJira}
              className="flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all disabled:opacity-50"
            >
              {isFetchingJira ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
              {isFetchingJira ? 'Syncing SHAB MOB...' : 'Import from SHAB MOB'}
            </button>

            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs border border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm">
              <FileUp className="w-4 h-4" /> Import Excel
            </button>
            
            <button onClick={() => onUpdate([...activities, { id: `T-${activities.length + 1}`, task: 'New Manual Entry', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], duration: 1, status: 'To Do' }])} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-lg active:scale-95 transition-all">
              Add Row
            </button>
          </div>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <tr>
              <th className="px-6 py-5 border-b border-slate-100">ID</th>
              <th className="px-6 py-5 border-b border-slate-100">Activity Detail</th>
              <th className="px-6 py-5 border-b border-slate-100">Execution Status</th>
              <th className="px-6 py-5 border-b border-slate-100">Timeline</th>
              <th className="px-6 py-5 border-b border-slate-100">Jira Integration</th>
              <th className="px-6 py-5 border-b border-slate-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                  No activities detected. Import from Excel or SHAB MOB to begin.
                </td>
              </tr>
            ) : activities.map((act) => (
              <tr key={act.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{act.id}</td>
                <td className="px-6 py-4">
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-200"
                    value={act.task}
                    placeholder="Describe the task..."
                    onChange={(e) => handleCellEdit(act.id, 'task', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4">
                  <select 
                    className={`border-none rounded-xl text-[10px] font-black uppercase px-3 py-1.5 outline-none shadow-sm transition-all ${
                      act.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 
                      act.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}
                    value={act.status}
                    onChange={(e) => handleCellEdit(act.id, 'status', e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="flex flex-col">
                       <label className="text-[8px] font-black text-slate-300 uppercase">Start Date</label>
                       <input type="date" value={act.startDate} onChange={(e) => handleCellEdit(act.id, 'startDate', e.target.value)} className="bg-transparent border-none text-[10px] p-0 font-bold text-slate-500 w-24 focus:ring-0" />
                     </div>
                     <div className="w-px h-6 bg-slate-200"></div>
                     <div className="flex flex-col">
                       <label className="text-[8px] font-black text-slate-300 uppercase">Days</label>
                       <input type="number" value={act.duration} onChange={(e) => handleCellEdit(act.id, 'duration', parseInt(e.target.value) || 0)} className="bg-transparent border-none text-[10px] p-0 font-bold text-slate-400 w-8 focus:ring-0" />
                     </div>
                   </div>
                </td>
                <td className="px-6 py-4">
                  {act.jiraKey ? (
                    <div className="flex items-center gap-2 text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-2 rounded-xl border border-sky-100 w-fit animate-in slide-in-from-right-2">
                      <Database className="w-3 h-3" /> {act.jiraKey}
                      <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleJiraSync(act.id)}
                      disabled={syncingId === act.id}
                      className="text-[10px] font-black text-slate-400 hover:text-sky-600 transition-all flex items-center gap-2 uppercase tracking-tighter bg-slate-50 hover:bg-white border border-transparent hover:border-sky-100 px-3 py-2 rounded-xl"
                    >
                      {syncingId === act.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />} Push to Cloud
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => onUpdate(activities.filter(a => a.id !== act.id))} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© BSSconnects Enterprise Resource Orchestrator</p>
      </div>
    </div>
    </div>
  );
};

export const RoadmapView: React.FC<{ phases: RoadmapPhase[], onDownloadPDF?: () => void }> = ({ phases, onDownloadPDF }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-black text-slate-900">Strategic <span className="text-emerald-600">Roadmap</span></h2>
      {onDownloadPDF && (
        <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      )}
    </div>
    <div className="relative pl-8 md:pl-0">
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-slate-200 rounded-full"></div>
      <div className="md:hidden absolute left-4 w-1 h-full bg-slate-200 rounded-full"></div>

      <div className="space-y-12 relative">
        {phases.map((phase, idx) => (
          <div key={idx} className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
            <div className="absolute left-[-22px] md:left-1/2 md:transform md:-translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-indigo-600 z-10 flex items-center justify-center shadow-lg">
               <span className="text-indigo-600 font-black text-sm">{idx + 1}</span>
            </div>

            <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {phase.duration}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">{phase.phaseName}</h3>
                <div className="space-y-2">
                  {phase.milestones.map((ms, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-3 text-sm text-slate-600 p-2 rounded-lg bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{ms}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block w-5/12"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardView: React.FC<{ 
  assets: ProjectAssets,
  onUpdateJira: (config: JiraConfig) => void,
  onArchive: () => void,
  onDownloadPDF?: () => void
}> = ({ assets, onUpdateJira, onArchive, onDownloadPDF }) => {
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false);
  const [jiraUrl, setJiraUrl] = useState(assets.jiraConfig?.instanceUrl || 'https://bssconnects.atlassian.net');
  const [jiraKey, setJiraKey] = useState(assets.jiraConfig?.projectKey || 'SHAB');
  const [jiraProjectName, setJiraProjectName] = useState(assets.jiraConfig?.projectName || 'SHAB MOB');

  const totalTasks = assets.activities.length;
  const completedTasks = assets.activities.filter(a => a.status === 'Done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const allHldApproved = assets.hld.length > 0 && assets.hld.every(h => h.isApproved);
  const allLldApproved = assets.lld.length > 0 && assets.lld.every(l => l.isApproved);

  const handleConnectJira = () => {
    onUpdateJira({
      instanceUrl: jiraUrl,
      projectKey: jiraKey,
      projectName: jiraProjectName,
      isConnected: true,
      accountEmail: 'Ahmed.nabil@bssconnects.com'
    });
    setIsJiraModalOpen(false);
  };

  // Auto-connect if not set (for demo purposes based on user request)
  useEffect(() => {
    if (!assets.jiraConfig?.isConnected) {
        handleConnectJira();
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Project <span className="text-indigo-600">Health</span></h2>
        {onDownloadPDF && (
          <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><LayoutList className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.wbs.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">WBS Streams</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><Cpu className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.hld.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">HLD Blocks</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><AlertTriangle className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.riskLog.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Risks</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><Clock className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.roadmap.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Phases</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-800 text-xl mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-600" />Project Pulse</span>
              <span className="text-indigo-600 font-black text-2xl">{progressPercent}%</span>
            </h3>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
              <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activities</div>
                 <div className="text-xl font-black text-slate-800">{totalTasks}</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                 <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Completed</div>
                 <div className="text-xl font-black text-emerald-800">{completedTasks}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                 <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Gov Review</div>
                 <div className="text-xl font-black text-blue-800">{allHldApproved && allLldApproved ? 'Verified' : 'Pending'}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
             <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h4 className="font-black text-xl">Asset Governance</h4>
                  <p className="text-slate-400 text-xs">Final approval required for SHAB MOB archival move.</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${allHldApproved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>HLD: {allHldApproved ? 'SIGNED' : 'OPEN' }</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${allLldApproved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>LLD: {allLldApproved ? 'SIGNED' : 'OPEN' }</span>
                </div>
             </div>
             <button 
               onClick={onArchive}
               disabled={!allHldApproved || !allLldApproved || assets.isArchived}
               className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${
                 assets.isArchived ? 'bg-emerald-600 text-white cursor-default' : 
                 (!allHldApproved || !allLldApproved) ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 
                 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900 active:scale-95'
               }`}
             >
               {assets.isArchived ? 'Asset Securely Archived' : (!allHldApproved || !allLldApproved) ? 'Review Pending Assets Above' : 'Confirm & Commit to Archives'}
             </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-8 rounded-[40px] border transition-all ${assets.jiraConfig?.isConnected ? 'bg-sky-600 border-sky-500 text-white shadow-2xl shadow-sky-900/20' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-start mb-6">
               <div className={`p-4 rounded-2xl ${assets.jiraConfig?.isConnected ? 'bg-white/20' : 'bg-sky-50'}`}>
                 <Share2 className={`w-8 h-8 ${assets.jiraConfig?.isConnected ? 'text-white' : 'text-sky-600'}`} />
               </div>
               {assets.jiraConfig?.isConnected && (
                 <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Online
                 </div>
               )}
            </div>
            <h3 className="font-black text-2xl mb-2">Jira Bridge</h3>
            <p className={`text-sm mb-8 leading-relaxed ${assets.jiraConfig?.isConnected ? 'text-sky-100' : 'text-slate-500'}`}>
              {assets.jiraConfig?.isConnected 
                ? `Mapped to ${assets.jiraConfig.accountEmail} • Project: ${assets.jiraConfig.projectName}`
                : "Synchronize your architectural tasks with the global BSSconnects Jira instance."}
            </p>
            <button 
              onClick={() => setIsJiraModalOpen(true)}
              className={`w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all shadow-lg ${assets.jiraConfig?.isConnected ? 'bg-white text-sky-600 hover:bg-sky-50' : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-100'}`}
            >
              {assets.jiraConfig?.isConnected ? "Connection Details" : "Establish Link"}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm text-sm space-y-5">
             <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                <Users className="w-5 h-5 text-indigo-600" />
                <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Resource Control</h4>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold">Primary Architect:</span>
                <span className="font-black text-slate-800 text-sm">Ahmed Nabil</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold">Email:</span>
                <span className="font-bold text-indigo-600 text-[10px]">ahmed.nabil@bssconnects.com</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold">Target Org:</span>
                <span className="font-black text-slate-800 text-sm">{assets.metadata.organization}</span>
             </div>
          </div>
        </div>
      </div>

      {isJiraModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-12 space-y-8">
                <div className="flex justify-between items-center">
                   <div>
                     <h3 className="text-3xl font-black text-slate-800">Bridge <span className="text-sky-600">Jira</span></h3>
                     <p className="text-slate-400 text-xs mt-1">Configuring environment for SHAB MOB project.</p>
                   </div>
                   <button onClick={() => setIsJiraModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><X /></button>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Instance Endpoint</label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-300" />
                      <input type="text" placeholder="https://company.atlassian.net" value={jiraUrl} onChange={(e) => setJiraUrl(e.target.value)} className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold text-slate-800" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Project Key</label>
                      <input type="text" placeholder="SHAB" value={jiraKey} onChange={(e) => setJiraKey(e.target.value)} className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold text-slate-800" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                      <input type="text" placeholder="SHAB MOB" value={jiraProjectName} onChange={(e) => setJiraProjectName(e.target.value)} className="bg-transparent border-none focus:ring-0 w-full text-sm font-bold text-slate-800" />
                    </div>
                  </div>

                  <div className="p-6 bg-sky-50 text-sky-700 text-xs font-bold rounded-3xl border border-sky-100 flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0" />
                    <p className="leading-relaxed">
                      This link will synchronize all issues from the <strong>{jiraProjectName}</strong> project directly to your BSS-PMO dashboard for <strong>Ahmed.nabil@bssconnects.com</strong>.
                    </p>
                  </div>
                </div>
                <button onClick={handleConnectJira} className="w-full py-5 bg-sky-600 text-white rounded-[24px] font-black shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 text-sm uppercase tracking-widest">Activate Connection</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const BacklogView: React.FC<{ 
  backlog: BacklogItem[], 
  onUpdate: (items: BacklogItem[]) => void,
  onDownloadPDF?: () => void 
}> = ({ backlog, onUpdate, onDownloadPDF }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      const newItems: BacklogItem[] = data.map((row, idx) => ({
        id: `BL-${backlog.length + idx + 1}`,
        title: row.Title || row.title || 'Untitled Story',
        description: row.Description || row.description || '',
        priority: (row.Priority || row.priority || 'Medium') as any,
        status: (row.Status || row.status || 'Backlog') as any,
        type: (row.Type || row.type || 'User Story') as any,
        estimate: parseInt(row.Estimate || row.estimate) || 0
      }));
      
      onUpdate([...backlog, ...newItems]);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Product <span className="text-indigo-600">Backlog</span></h2>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleExcelUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <FileUp className="w-4 h-4" /> Import Backlog
          </button>
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-100">ID</th>
              <th className="px-6 py-4 border-b border-slate-100">Type</th>
              <th className="px-6 py-4 border-b border-slate-100">Title</th>
              <th className="px-6 py-4 border-b border-slate-100">Priority</th>
              <th className="px-6 py-4 border-b border-slate-100">Status</th>
              <th className="px-6 py-4 border-b border-slate-100">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backlog.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                  Backlog is empty. Import from Excel to begin.
                </td>
              </tr>
            ) : backlog.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{item.id}</td>
                <td className="px-6 py-4">
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${
                    item.type === 'Bug' ? 'bg-red-100 text-red-600' : 
                    item.type === 'Epic' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 text-sm">{item.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{item.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold ${
                    item.priority === 'Critical' ? 'text-red-600' : 
                    item.priority === 'High' ? 'text-orange-600' : 'text-slate-500'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-slate-600">{item.status}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.estimate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ScrumBoardView: React.FC<{ 
  backlog: BacklogItem[], 
  sprints: Sprint[],
  onUpdateBacklog: (items: BacklogItem[]) => void
}> = ({ backlog, sprints, onUpdateBacklog }) => {
  const activeSprint = sprints.find(s => s.status === 'Active') || sprints[0];
  const columns: BacklogItem['status'][] = ['Ready', 'In Progress', 'Done'];

  const moveItem = (id: string, newStatus: BacklogItem['status']) => {
    onUpdateBacklog(backlog.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Scrum <span className="text-emerald-600">Board</span></h2>
          <p className="text-slate-400 text-xs mt-1">Active Sprint: <span className="text-indigo-600 font-bold">{activeSprint?.name || 'No Active Sprint'}</span></p>
        </div>
        <div className="flex gap-2">
           {activeSprint && (
             <div className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
               {activeSprint.startDate} — {activeSprint.endDate}
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col} className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{col}</h3>
              <span className="bg-white border border-slate-200 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-lg">
                {backlog.filter(i => i.status === col).length}
              </span>
            </div>
            
            <div className="space-y-4">
              {backlog.filter(i => i.status === col).map(item => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      item.type === 'Bug' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">#{item.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2">{item.title}</h4>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-indigo-600">AN</div>
                    </div>
                    <div className="flex items-center gap-2">
                       {col !== 'Done' && (
                         <button 
                           onClick={() => moveItem(item.id, col === 'Ready' ? 'In Progress' : 'Done')}
                           className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                         >
                           <ArrowRight className="w-3.5 h-3.5" />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { FolderOpen };
