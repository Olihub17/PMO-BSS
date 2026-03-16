
import React, { useState, useRef, useEffect } from 'react';
import { WBSItem, HLDComponent, LLDComponent, RoadmapPhase, ProjectAssets, Activity, RiskItem, BacklogItem, Sprint, Milestone, Resource, AssetType, ProjectDependency, WeeklyStatus } from '../types';
import { ChevronDown, CheckCircle, Cpu, Calendar, Target, Layers, Box, Terminal, Activity as ActivityIcon, LayoutList, Plus, Trash2, Link2, Clock, ShieldAlert, AlertTriangle, Info, BarChart3, TrendingUp, Briefcase, PieChart, Users, ArrowRight, X, FolderOpen, Rocket, Share2, Globe, ExternalLink, Settings2, RefreshCw, Edit3, Save, CheckCircle2, FileUp, Archive, History, DownloadCloud, Database, Download, Kanban, ListTodo, GripVertical, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// WeeklyStatusView component
export const WeeklyStatusView: React.FC<{
  status: WeeklyStatus;
  onUpdate: (status: WeeklyStatus) => void;
}> = ({ status, onUpdate }) => {
  const handleHeadlineChange = (val: string) => onUpdate({ ...status, headline: val });
  
  const updateList = (field: 'accomplishments' | 'focusNextWeek', index: number, val: string) => {
    const newList = [...status[field]];
    newList[index] = val;
    onUpdate({ ...status, [field]: newList });
  };

  const addItem = (field: 'accomplishments' | 'focusNextWeek') => {
    onUpdate({ ...status, [field]: [...status[field], ''] });
  };

  const removeItem = (field: 'accomplishments' | 'focusNextWeek', index: number) => {
    onUpdate({ ...status, [field]: status[field].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Weekly <span className="text-indigo-600">Status</span></h2>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Headline Section */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Summary / Key Headline</label>
          <textarea
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-none"
            value={status.headline}
            onChange={(e) => handleHeadlineChange(e.target.value)}
            placeholder="Enter the key headline for this week..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accomplishments */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Accomplishments (Last Week)</label>
              <button onClick={() => addItem('accomplishments')} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {status.accomplishments.map((item, idx) => (
                <div key={idx} className="flex gap-3 group">
                  <div className="mt-2 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <textarea
                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-700 resize-none min-h-[40px]"
                    value={item}
                    onChange={(e) => updateList('accomplishments', idx, e.target.value)}
                    placeholder="Describe accomplishment..."
                  />
                  <button onClick={() => removeItem('accomplishments', idx)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {status.accomplishments.length === 0 && (
                <p className="text-slate-400 text-xs italic">No accomplishments added yet.</p>
              )}
            </div>
          </div>

          {/* Focus Next Week */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus for Next Week</label>
              <button onClick={() => addItem('focusNextWeek')} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {status.focusNextWeek.map((item, idx) => (
                <div key={idx} className="flex gap-3 group">
                  <div className="mt-2 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                  <textarea
                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-700 resize-none min-h-[40px]"
                    value={item}
                    onChange={(e) => updateList('focusNextWeek', idx, e.target.value)}
                    placeholder="Describe focus area..."
                  />
                  <button onClick={() => removeItem('focusNextWeek', idx)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {status.focusNextWeek.length === 0 && (
                <p className="text-slate-400 text-xs italic">No focus areas added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// WBSView component
export const WBSView: React.FC<{ 
  items: WBSItem[], 
  onUpdate: (items: WBSItem[]) => void,
  onDownloadPDF?: () => void 
}> = ({ items, onUpdate, onDownloadPDF }) => {
  const handleCellEdit = (id: string, field: keyof WBSItem, value: any) => {
    onUpdate(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubtaskEdit = (id: string, index: number, value: string) => {
    onUpdate(items.map(item => {
      if (item.id === id) {
        const newSubtasks = [...(item.subtasks || [])];
        newSubtasks[index] = value;
        return { ...item, subtasks: newSubtasks };
      }
      return item;
    }));
  };

  const addSubtask = (id: string) => {
    onUpdate(items.map(item => {
      if (item.id === id) {
        return { ...item, subtasks: [...(item.subtasks || []), 'New Subtask'] };
      }
      return item;
    }));
  };

  const removeSubtask = (id: string, index: number) => {
    onUpdate(items.map(item => {
      if (item.id === id) {
        const newSubtasks = (item.subtasks || []).filter((_, i) => i !== index);
        return { ...item, subtasks: newSubtasks };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Work <span className="text-indigo-600">Breakdown</span></h2>
        <div className="flex gap-2">
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
          <button 
            onClick={() => onUpdate([...items, { id: `WBS-${items.length + 1}`, reqId: `REQ-${items.length + 1}`, title: 'New Milestone', subtasks: [] }])}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 border-b border-slate-100 w-24">Req ID</th>
                <th className="px-6 py-5 border-b border-slate-100">Milestone / Component</th>
                <th className="px-6 py-5 border-b border-slate-100">Specific Tasks</th>
                <th className="px-6 py-5 border-b border-slate-100 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group align-top">
                  <td className="px-6 py-4">
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      value={item.reqId}
                      onChange={(e) => handleCellEdit(item.id, 'reqId', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800"
                      value={item.title}
                      onChange={(e) => handleCellEdit(item.id, 'title', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {item.subtasks?.map((sub, i) => (
                        <div key={i} className="flex items-center gap-2 group/sub">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                          <input 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-slate-600 p-0"
                            value={sub}
                            onChange={(e) => handleSubtaskEdit(item.id, i, e.target.value)}
                          />
                          <button 
                            onClick={() => removeSubtask(item.id, i)}
                            className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addSubtask(item.id)}
                        className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors mt-2"
                      >
                        <Plus className="w-3 h-3" /> Add Task
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onUpdate(items.filter(i => i.id !== item.id))}
                      className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// RiskLogView component
export const RiskLogView: React.FC<{ risks: RiskItem[], onUpdate: (risks: RiskItem[]) => void, onDownloadPDF?: () => void }> = ({ risks, onUpdate, onDownloadPDF }) => {
  const handleDelete = (id: string) => {
    onUpdate(risks.filter(r => r.id !== id));
  };

  const handleCellEdit = (id: string, field: keyof RiskItem, value: any) => {
    onUpdate(risks.map(r => r.id === id ? { ...r, [field]: value } : r));
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
                <select 
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase border-none focus:ring-0"
                  value={risk.category}
                  onChange={(e) => handleCellEdit(risk.id, 'category', e.target.value)}
                >
                  <option value="Technical">Technical</option>
                  <option value="Regulatory">Regulatory</option>
                  <option value="Operational">Operational</option>
                </select>
                <select 
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border focus:ring-0 ${getImpactColor(risk.impact)}`}
                  value={risk.impact}
                  onChange={(e) => handleCellEdit(risk.id, 'impact', e.target.value)}
                >
                  <option value="Low">Low Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="High">High Impact</option>
                </select>
              </div>
              <input 
                className="w-full font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0"
                value={risk.description}
                onChange={(e) => handleCellEdit(risk.id, 'description', e.target.value)}
              />
              <div className="flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                 <span className="shrink-0 mt-0.5 text-amber-600"><Info className="w-4 h-4" /></span>
                 <div className="flex-1 flex items-center gap-2">
                   <strong className="text-xs text-amber-800 shrink-0">Mitigation:</strong>
                   <input 
                     className="w-full text-xs text-amber-800 bg-transparent border-none focus:ring-0 p-0"
                     value={risk.mitigation}
                     onChange={(e) => handleCellEdit(risk.id, 'mitigation', e.target.value)}
                   />
                 </div>
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
  onNewProject: () => void,
  viewMode?: 'dashboard' | 'projects'
}> = ({ projects, onOpenProject, onDeleteProject, onToggleArchive, onNewProject, viewMode = 'dashboard' }) => {
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
          <h1 className="text-4xl font-black text-slate-900">
            {viewMode === 'dashboard' ? 'Portfolio ' : 'Project '} 
            <span className="text-indigo-600">{viewMode === 'dashboard' ? 'Overview' : 'Inventory'}</span>
          </h1>
          <p className="text-slate-500">
            {viewMode === 'dashboard' 
              ? 'Enterprise intelligence hub for BSS-PMO' 
              : 'Manage and access all your architectural deconstructions'}
          </p>
        </div>
        <button 
          onClick={onNewProject}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Initialize New Project
        </button>
      </div>

      {viewMode === 'dashboard' && (
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
      )}

      <div className={`grid grid-cols-1 ${viewMode === 'dashboard' ? 'lg:grid-cols-3' : ''} gap-8`}>
        <div className={`${viewMode === 'dashboard' ? 'lg:col-span-2' : ''} space-y-8`}>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2"><FolderOpen className="w-6 h-6 text-indigo-600" />Active Projects</h3>
             </div>
             <div className="space-y-4">
                {activeProjects.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No active projects found. Start by initializing a new one.</p>
                  </div>
                ) : activeProjects.map(p => (
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

        {viewMode === 'dashboard' && (
          <div className="space-y-6">
             <div className="bg-slate-900 p-8 rounded-3xl text-white">
                <h3 className="font-bold text-lg mb-4">Portfolio Strategy</h3>
                <p className="text-slate-400 text-sm italic">"Ahmed, your BSS-PMO platform currently monitors {totalProjects} projects. Ensure HLD/LLD approvals are finalized before moving critical infrastructure to archives."</p>
             </div>
          </div>
        )}
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
  resources?: Resource[],
  dependencies?: ProjectDependency[],
  onUpdate: (activities: Activity[]) => void,
  onDownloadPDF?: () => void,
  isReadOnly?: boolean,
  currentUserEmail?: string
}> = ({ activities, resources = [], dependencies = [], onUpdate, onDownloadPDF, isReadOnly, currentUserEmail }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResourcePicker, setShowResourcePicker] = useState<string | null>(null);

  const handleCellEdit = (id: string, field: keyof Activity, value: any) => {
    // If read-only, only allow status updates if assigned
    if (isReadOnly) {
      if (field !== 'status') return;
      const act = activities.find(a => a.id === id);
      const isAssigned = act?.assignedResources?.some(rId => resources.find(r => r.id === rId)?.email === currentUserEmail);
      if (!isAssigned) return;
    }
    onUpdate(activities.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const toggleResource = (activityId: string, resourceId: string) => {
    onUpdate(activities.map(a => {
      if (a.id === activityId) {
        const assigned = a.assignedResources || [];
        const newAssigned = assigned.includes(resourceId)
          ? assigned.filter(id => id !== resourceId)
          : [...assigned, resourceId];
        return { ...a, assignedResources: newAssigned };
      }
      return a;
    }));
  };

  const getActivityDependencies = (activityId: string) => {
    return dependencies.filter(d => d.sourceActivityId === activityId || d.targetActivityId === activityId);
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
            
            {!isReadOnly && (
              <>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs border border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm">
                  <FileUp className="w-4 h-4" /> Import Excel
                </button>
                
                <button onClick={() => onUpdate([...activities, { id: `T-${activities.length + 1}`, task: 'New Manual Entry', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], duration: 1, status: 'To Do' }])} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-lg active:scale-95 transition-all">
                  Add Row
                </button>
              </>
            )}
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
              <th className="px-6 py-5 border-b border-slate-100">Dependencies</th>
              <th className="px-6 py-5 border-b border-slate-100">Resources</th>
              <th className="px-6 py-5 border-b border-slate-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                  No activities detected. Import from Excel to begin.
                </td>
              </tr>
            ) : activities.map((act) => {
              const activityDeps = getActivityDependencies(act.id);
              return (
                <tr key={act.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{act.id}</td>
                  <td className="px-6 py-4">
                    <input 
                      className={`w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-200 ${isReadOnly ? 'cursor-not-allowed' : ''}`}
                      value={act.task}
                      placeholder="Describe the task..."
                      onChange={(e) => handleCellEdit(act.id, 'task', e.target.value)}
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={`border-none rounded-xl text-[10px] font-black uppercase px-3 py-1.5 outline-none shadow-sm transition-all ${
                        act.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 
                        act.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      } ${isReadOnly && !act.assignedResources?.some(rId => resources.find(r => r.id === rId)?.email === currentUserEmail) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      value={act.status}
                      onChange={(e) => handleCellEdit(act.id, 'status', e.target.value)}
                      disabled={isReadOnly && !act.assignedResources?.some(rId => resources.find(r => r.id === rId)?.email === currentUserEmail)}
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
                         <input type="date" value={act.startDate} onChange={(e) => handleCellEdit(act.id, 'startDate', e.target.value)} className={`bg-transparent border-none text-[10px] p-0 font-bold text-slate-500 w-24 focus:ring-0 ${isReadOnly ? 'cursor-not-allowed' : ''}`} readOnly={isReadOnly} />
                       </div>
                       <div className="w-px h-6 bg-slate-200"></div>
                       <div className="flex flex-col">
                         <label className="text-[8px] font-black text-slate-300 uppercase">Days</label>
                         <input type="number" value={act.duration} onChange={(e) => handleCellEdit(act.id, 'duration', parseInt(e.target.value) || 0)} className={`bg-transparent border-none text-[10px] p-0 font-bold text-slate-400 w-8 focus:ring-0 ${isReadOnly ? 'cursor-not-allowed' : ''}`} readOnly={isReadOnly} />
                       </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {activityDeps.length > 0 ? (
                        activityDeps.map(d => (
                          <div 
                            key={d.id} 
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                              d.sourceActivityId === act.id ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}
                            title={d.description}
                          >
                            {d.sourceActivityId === act.id ? 'Pre' : 'Suc'}
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                  <div className="relative">
                    <button 
                      onClick={() => !isReadOnly && setShowResourcePicker(showResourcePicker === act.id ? null : act.id)}
                      className={`flex -space-x-2 transition-opacity ${isReadOnly ? 'cursor-not-allowed' : 'hover:opacity-80'}`}
                      disabled={isReadOnly}
                    >
                      {(act.assignedResources || []).length > 0 ? (
                        act.assignedResources?.map(rId => {
                          const res = resources.find(r => r.id === rId);
                          return (
                            <div key={rId} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-indigo-600" title={res?.name || 'Unknown'}>
                              {res?.name?.split(' ').map(n => n[0]).join('') || '?'}
                            </div>
                          );
                        })
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-400">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                    </button>

                    {showResourcePicker === act.id && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Assign Resources</div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {resources.length === 0 ? (
                            <div className="text-[10px] text-slate-400 p-2 italic">No resources defined.</div>
                          ) : resources.map(res => (
                            <button 
                              key={res.id}
                              onClick={() => toggleResource(act.id, res.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                                (act.assignedResources || []).includes(res.id) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black">
                                  {res.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-[10px] font-bold truncate">{res.name}</span>
                              </div>
                              {(act.assignedResources || []).includes(res.id) && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {!isReadOnly ? (
                    <button 
                      onClick={() => onUpdate(activities.filter(a => a.id !== act.id))} 
                      className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="p-2 text-slate-200">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
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

export const RoadmapView: React.FC<{ 
  phases: RoadmapPhase[], 
  dependencies?: ProjectDependency[],
  onUpdate: (phases: RoadmapPhase[]) => void, 
  onDownloadPDF?: () => void 
}> = ({ phases, dependencies = [], onUpdate, onDownloadPDF }) => {
  const handleCellEdit = (index: number, field: keyof RoadmapPhase, value: any) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    onUpdate(newPhases);
  };

  const handleMilestoneEdit = (phaseIdx: number, msIdx: number, field: keyof Milestone, value: string) => {
    const newPhases = [...phases];
    const newMilestones = [...newPhases[phaseIdx].milestones];
    newMilestones[msIdx] = { ...newMilestones[msIdx], [field]: value };
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], milestones: newMilestones };
    onUpdate(newPhases);
  };

  const addPhase = () => {
    onUpdate([...phases, { phaseName: 'New Phase', duration: 'TBD', milestones: [{ id: `MS-${Date.now()}`, title: 'New Milestone' }] }]);
  };

  const addMilestone = (phaseIdx: number) => {
    const newPhases = [...phases];
    newPhases[phaseIdx] = { 
      ...newPhases[phaseIdx], 
      milestones: [...newPhases[phaseIdx].milestones, { id: `MS-${Date.now()}`, title: 'New Milestone' }] 
    };
    onUpdate(newPhases);
  };

  const removeMilestone = (phaseIdx: number, msIdx: number) => {
    const newPhases = [...phases];
    newPhases[phaseIdx] = { ...newPhases[phaseIdx], milestones: newPhases[phaseIdx].milestones.filter((_, i) => i !== msIdx) };
    onUpdate(newPhases);
  };

  const removePhase = (index: number) => {
    onUpdate(phases.filter((_, i) => i !== index));
  };

  const getPhaseDependencies = (phaseName: string) => {
    return dependencies.filter(d => d.roadmapPhaseName === phaseName);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Strategic <span className="text-emerald-600">Roadmap</span></h2>
        <div className="flex gap-2">
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
          <button 
            onClick={addPhase}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Add Phase
          </button>
        </div>
      </div>
      <div className="relative pl-8 md:pl-0">
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-slate-200 rounded-full"></div>
        <div className="md:hidden absolute left-4 w-1 h-full bg-slate-200 rounded-full"></div>
  
        <div className="space-y-12 relative">
          {phases.map((phase, idx) => {
            const phaseDeps = getPhaseDependencies(phase.phaseName);
            return (
              <div key={idx} className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="absolute left-[-22px] md:left-1/2 md:transform md:-translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-indigo-600 z-10 flex items-center justify-center shadow-lg">
                   <span className="text-indigo-600 font-black text-sm">{idx + 1}</span>
                </div>
    
                <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative">
                    <button 
                      onClick={() => removePhase(idx)}
                      className="absolute top-4 right-4 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <input 
                          className="bg-transparent border-none focus:ring-0 p-0 text-xs font-bold w-20"
                          value={phase.duration}
                          onChange={(e) => handleCellEdit(idx, 'duration', e.target.value)}
                        />
                      </div>
                      {phaseDeps.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-amber-500" />
                          <span className="text-[8px] font-black text-amber-600 uppercase">{phaseDeps.length} Deps</span>
                        </div>
                      )}
                    </div>
                  <input 
                    className="w-full text-xl font-bold text-slate-800 mb-4 bg-transparent border-none focus:ring-0 p-0 group-hover:text-indigo-600 transition-colors"
                    value={phase.phaseName}
                    onChange={(e) => handleCellEdit(idx, 'phaseName', e.target.value)}
                  />
                  <div className="space-y-3">
                    {phase.milestones.map((ms, mIdx) => (
                      <div key={mIdx} className="space-y-1 group/ms">
                        <div className="flex items-center gap-3 text-sm text-slate-600 p-2 rounded-lg bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 flex flex-col">
                            <input 
                              className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-slate-800"
                              value={ms.title}
                              onChange={(e) => handleMilestoneEdit(idx, mIdx, 'title', e.target.value)}
                            />
                            <div className="flex items-center gap-2 mt-1">
                              <Link2 className="w-3 h-3 text-slate-400" />
                              <input 
                                className="bg-transparent border-none focus:ring-0 p-0 text-[10px] text-slate-400 font-mono"
                                placeholder="Dependency ID..."
                                value={ms.dependency || ''}
                                onChange={(e) => handleMilestoneEdit(idx, mIdx, 'dependency', e.target.value)}
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => removeMilestone(idx, mIdx)}
                            className="opacity-0 group-hover/ms:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {ms.dependency && (
                          <div className="ml-9 space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-px h-3 bg-slate-200"></div>
                              <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                Depends on: {ms.dependency}
                              </span>
                            </div>
                            {dependencies.find(d => d.id === ms.dependency) && (
                              <p className="text-[9px] text-slate-400 italic ml-2">
                                {dependencies.find(d => d.id === ms.dependency)?.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => addMilestone(idx)}
                      className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-4 hover:text-indigo-700"
                    >
                      <Plus className="w-3 h-3" /> Add Milestone
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-5/12"></div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const DependencyView: React.FC<{ 
  assets: ProjectAssets,
  onUpdate: (deps: ProjectDependency[]) => void,
  onDownloadPDF?: () => void 
}> = ({ assets, onUpdate, onDownloadPDF }) => {
  const dependencies = assets.dependencies || [];
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);

  const handleAdd = () => {
    const newDep: ProjectDependency = { 
      id: `DEP-${Date.now()}`, 
      sourceActivityId: '', 
      targetActivityId: '', 
      roadmapPhaseName: assets.roadmap[0]?.phaseName || '',
      description: 'New dependency description',
      type: 'Technical',
      impact: 'Medium',
      status: 'Identified'
    };
    onUpdate([...dependencies, newDep]);
    setSelectedDepId(newDep.id);
  };

  const handleEdit = (id: string, field: keyof ProjectDependency, value: any) => {
    onUpdate(dependencies.map(dep => dep.id === id ? { ...dep, [field]: value } : dep));
  };

  const handleRemove = (id: string) => {
    onUpdate(dependencies.filter(dep => dep.id !== id));
    if (selectedDepId === id) setSelectedDepId(null);
  };

  const getStatusColor = (status: ProjectDependency['status']) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-600';
      case 'At Risk': return 'bg-red-100 text-red-600';
      default: return 'bg-amber-100 text-amber-600';
    }
  };

  const getImpactColor = (impact: ProjectDependency['impact']) => {
    switch (impact) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-amber-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900">Project <span className="text-indigo-600">Dependencies</span></h2>
          <p className="text-slate-500 text-xs">Ahmed, align architectural constraints with the master schedule and roadmap.</p>
        </div>
        <div className="flex gap-2">
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            <Plus className="w-4 h-4" /> Add Dependency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {dependencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
              <Link2 className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No dependencies defined yet.</p>
            </div>
          ) : dependencies.map((dep) => (
            <div 
              key={dep.id} 
              onClick={() => setSelectedDepId(dep.id)}
              className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${selectedDepId === dep.id ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'}`}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemove(dep.id); }}
                className="absolute top-6 right-6 p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${getStatusColor(dep.status)}`}>
                  {dep.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">#{dep.id}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Source Activity</div>
                  <div className="font-bold text-slate-800 text-sm truncate">
                    {assets.activities.find(a => a.id === dep.sourceActivityId)?.task || 'Unlinked Activity'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{dep.sourceActivityId || 'No ID'}</div>
                </div>
                <div className="shrink-0">
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Activity</div>
                  <div className="font-bold text-slate-800 text-sm truncate">
                    {assets.activities.find(a => a.id === dep.targetActivityId)?.task || 'Unlinked Activity'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">{dep.targetActivityId || 'No ID'}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{dep.roadmapPhaseName || 'No Phase'}</span>
                </div>
                <div className={`text-[10px] font-black uppercase ${getImpactColor(dep.impact)}`}>
                  {dep.impact} Impact
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          {selectedDepId ? (
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl animate-in slide-in-from-right-4 duration-500">
              {(() => {
                const dep = dependencies.find(d => d.id === selectedDepId);
                if (!dep) return null;
                return (
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900">Dependency <span className="text-indigo-600">Details</span></h3>
                        <p className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest">{dep.id}</p>
                      </div>
                      <button onClick={() => setSelectedDepId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={dep.type}
                          onChange={(e) => handleEdit(dep.id, 'type', e.target.value)}
                        >
                          <option value="Critical">Critical</option>
                          <option value="Technical">Technical</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={dep.status}
                          onChange={(e) => handleEdit(dep.id, 'status', e.target.value)}
                        >
                          <option value="Identified">Identified</option>
                          <option value="Resolved">Resolved</option>
                          <option value="At Risk">At Risk</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Activity (Predecessor)</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={dep.sourceActivityId}
                          onChange={(e) => handleEdit(dep.id, 'sourceActivityId', e.target.value)}
                        >
                          <option value="">Select Activity...</option>
                          {assets.activities.map(a => (
                            <option key={a.id} value={a.id}>[{a.id}] {a.task}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Activity (Successor)</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={dep.targetActivityId}
                          onChange={(e) => handleEdit(dep.id, 'targetActivityId', e.target.value)}
                        >
                          <option value="">Select Activity...</option>
                          {assets.activities.map(a => (
                            <option key={a.id} value={a.id}>[{a.id}] {a.task}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roadmap Phase Integration</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={dep.roadmapPhaseName}
                          onChange={(e) => handleEdit(dep.id, 'roadmapPhaseName', e.target.value)}
                        >
                          <option value="">Select Phase...</option>
                          {assets.roadmap.map(p => (
                            <option key={p.phaseName} value={p.phaseName}>{p.phaseName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description & Impact Analysis</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                        value={dep.description}
                        onChange={(e) => handleEdit(dep.id, 'description', e.target.value)}
                        placeholder="Describe the dependency and its impact on the project schedule..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Level</label>
                      <div className="flex gap-2">
                        {['Low', 'Medium', 'High'].map((level) => (
                          <button
                            key={level}
                            onClick={() => handleEdit(dep.id, 'impact', level)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              dep.impact === level 
                                ? (level === 'High' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : level === 'Medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-600 text-white shadow-lg shadow-slate-200')
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Settings2 className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-slate-800 font-bold mb-2">Detailed Configuration</h4>
              <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Select a dependency card to view and edit its full architectural details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<{ 
  assets: ProjectAssets,
  onArchive: () => void,
  onDownloadPDF?: () => void,
  onNavigate?: (tab: AssetType) => void
}> = ({ assets, onArchive, onDownloadPDF, onNavigate }) => {
  const totalTasks = assets.activities.length;
  const completedTasks = assets.activities.filter(a => a.status === 'Done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const allHldApproved = assets.hld.length > 0 && assets.hld.every(h => h.isApproved);
  const allLldApproved = assets.lld.length > 0 && assets.lld.every(l => l.isApproved);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div 
          onClick={() => onNavigate?.('WBS')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
        >
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><LayoutList className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.wbs.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">WBS Streams</div>
        </div>
        <div 
          onClick={() => onNavigate?.('HLD')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-all"
        >
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><Cpu className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.hld.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">HLD Blocks</div>
        </div>
        <div 
          onClick={() => onNavigate?.('WEEKLY_STATUS')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
        >
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><FileText className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">Status</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Weekly Update</div>
        </div>
        <div 
          onClick={() => onNavigate?.('RISK_LOG')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 transition-all"
        >
           <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><AlertTriangle className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.riskLog.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Risks</div>
        </div>
        <div 
          onClick={() => onNavigate?.('ROADMAP')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-emerald-300 transition-all"
        >
           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><Clock className="w-6 h-6" /></div>
           <div className="text-2xl font-black text-slate-800">{assets.roadmap.length}</div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Phases</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div 
            onClick={() => onNavigate?.('ACTIVITIES')}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
          >
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Top WBS Streams
                <button onClick={() => onNavigate?.('WBS')} className="text-indigo-600 hover:underline">View All</button>
              </h4>
              <div className="space-y-3">
                {assets.wbs.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span className="text-xs font-bold text-slate-700 truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Weekly Status
                <button onClick={() => onNavigate?.('WEEKLY_STATUS')} className="text-indigo-600 hover:underline">View All</button>
              </h4>
              <div className="space-y-3">
                {assets.weeklyStatus ? (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-700 line-clamp-3">{assets.weeklyStatus.headline}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No status update yet.</p>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Critical Risks
                <button onClick={() => onNavigate?.('RISK_LOG')} className="text-indigo-600 hover:underline">View All</button>
              </h4>
              <div className="space-y-3">
                {assets.riskLog.slice(0, 3).map(risk => (
                  <div key={risk.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-700 truncate">{risk.description}</span>
                  </div>
                ))}
                {assets.riskLog.length === 0 && <p className="text-xs text-slate-400 italic">No risks identified.</p>}
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
    </div>
  );
};

export const BacklogView: React.FC<{ 
  backlog: BacklogItem[], 
  onUpdate: (items: BacklogItem[]) => void,
  onDownloadPDF?: () => void 
}> = ({ backlog, onUpdate, onDownloadPDF }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleEdit = (id: string, field: keyof BacklogItem, value: any) => {
    onUpdate(backlog.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      onUpdate(backlog.filter(item => item.id !== id));
    }
  };

  const handleAddStory = () => {
    const newId = `BL-${backlog.length + 1}`;
    const newItem: BacklogItem = {
      id: newId,
      title: 'New User Story',
      description: 'Describe the story here...',
      objective: '',
      acceptanceCriteria: [],
      priority: 'Medium',
      status: 'Backlog',
      type: 'User Story',
      estimate: 0
    };
    onUpdate([...backlog, newItem]);
    setSelectedItemId(newId);
  };

  const handleAddCriteria = (id: string) => {
    const item = backlog.find(i => i.id === id);
    if (item) {
      const newCriteria = [...(item.acceptanceCriteria || []), ''];
      handleEdit(id, 'acceptanceCriteria', newCriteria);
    }
  };

  const handleEditCriteria = (id: string, index: number, value: string) => {
    const item = backlog.find(i => i.id === id);
    if (item && item.acceptanceCriteria) {
      const newCriteria = [...item.acceptanceCriteria];
      newCriteria[index] = value;
      handleEdit(id, 'acceptanceCriteria', newCriteria);
    }
  };

  const handleRemoveCriteria = (id: string, index: number) => {
    const item = backlog.find(i => i.id === id);
    if (item && item.acceptanceCriteria) {
      const newCriteria = item.acceptanceCriteria.filter((_, i) => i !== index);
      handleEdit(id, 'acceptanceCriteria', newCriteria);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    let newItems: BacklogItem[] = [];

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      newItems = data.map((row, idx) => ({
        id: `BL-${backlog.length + idx + 1}`,
        title: row.Title || row.title || 'Untitled Story',
        description: row.Description || row.description || '',
        objective: row.Objective || row.objective || '',
        acceptanceCriteria: (row.AcceptanceCriteria || row.acceptanceCriteria || '').split('\n').filter((s: string) => s.trim().length > 0),
        priority: (row.Priority || row.priority || 'Medium') as any,
        status: (row.Status || row.status || 'Backlog') as any,
        type: (row.Type || row.type || 'User Story') as any,
        estimate: parseInt(row.Estimate || row.estimate) || 0
      }));
    } else if (fileName.endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        // Split by lines and filter empty ones
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        newItems = lines.map((line, idx) => {
          // Try to detect priority or type if present in brackets like [Bug] or [High]
          const typeMatch = line.match(/\[(Bug|User Story|Epic|Task)\]/i);
          const priorityMatch = line.match(/\[(Low|Medium|High|Critical)\]/i);
          
          let title = line;
          let type: any = 'User Story';
          let priority: any = 'Medium';
          
          if (typeMatch) {
            type = typeMatch[1];
            title = title.replace(typeMatch[0], '').trim();
          }
          if (priorityMatch) {
            priority = priorityMatch[1];
            title = title.replace(priorityMatch[0], '').trim();
          }

          return {
            id: `BL-${backlog.length + idx + 1}`,
            title: title.substring(0, 100),
            description: line,
            objective: '',
            acceptanceCriteria: [],
            priority,
            status: 'Backlog',
            type,
            estimate: 0
          };
        });
      } catch (err) {
        console.error("Word parsing error", err);
        alert("Failed to parse Word file.");
      }
    }
    
    if (newItems.length > 0) {
      onUpdate([...backlog, ...newItems]);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Product <span className="text-indigo-600">Backlog</span></h2>
        <div className="flex gap-2">
          <button onClick={handleAddStory} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4" /> Add Story
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.docx" onChange={handleFileUpload} />
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
              <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backlog.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                  Backlog is empty. Import from Excel to begin.
                </td>
              </tr>
            ) : backlog.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                  className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedItemId === item.id ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                >
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400 font-bold">{item.id}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={item.type}
                      onChange={(e) => handleEdit(item.id, 'type', e.target.value)}
                      className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border-none focus:ring-2 focus:ring-indigo-500/20 ${
                        item.type === 'Bug' ? 'bg-red-100 text-red-600' : 
                        item.type === 'Epic' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <option value="User Story">User Story</option>
                      <option value="Bug">Bug</option>
                      <option value="Task">Task</option>
                      <option value="Epic">Epic</option>
                    </select>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-800 text-sm"
                      value={item.title}
                      onChange={(e) => handleEdit(item.id, 'title', e.target.value)}
                    />
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-slate-400"
                      value={item.description}
                      onChange={(e) => handleEdit(item.id, 'description', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={item.priority}
                      onChange={(e) => handleEdit(item.id, 'priority', e.target.value)}
                      className={`text-[10px] font-bold bg-transparent border-none focus:ring-0 p-0 ${
                        item.priority === 'Critical' ? 'text-red-600' : 
                        item.priority === 'High' ? 'text-orange-600' : 'text-slate-500'
                      }`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={item.status}
                      onChange={(e) => handleEdit(item.id, 'status', e.target.value)}
                      className="text-[10px] font-bold text-slate-600 bg-transparent border-none focus:ring-0 p-0"
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="Ready">Ready</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="number"
                      className="w-12 bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-800 text-sm"
                      value={item.estimate || ''}
                      onChange={(e) => handleEdit(item.id, 'estimate', parseInt(e.target.value) || 0)}
                      placeholder="-"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedItemId(selectedItemId === item.id ? null : item.id); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${selectedItemId === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {item.status === 'Backlog' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdate(backlog.map(i => i.id === item.id ? { ...i, status: 'Ready' } : i)); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-black text-[10px] uppercase hover:bg-indigo-100 transition-all"
                        >
                          <Rocket className="w-3 h-3" /> Move to Board
                        </button>
                      )}
                      {item.status !== 'Backlog' && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> On Board
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {selectedItemId === item.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={7} className="px-12 py-6 border-b border-slate-100 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Business Objective</h4>
                            <textarea 
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 leading-relaxed min-h-[80px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                              value={item.objective || ''}
                              onChange={(e) => handleEdit(item.id, 'objective', e.target.value)}
                              placeholder="Describe the business objective..."
                            />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Description</h4>
                            <textarea 
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600 leading-relaxed min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                              value={item.description}
                              onChange={(e) => handleEdit(item.id, 'description', e.target.value)}
                              placeholder="Provide more details about this story..."
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceptance Criteria</h4>
                            <button 
                              onClick={() => handleAddCriteria(item.id)}
                              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                            >
                              Add Criteria
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(item.acceptanceCriteria || []).map((criteria, i) => (
                              <div key={i} className="flex items-start gap-2 group/criteria">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-3 shrink-0"></div>
                                <input 
                                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                  value={criteria}
                                  onChange={(e) => handleEditCriteria(item.id, i, e.target.value)}
                                />
                                <button 
                                  onClick={() => handleRemoveCriteria(item.id, i)}
                                  className="mt-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/criteria:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {(!item.acceptanceCriteria || item.acceptanceCriteria.length === 0) && (
                              <p className="text-sm text-slate-400 italic">No acceptance criteria defined.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);

  const moveItem = (id: string, newStatus: BacklogItem['status']) => {
    onUpdateBacklog(backlog.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleEdit = (id: string, field: keyof BacklogItem, value: any) => {
    onUpdateBacklog(backlog.map(item => item.id === id ? { ...item, [field]: value } : item));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, [field]: value });
    }
  };

  const handleAddCriteria = (id: string) => {
    const item = backlog.find(i => i.id === id);
    if (item) {
      const newCriteria = [...(item.acceptanceCriteria || []), ''];
      handleEdit(id, 'acceptanceCriteria', newCriteria);
    }
  };

  const handleEditCriteria = (id: string, index: number, value: string) => {
    const item = backlog.find(i => i.id === id);
    if (item && item.acceptanceCriteria) {
      const newCriteria = [...item.acceptanceCriteria];
      newCriteria[index] = value;
      handleEdit(id, 'acceptanceCriteria', newCriteria);
    }
  };

  const handleRemoveCriteria = (id: string, index: number) => {
    const item = backlog.find(i => i.id === id);
    if (item && item.acceptanceCriteria) {
      const newCriteria = item.acceptanceCriteria.filter((_, i) => i !== index);
      handleEdit(id, 'acceptanceCriteria', newCriteria);
    }
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      onUpdateBacklog(backlog.filter(item => item.id !== id));
      setSelectedItem(null);
    }
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
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
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
                       {col === 'Ready' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); moveItem(item.id, 'Backlog'); }}
                           className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                           title="Move back to Backlog"
                         >
                           <History className="w-3.5 h-3.5" />
                         </button>
                       )}
                       {col !== 'Done' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); moveItem(item.id, col === 'Ready' ? 'In Progress' : 'Done'); }}
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

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
              <div className="space-y-1 flex-1 mr-4">
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedItem.type}
                    onChange={(e) => handleEdit(selectedItem.id, 'type', e.target.value)}
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border-none focus:ring-2 focus:ring-indigo-500/20 ${
                      selectedItem.type === 'Bug' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    <option value="User Story">User Story</option>
                    <option value="Bug">Bug</option>
                    <option value="Task">Task</option>
                    <option value="Epic">Epic</option>
                  </select>
                  <span className="text-xs font-mono text-slate-400 font-bold">{selectedItem.id}</span>
                </div>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-2xl font-black text-slate-900"
                  value={selectedItem.title}
                  onChange={(e) => handleEdit(selectedItem.id, 'title', e.target.value)}
                />
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</div>
                  <select 
                    value={selectedItem.priority}
                    onChange={(e) => handleEdit(selectedItem.id, 'priority', e.target.value)}
                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold ${
                      selectedItem.priority === 'Critical' ? 'text-red-600' : 
                      selectedItem.priority === 'High' ? 'text-orange-600' : 'text-slate-700'
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimate (Points)</div>
                  <input 
                    type="number"
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-slate-700"
                    value={selectedItem.estimate || 0}
                    onChange={(e) => handleEdit(selectedItem.id, 'estimate', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Business Objective</h4>
                  <textarea 
                    className="w-full bg-indigo-50/30 border border-indigo-50 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[80px]"
                    value={selectedItem.objective || ''}
                    onChange={(e) => handleEdit(selectedItem.id, 'objective', e.target.value)}
                    placeholder="Describe the business objective..."
                  />
                </div>
                
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                  <textarea 
                    className="w-full bg-transparent border border-slate-100 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[120px]"
                    value={selectedItem.description}
                    onChange={(e) => handleEdit(selectedItem.id, 'description', e.target.value)}
                    placeholder="Provide more details about this story..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceptance Criteria</h4>
                    <button 
                      onClick={() => handleAddCriteria(selectedItem.id)}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      Add Criteria
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(selectedItem.acceptanceCriteria || []).map((criteria, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group/criteria">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </div>
                        <input 
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600"
                          value={criteria}
                          onChange={(e) => handleEditCriteria(selectedItem.id, i, e.target.value)}
                        />
                        <button 
                          onClick={() => handleRemoveCriteria(selectedItem.id, i)}
                          className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/criteria:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(!selectedItem.acceptanceCriteria || selectedItem.acceptanceCriteria.length === 0) && (
                      <p className="text-sm text-slate-400 italic">No acceptance criteria defined.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={() => handleRemove(selectedItem.id)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Story
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
                >
                  Close
                </button>
                {selectedItem.status !== 'Done' && (
                  <button 
                    onClick={() => {
                      const nextStatus = selectedItem.status === 'Ready' ? 'In Progress' : 'Done';
                      moveItem(selectedItem.id, nextStatus);
                      setSelectedItem(null);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                  >
                    Move to {selectedItem.status === 'Ready' ? 'In Progress' : 'Done'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ResourceDashboardView component
export const ResourceDashboardView: React.FC<{ projects: ProjectAssets[] }> = ({ projects }) => {
  const allResources = projects.flatMap(p => p.resources || []);
  const uniqueResources = Array.from(new Map(allResources.map(r => [r.email, r])).values());
  
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + p.activities.length, 0);
  const activeResourcesCount = uniqueResources.length;
  
  // Calculate utilization based on task assignment
  const totalAssignedTasks = projects.reduce((acc, p) => 
    acc + p.activities.filter(a => (a.assignedResources || []).length > 0).length, 0
  );
  const utilization = totalTasks > 0 ? Math.round((totalAssignedTasks / totalTasks) * 100) : 0;
  
  const roles = uniqueResources.reduce((acc, r) => {
    const role = (r as Resource).role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const roleData = Object.entries(roles).map(([role, count]) => ({
    role,
    count,
    color: role.includes('Architect') ? 'bg-indigo-500' : 
           role.includes('Engineer') ? 'bg-blue-500' : 
           role.includes('Manager') ? 'bg-amber-500' : 'bg-emerald-500'
  }));

  const resourceStats = uniqueResources.map(res => {
    const r = res as Resource;
    const assignedTasks = projects.reduce((acc, p) => 
      acc + p.activities.filter(a => {
        const assignedEmails = (a.assignedResources || []).map(id => {
          const pr = p.resources?.find(r => r.id === id);
          return pr?.email;
        });
        return assignedEmails.includes(r.email);
      }).length, 0
    );
    return { ...r, assignedTasks };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Resource <span className="text-indigo-600">Intelligence</span></h1>
          <p className="text-slate-500">Monitor team allocation and capacity across BSS-PMO</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Users className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{activeResourcesCount}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Team</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><PieChart className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{utilization}%</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Utilization</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalProjects}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Project Load</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalTasks}</div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Tasks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" />Team Allocation</h3>
          <div className="space-y-6">
            {roleData.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic">No resources assigned to any projects yet.</div>
            ) : roleData.map((role, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-600">{role.role}</span>
                  <span className="text-slate-900">{role.count} Members</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${role.color}`} style={{ width: `${(role.count / activeResourcesCount) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-center">
          <h3 className="font-bold text-xl mb-4">Resource Optimization</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            "Ahmed, current resource metrics indicate a utilization rate of {utilization}% across the portfolio. {utilization > 80 ? 'The team is approaching capacity limits. Consider prioritizing critical path activities.' : 'There is available capacity for new architectural deconstructions.'}"
          </p>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Optimization Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2"><TrendingUp className="w-6 h-6 text-indigo-600" />Team Capacity Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 border-b border-slate-100">Team Member</th>
                <th className="px-6 py-5 border-b border-slate-100">Role</th>
                <th className="px-6 py-5 border-b border-slate-100">Task Load</th>
                <th className="px-6 py-5 border-b border-slate-100">Availability</th>
                <th className="px-6 py-5 border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resourceStats.map((res, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                        {res.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{res.name}</div>
                        <div className="text-xs text-slate-400">{res.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-bold text-slate-600 text-sm">{res.role}</td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800">{res.assignedTasks}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                        <div className={`h-full ${res.availability > 70 ? 'bg-emerald-500' : res.availability > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${res.availability}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-500">{res.availability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      res.assignedTasks > 5 ? 'bg-red-100 text-red-600' : res.assignedTasks > 2 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {res.assignedTasks > 5 ? 'Overloaded' : res.assignedTasks > 2 ? 'Busy' : 'Available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ResourceProjectsView component
export const ResourceProjectsView: React.FC<{ 
  projects: ProjectAssets[],
  onOpenProject: (id: string) => void
}> = ({ projects, onOpenProject }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Resource <span className="text-indigo-600">Projects</span></h1>
          <p className="text-slate-500">Project-specific resource mapping and allocation</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 border-b border-slate-100">Project Name</th>
                <th className="px-6 py-5 border-b border-slate-100">Assigned Team</th>
                <th className="px-6 py-5 border-b border-slate-100">Task Load</th>
                <th className="px-6 py-5 border-b border-slate-100">Status</th>
                <th className="px-6 py-5 border-b border-slate-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-bold italic">
                    No projects detected in the portfolio.
                  </td>
                </tr>
              ) : projects.map((project) => (
                <tr 
                  key={project.id} 
                  onClick={() => onOpenProject(project.id)}
                  className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase className="w-4 h-4" /></div>
                      <span className="font-bold text-slate-800">{project.metadata.projectName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex -space-x-2">
                      {(project.resources || []).length > 0 ? (
                        project.resources?.slice(0, 3).map((res, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500" title={res.name}>
                            {res.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">No resources</div>
                      )}
                      {(project.resources || []).length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          +{(project.resources || []).length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (project.activities.length / 10) * 100)}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{project.activities.length} Tasks</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      project.isArchived ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {project.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ProjectResourcesView: React.FC<{ 
  resources: Resource[], 
  activities: Activity[],
  onUpdate: (resources: Resource[]) => void 
}> = ({ resources, activities, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    name: '',
    email: '',
    role: 'Solution Architect',
    availability: 100
  });

  const handleAdd = () => {
    if (!newResource.name || !newResource.email) return;
    onUpdate([...resources, { ...newResource as Resource, id: `RES-${Date.now()}` }]);
    setIsAdding(false);
    setNewResource({ name: '', email: '', role: 'Solution Architect', availability: 100 });
  };

  const handleRemove = (id: string) => {
    onUpdate(resources.filter(r => r.id !== id));
  };

  const handleEdit = (id: string, field: keyof Resource, value: any) => {
    onUpdate(resources.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const getTaskCount = (resourceId: string) => {
    return activities.filter(a => (a.assignedResources || []).includes(resourceId)).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Project <span className="text-indigo-600">Resources</span></h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-xl shadow-indigo-50 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={newResource.email}
                onChange={(e) => setNewResource({ ...newResource, email: e.target.value })}
                placeholder="e.g. john@bssconnects.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={newResource.role}
                onChange={(e) => setNewResource({ ...newResource, role: e.target.value })}
              >
                <option value="Solution Architect">Solution Architect</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Fullstack Engineer">Fullstack Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Product Owner">Product Owner</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="Security Specialist">Security Specialist</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Add</button>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"><X className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res) => {
          const taskCount = getTaskCount(res.id);
          return (
            <div key={res.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative">
              <button 
                onClick={() => handleRemove(res.id)}
                className="absolute top-4 right-4 p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-black">
                  {res.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-black text-slate-800 text-lg"
                    value={res.name}
                    onChange={(e) => handleEdit(res.id, 'name', e.target.value)}
                  />
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs font-bold text-indigo-600"
                    value={res.email}
                    onChange={(e) => handleEdit(res.id, 'email', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                      value={res.role}
                      onChange={(e) => handleEdit(res.id, 'role', e.target.value)}
                    >
                      <option value="Solution Architect">Solution Architect</option>
                      <option value="Frontend Engineer">Frontend Engineer</option>
                      <option value="Backend Engineer">Backend Engineer</option>
                      <option value="Fullstack Engineer">Fullstack Engineer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Product Owner">Product Owner</option>
                      <option value="QA Engineer">QA Engineer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Business Analyst">Business Analyst</option>
                      <option value="Security Specialist">Security Specialist</option>
                    </select>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks</div>
                    <div className="text-sm font-black text-slate-800">{taskCount}</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <span>Availability</span>
                    <span>{res.availability}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                    value={res.availability}
                    onChange={(e) => handleEdit(res.id, 'availability', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {resources.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No resources assigned to this project.</p>
          <button onClick={() => setIsAdding(true)} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Add First Resource</button>
        </div>
      )}
    </div>
  );
};

export { FolderOpen };
