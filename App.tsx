
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { generateProjectAssets, analyzeExcelDocument, analyzeWBSFromExcel } from './geminiService';
import { ProjectAssets, AssetType, Activity, RiskItem, HLDComponent, LLDComponent } from './types';
import { WBSView, HLDView, LLDView, RoadmapView, DashboardView, ActivityTableView, RiskLogView, GlobalDashboardView, FolderOpen, BacklogView, ScrumBoardView, ResourceDashboardView, ResourceProjectsView, DependencyView, ProjectResourcesView, WeeklyStatusView } from './components/AssetViews';
import { Upload, Wand2, FileText, LayoutList, Share2, Download, Loader2, AlertCircle, Calendar, FileType, X, CheckCircle2, LayoutDashboard, Layers, Activity as ActivityIcon, Terminal, TableProperties, ShieldAlert, Rocket, ArrowRight, User, Briefcase, Plus, FileBarChart, Kanban, ListTodo, Link2, Users, LogOut, Lock } from 'lucide-react';
import { auth, db, signIn, logout, UserProfile } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where, getDoc } from 'firebase/firestore';

// Dynamic imports
import * as PDFJS from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

PDFJS.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

type AppStep = 'GLOBAL_DASHBOARD' | 'PROJECT_SETUP' | 'REQUIREMENTS' | 'RESULTS';

const STORAGE_KEY = 'bssconnects_projects';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('GLOBAL_DASHBOARD');
  const [projects, setProjects] = useState<ProjectAssets[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetType>('DASHBOARD');
  const [sidebarView, setSidebarView] = useState<'dashboard' | 'projects' | 'resource_dashboard' | 'resource_projects'>('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Firebase Auth & Data Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data() as UserProfile);
        } else {
          // Fallback if profile wasn't created during signIn call
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            role: firebaseUser.email === 'oliver.nabil17@gmail.com' ? 'admin' : 'resource'
          };
          await setDoc(userRef, profile);
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }

    let q;
    if (user.role === 'admin') {
      q = collection(db, 'projects');
    } else {
      q = query(collection(db, 'projects'), where('assignedEmails', 'array-contains', user.email));
    }

    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => doc.data() as ProjectAssets);
      setProjects(projs);
    });

    return () => unsubscribeProjects();
  }, [user]);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error(err);
      setError('Login failed.');
    }
  };

  const handleWBSAnalysis = async (excelData: Record<string, any[]>) => {
    if (!currentProjectId) return;
    setIsProcessing(true);
    try {
      const newWbs = await analyzeWBSFromExcel(currentProject.metadata.projectName, excelData);
      updateCurrentProject({ wbs: newWbs });
    } catch (error) {
      console.error('WBS Analysis failed:', error);
      setError('Failed to analyze WBS from Excel. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuperAnalysis = async (excelData: Record<string, any[]>) => {
    if (!currentProject || !user || !currentProjectId) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await analyzeExcelDocument(currentProject.metadata.projectName, excelData);
      
      // Inject unique IDs for HLD/LLD
      const hldWithIds = result.hld.map(h => ({ ...h, id: crypto.randomUUID() }));
      const lldWithIds = result.lld.map(l => ({ ...l, id: crypto.randomUUID() }));
      
      // Update the existing project with the analyzed data
      // We merge it with existing metadata and keep the same ID/owner
      await setDoc(doc(db, 'projects', currentProjectId), {
        ...result,
        id: currentProjectId,
        hld: hldWithIds,
        lld: lldWithIds,
        ownerId: currentProject.ownerId,
        assignedEmails: currentProject.assignedEmails || [],
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError('Super Analysis failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const loadingTask = PDFJS.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsFileLoading(true);
    setError(null);
    const fileList: File[] = Array.from(files);
    let combinedText = requirements;
    const newFileNames: string[] = [...uploadedFiles];
    try {
      for (const file of fileList) {
        const arrayBuffer = await file.arrayBuffer();
        const fileName = file.name;
        const fileNameLower = fileName.toLowerCase();
        let extractedText = '';
        if (fileNameLower.endsWith('.pdf')) extractedText = await extractTextFromPDF(arrayBuffer);
        else if (fileNameLower.endsWith('.docx')) extractedText = (await mammoth.extractRawText({ arrayBuffer })).value;
        else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls')) {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          workbook.SheetNames.forEach(sheetName => {
            extractedText += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
          });
        }
        else extractedText = await file.text();
        combinedText += `\n\n--- Source: ${fileName} ---\n${extractedText}\n`;
        newFileNames.push(fileName);
      }
      setRequirements(combinedText);
      setUploadedFiles(newFileNames);
    } catch (err) {
      console.error(err);
      setError('File parsing error.');
    } finally {
      setIsFileLoading(false);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!requirements.trim() || !user) { setError('Provide requirements.'); return; }
    setError(null);
    setIsProcessing(true);
    try {
      const result = await generateProjectAssets(projectName, requirements);
      // Inject unique IDs for HLD/LLD
      result.hld = result.hld.map(h => ({ ...h, id: crypto.randomUUID() }));
      result.lld = result.lld.map(l => ({ ...l, id: crypto.randomUUID() }));
      result.ownerId = user.uid;
      result.assignedEmails = [];
      
      await setDoc(doc(db, 'projects', result.id), result);
      setCurrentProjectId(result.id);
      setStep('RESULTS');
      setActiveTab('DASHBOARD');
      setProjectName('');
      setRequirements('');
      setUploadedFiles([]);
    } catch (err) {
      console.error(err);
      setError('AI Analysis failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCurrentProject = async (updates: Partial<ProjectAssets>) => {
    if (!currentProjectId || !user) return;
    
    // Check if resource is trying to update something they shouldn't
    if (user.role === 'resource') {
      const allowedKeys = ['activities', 'backlog', 'weeklyStatus'];
      const keys = Object.keys(updates);
      if (keys.some(k => !allowedKeys.includes(k))) {
        setError('Limited authority: You can only update activities, backlog, or status.');
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'projects', currentProjectId), {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError('Failed to update project.');
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.role !== 'admin') {
      setError('Only admins can delete projects.');
      return;
    }
    if (confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        if (currentProjectId === id) {
          setCurrentProjectId(null);
          setStep('GLOBAL_DASHBOARD');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to delete project.');
      }
    }
  };

  const toggleArchiveProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    try {
      await updateDoc(doc(db, 'projects', id), {
        isArchived: !proj.isArchived,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError('Failed to archive project.');
    }
  };

  const notifyResource = async (email: string, projectName: string, taskName?: string) => {
    try {
      await fetch('/api/notify-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          projectName,
          taskName,
          role: 'Resource',
          projectUrl: window.location.origin
        })
      });
    } catch (err) {
      console.error("Failed to send notification", err);
    }
  };

  const handleExportPDF = (type: AssetType | 'FULL' = 'FULL') => {
    if (!currentProject) return;
    const assets = currentProject;
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    const checkPage = (heightNeeded: number) => {
      if (currentY + heightNeeded > 280) {
        doc.addPage();
        currentY = 20;
      }
    };

    const addDocControl = () => {
      doc.setFillColor(30, 41, 59);
      doc.rect(14, currentY, pageWidth - 28, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('Inter', 'bold');
      doc.text('BSS-PMO MASTER PROJECT REPORT', 18, currentY + 12);
      doc.setFontSize(10);
      doc.setFont('Inter', 'normal');
      doc.text(`Project Identity: ${assets.metadata.projectName}`, 18, currentY + 22);
      doc.text(`Master Architect: Ahmed Nabil`, 18, currentY + 28);
      doc.text(`Organization: ${assets.metadata.organization}`, 18, currentY + 34);
      doc.text(`Generation Date: ${assets.metadata.date}`, 18, currentY + 40);
      doc.text(`Ref ID: ${assets.id.slice(0, 13)}`, 130, currentY + 22);
      doc.text(`Status: ${assets.isArchived ? 'ARCHIVED' : 'ACTIVE'}`, 130, currentY + 28);
      currentY += 60;
    };

    const addTitle = (title: string, color = [30, 41, 59]) => {
      checkPage(20);
      doc.setFontSize(14);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont('Inter', 'bold');
      doc.text(title.toUpperCase(), 14, currentY);
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.5);
      doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
      currentY += 12;
    };

    addDocControl();

    // 1. Executive Summary
    if (type === 'FULL' || type === 'DASHBOARD') {
      addTitle('1. Executive Summary');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.setFont('Inter', 'normal');
      const summaryLines = doc.splitTextToSize(assets.summary, pageWidth - 28);
      doc.text(summaryLines, 14, currentY);
      currentY += (summaryLines.length * 5) + 15;
    }

    // 2. WBS
    if (type === 'FULL' || type === 'WBS') {
      addTitle('2. Work Breakdown Structure (WBS)');
      const wbsData = assets.wbs.flatMap(item => [
        [item.id, item.reqId, item.title, ''],
        ...(item.subtasks?.map(task => ['', '', '', `• ${task}`]) || [])
      ]);
      doc.autoTable({ 
        startY: currentY, 
        head: [['ID', 'Req ID', 'Milestone/Component', 'Specific Tasks']], 
        body: wbsData, 
        headStyles: { fillColor: [79, 70, 229] },
        theme: 'striped',
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 3. HLD
    if (type === 'FULL' || type === 'HLD') {
      addTitle('3. High-Level Architecture (HLD)');
      const hldData = assets.hld.map(c => [c.name, c.description, c.techStack.join(', '), c.isApproved ? 'Approved' : 'Pending']);
      doc.autoTable({ 
        startY: currentY, 
        head: [['Component', 'Functional Description', 'Technology Stack', 'Governance']], 
        body: hldData, 
        headStyles: { fillColor: [30, 41, 59] },
        theme: 'grid',
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 4. LLD
    if (type === 'FULL' || type === 'LLD') {
      addTitle('4. Low-Level Design (LLD)');
      const lldData = assets.lld.map(c => [c.moduleName, c.details, c.dependencies.join(', ')]);
      doc.autoTable({ 
        startY: currentY, 
        head: [['Module', 'Technical Details', 'System Dependencies']], 
        body: lldData, 
        headStyles: { fillColor: [245, 158, 11] },
        theme: 'grid',
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 5. Implementation Schedule
    if (type === 'FULL' || type === 'ACTIVITIES') {
      addTitle('5. Implementation Schedule');
      const actData = assets.activities.map(a => [a.id, a.task, a.status, a.startDate, a.duration + ' Days']);
      doc.autoTable({ 
        startY: currentY, 
        head: [['Task ID', 'Activity Name', 'Execution Status', 'Target Start', 'Duration']], 
        body: actData, 
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 6. Roadmap
    if (type === 'FULL' || type === 'ROADMAP') {
      addTitle('6. Strategic Roadmap');
      const roadmapData = assets.roadmap.map(p => [
        p.phaseName, 
        p.duration, 
        p.milestones.map(m => `• ${m.title}${m.dependency ? ` (Dep: ${m.dependency})` : ''}`).join('\n')
      ]);
      doc.autoTable({ 
        startY: currentY, 
        head: [['Phase', 'Estimated Duration', 'Key Milestones & Dependencies']], 
        body: roadmapData, 
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 7. Dependencies
    if (type === 'FULL' || type === 'DEPENDENCIES') {
      addTitle('7. Project Dependencies');
      const depData = (assets.dependencies || []).map(d => [d.id, d.type, d.from, d.to]);
      doc.autoTable({ 
        startY: currentY, 
        head: [['ID', 'Type', 'Source (Depends On)', 'Target (Impacted Item)']], 
        body: depData, 
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 8. Weekly Status
    if (type === 'FULL' || type === 'WEEKLY_STATUS') {
      const status = assets.weeklyStatus || { headline: 'No status available', accomplishments: [], focusNextWeek: [] };
      addTitle('8. Weekly Status Update');
      
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.setFont('Inter', 'bold');
      doc.text('KEY HEADLINE:', 14, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setFont('Inter', 'normal');
      doc.setTextColor(71, 85, 105);
      const headlineLines = doc.splitTextToSize(status.headline, pageWidth - 28);
      doc.text(headlineLines, 14, currentY);
      currentY += (headlineLines.length * 5) + 10;

      checkPage(40);
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.setFont('Inter', 'bold');
      doc.text('KEY ACCOMPLISHMENTS (LAST WEEK):', 14, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setFont('Inter', 'normal');
      doc.setTextColor(71, 85, 105);
      status.accomplishments.forEach(acc => {
        checkPage(10);
        const lines = doc.splitTextToSize(`• ${acc}`, pageWidth - 28);
        doc.text(lines, 14, currentY);
        currentY += (lines.length * 5) + 2;
      });
      currentY += 8;

      checkPage(40);
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.setFont('Inter', 'bold');
      doc.text('FOCUS FOR NEXT WEEK:', 14, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setFont('Inter', 'normal');
      doc.setTextColor(71, 85, 105);
      status.focusNextWeek.forEach(focus => {
        checkPage(10);
        const lines = doc.splitTextToSize(`• ${focus}`, pageWidth - 28);
        doc.text(lines, 14, currentY);
        currentY += (lines.length * 5) + 2;
      });
      currentY += 15;
    }

    // 9. Risk Log
    if (type === 'FULL' || type === 'RISK_LOG') {
      addTitle('9. Risk & Mitigation Log');
      const riskData = assets.riskLog.map(r => [r.id, r.category, r.description, r.impact, r.mitigation]);
      doc.autoTable({ 
        startY: currentY, 
        head: [['ID', 'Category', 'Description', 'Impact', 'Mitigation Strategy']], 
        body: riskData, 
        headStyles: { fillColor: [220, 38, 38] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 10. Agile Backlog
    if (type === 'FULL' || type === 'BACKLOG') {
      addTitle('10. Agile Product Backlog');
      const backlogData = (assets.backlog || []).map(b => [b.id, b.type, b.title, b.priority, b.status, b.estimate || '-']);
      doc.autoTable({ 
        startY: currentY, 
        head: [['ID', 'Type', 'Title', 'Priority', 'Status', 'Points']], 
        body: backlogData, 
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    // 11. Resource Allocation
    if (type === 'FULL' || type === 'RESOURCES') {
      addTitle('11. Resource Allocation Matrix');
      const resData = (assets.resources || []).map(r => [r.id, r.name, r.role, r.availability + '%']);
      doc.autoTable({ 
        startY: currentY, 
        head: [['ID', 'Name', 'Role', 'Availability']], 
        body: resData, 
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }

    const fileName = type === 'FULL' ? `BSS-PMO_FULL_REPORT_${assets.metadata.projectName.replace(/\s+/g, '_')}.pdf` : `BSS-PMO_${type}_${assets.metadata.projectName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 border border-slate-100">
              <img 
                src="/logo.svg" 
                alt="BSS-PMO Logo" 
                className="w-16 h-16 object-contain" 
                onError={(e) => {
                  e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=BSS&backgroundColor=4f46e5';
                }}
              />
            </div>
            <h1 className="text-4xl font-black text-slate-900">BSS-PMO <span className="text-indigo-600">Architect</span></h1>
            <p className="text-slate-500">Secure access to the Solution Architecture & PMO Infrastructure.</p>
          </div>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-white border border-slate-200 p-6 rounded-[32px] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-xl shadow-indigo-100 group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-black text-slate-900">Sign in with Google</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enterprise Authentication</div>
            </div>
          </button>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authorized Personnel Only</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeView={sidebarView}
      user={user}
      onLogout={logout}
      onViewChange={(view) => {
        setSidebarView(view);
        setStep('GLOBAL_DASHBOARD');
        setCurrentProjectId(null);
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {step === 'GLOBAL_DASHBOARD' && sidebarView === 'dashboard' && (
          <GlobalDashboardView 
            projects={projects} 
            viewMode="dashboard"
            onOpenProject={(id) => { setCurrentProjectId(id); setStep('RESULTS'); setActiveTab('DASHBOARD'); }}
            onDeleteProject={deleteProject}
            onToggleArchive={toggleArchiveProject}
            onNewProject={() => setStep('PROJECT_SETUP')}
          />
        )}

        {step === 'GLOBAL_DASHBOARD' && sidebarView === 'projects' && (
          <GlobalDashboardView 
            projects={projects} 
            viewMode="projects"
            onOpenProject={(id) => { setCurrentProjectId(id); setStep('RESULTS'); setActiveTab('DASHBOARD'); }}
            onDeleteProject={deleteProject}
            onToggleArchive={toggleArchiveProject}
            onNewProject={() => setStep('PROJECT_SETUP')}
          />
        )}

        {step === 'GLOBAL_DASHBOARD' && sidebarView === 'resource_dashboard' && (
          <ResourceDashboardView projects={projects} />
        )}

        {step === 'GLOBAL_DASHBOARD' && sidebarView === 'resource_projects' && (
          <ResourceProjectsView 
            projects={projects} 
            onOpenProject={(id) => {
              setCurrentProjectId(id);
              setStep('RESULTS');
              setActiveTab('RESOURCES');
            }}
          />
        )}

        {step === 'PROJECT_SETUP' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in duration-500">
             <div className="space-y-4">
                <div className="inline-flex p-4 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 border border-slate-100">
                   <img 
                     src="/logo.svg" 
                     alt="BSS-PMO Logo" 
                     className="w-16 h-16 object-contain" 
                     onError={(e) => {
                       e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=BSS&backgroundColor=4f46e5';
                     }}
                   />
                </div>
                <h1 className="text-4xl font-black text-slate-900">New <span className="text-indigo-600">Infrastructure</span></h1>
                <p className="text-slate-500 max-w-md mx-auto">Ahmed, enter the project identity to begin architectural deconstruction.</p>
             </div>
             
             <div className="bg-white p-3 rounded-3xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-3 w-full max-w-lg">
                <input 
                  type="text" 
                  placeholder="Project Identity (e.g. OCS Migration)" 
                  className="flex-1 px-6 py-4 bg-transparent border-none focus:ring-0 text-lg font-bold"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => projectName && setStep('REQUIREMENTS')}
                  disabled={!projectName}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  Confirm <ArrowRight className="w-5 h-5" />
                </button>
             </div>
             <button onClick={() => setStep('GLOBAL_DASHBOARD')} className="text-slate-400 hover:text-indigo-600 text-xs font-black uppercase tracking-widest">Back to Portfolio</button>
          </div>
        )}

        {step === 'REQUIREMENTS' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <button onClick={() => setStep('PROJECT_SETUP')} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{projectName}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Architectural Input Hub</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
                    {isFileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Dossier Upload</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md" multiple />
                  </label>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[40px] p-2 shadow-sm ring-8 ring-slate-100/50">
              <textarea
                className="w-full h-80 p-8 bg-transparent resize-none border-none focus:ring-0 text-slate-800 text-lg font-medium leading-relaxed"
                placeholder="Ahmed, paste the OCS or BSS Functional requirements here..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 rounded-b-[38px] flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((f, i) => <span key={i} className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full uppercase">{f}</span>)}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || isFileLoading || !requirements.trim()}
                  className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
                  <span>Deconstruct Assets</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'RESULTS' && currentProject && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl flex flex-col md:flex-row justify-between gap-8 items-center border border-slate-800">
              <div className="flex items-center gap-6">
                <button onClick={() => setStep('GLOBAL_DASHBOARD')} className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"><FolderOpen className="w-6 h-6 text-indigo-400" /></button>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">{currentProject.metadata.projectName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${currentProject.isArchived ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
                      {currentProject.isArchived ? 'Archive' : 'Active'}
                    </span>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">BSS-PMO Output • ID: {currentProject.id.slice(0,8)}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleExportPDF('FULL')} 
                className="group flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[24px] font-black hover:bg-white hover:text-indigo-600 transition-all shadow-2xl shadow-indigo-900 active:scale-95"
              >
                <FileBarChart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] uppercase opacity-60 tracking-tighter">Execute Master Action</div>
                  <div className="text-sm">Generate Full Report</div>
                </div>
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-[28px] w-fit shadow-sm overflow-x-auto">
                {[
                  { id: 'DASHBOARD', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
                  { id: 'BACKLOG', icon: <ListTodo className="w-5 h-5" />, label: 'Backlog' },
                  { id: 'SCRUM', icon: <Kanban className="w-5 h-5" />, label: 'Scrum Board' },
                  { id: 'WBS', icon: <LayoutList className="w-5 h-5" />, label: 'WBS' },
                  { id: 'HLD', icon: <Layers className="w-5 h-5" />, label: 'HLD' },
                  { id: 'LLD', icon: <Terminal className="w-5 h-5" />, label: 'LLD' },
                  { id: 'ACTIVITIES', icon: <TableProperties className="w-5 h-5" />, label: 'Schedule' },
                  { id: 'ROADMAP', icon: <Calendar className="w-5 h-5" />, label: 'Roadmap' },
                  { id: 'WEEKLY_STATUS', icon: <FileText className="w-5 h-5" />, label: 'Weekly Status' },
                  { id: 'DEPENDENCIES', icon: <Link2 className="w-5 h-5" />, label: 'Dependencies' },
                  { id: 'RESOURCES', icon: <Users className="w-5 h-5" />, label: 'Resources' },
                  { id: 'RISK_LOG', icon: <ShieldAlert className="w-5 h-5" />, label: 'Risks' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AssetType)} 
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-[500px]">
                {activeTab === 'DASHBOARD' && (
                  <DashboardView 
                    assets={currentProject} 
                    onArchive={() => updateCurrentProject({ isArchived: true })}
                    onDownloadPDF={() => handleExportPDF('DASHBOARD')}
                    onNavigate={(tab) => setActiveTab(tab)}
                  />
                )}
                {activeTab === 'BACKLOG' && (
                  <BacklogView 
                    backlog={currentProject.backlog || []} 
                    onUpdate={(items) => updateCurrentProject({ backlog: items })} 
                    onDownloadPDF={() => handleExportPDF('BACKLOG')}
                  />
                )}
                {activeTab === 'SCRUM' && (
                  <ScrumBoardView 
                    backlog={currentProject.backlog || []} 
                    sprints={currentProject.sprints || []} 
                    onUpdateBacklog={(items) => updateCurrentProject({ backlog: items })} 
                  />
                )}
                {activeTab === 'WBS' && (
                  <WBSView 
                    items={currentProject.wbs} 
                    onUpdate={(items) => updateCurrentProject({ wbs: items })} 
                    onDownloadPDF={() => handleExportPDF('WBS')} 
                    onAIAnalysis={handleWBSAnalysis}
                    isProcessing={isProcessing}
                  />
                )}
                {activeTab === 'HLD' && <HLDView components={currentProject.hld} onUpdate={(comps) => updateCurrentProject({ hld: comps })} onDownloadPDF={() => handleExportPDF('HLD')} />}
                {activeTab === 'LLD' && <LLDView components={currentProject.lld} onUpdate={(comps) => updateCurrentProject({ lld: comps })} onDownloadPDF={() => handleExportPDF('LLD')} />}
                {activeTab === 'ACTIVITIES' && (
                  <ActivityTableView 
                    activities={currentProject.activities} 
                    resources={currentProject.resources || []}
                    dependencies={currentProject.dependencies || []}
                    isReadOnly={user?.role === 'resource'}
                    currentUserEmail={user?.email || ''}
                    isProcessing={isProcessing}
                    onSuperAnalysis={handleSuperAnalysis}
                    onUpdate={(a) => {
                      // Check for new assignments to trigger email
                      const oldActivities = currentProject.activities;
                      a.forEach(newAct => {
                        const oldAct = oldActivities.find(oa => oa.id === newAct.id);
                        const newResources = newAct.assignedResources || [];
                        const oldResources = oldAct?.assignedResources || [];
                        
                        // Find newly added resources
                        const added = newResources.filter(rId => !oldResources.includes(rId));
                        added.forEach(rId => {
                          const resource = currentProject.resources.find(r => r.id === rId);
                          if (resource && resource.email) {
                            notifyResource(resource.email, currentProject.metadata.projectName, newAct.task);
                          }
                        });
                      });

                      // Update assignedEmails for security rules
                      const allAssignedEmails = Array.from(new Set(
                        a.flatMap(act => (act.assignedResources || []).map(rId => currentProject.resources.find(r => r.id === rId)?.email).filter(Boolean))
                      )) as string[];

                      updateCurrentProject({ activities: a, assignedEmails: allAssignedEmails });
                    }} 
                    onDownloadPDF={() => handleExportPDF('ACTIVITIES')} 
                  />
                )}
                {activeTab === 'ROADMAP' && <RoadmapView phases={currentProject.roadmap} dependencies={currentProject.dependencies || []} onUpdate={(phases) => updateCurrentProject({ roadmap: phases })} onDownloadPDF={() => handleExportPDF('ROADMAP')} />}
                {activeTab === 'WEEKLY_STATUS' && (
                  <WeeklyStatusView 
                    status={currentProject.weeklyStatus || { headline: '', accomplishments: [], focusNextWeek: [] }} 
                    onUpdate={(status) => updateCurrentProject({ weeklyStatus: status })} 
                  />
                )}
                {activeTab === 'DEPENDENCIES' && <DependencyView assets={currentProject} onUpdate={(deps) => updateCurrentProject({ dependencies: deps })} onDownloadPDF={() => handleExportPDF('DEPENDENCIES')} />}
                {activeTab === 'RESOURCES' && (
                  <ProjectResourcesView 
                    resources={currentProject.resources || []} 
                    activities={currentProject.activities || []}
                    onUpdate={(resources) => updateCurrentProject({ resources })} 
                  />
                )}
                {activeTab === 'RISK_LOG' && <RiskLogView risks={currentProject.riskLog} onUpdate={(r) => updateCurrentProject({ riskLog: r })} onDownloadPDF={() => handleExportPDF('RISK_LOG')} />}
              </div>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4"><AlertCircle className="w-6 h-6" /><p className="font-black text-sm uppercase tracking-widest">{error}</p></div>}
      </div>
    </Layout>
  );
};

export default App;
