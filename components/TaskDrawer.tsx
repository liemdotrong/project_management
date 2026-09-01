"use client";

import { useState, useEffect } from "react";
import { X, Activity, AlertTriangle, ArrowUpRight, FileText, DollarSign, LayoutList, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createExpense, getExpensesByTask, updateExpense, deleteExpense } from "@/actions/expense.actions";
import { createRisk, getRisksByTask, updateRisk, deleteRisk } from "@/actions/risk.actions";
import { createOpportunity, getOpportunitiesByTask, updateOpportunity, deleteOpportunity } from "@/actions/opportunity.actions";
import { uploadDocument, getDocumentsByTask, deleteDocument } from "@/actions/document.actions";
import { getActivityLogsByTask } from "@/actions/activity.actions";

type TabType = 'overview' | 'risks' | 'opportunities' | 'documents' | 'expenses' | 'activity';

export default function TaskDrawer({ task, onClose, permissions, subTabPermissions }: { task: any, onClose: () => void, permissions?: any, subTabPermissions?: any }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!task) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[85vh] w-[800px] max-w-[95vw] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                {task.column_id}
              </span>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider",
                task.priority === 'URGENT' ? "bg-rose-100 text-rose-700" :
                task.priority === 'HIGH' ? "bg-amber-100 text-amber-700" :
                task.priority === 'MED' ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-600"
              )}>
                {task.priority || 'MED'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-100 px-6 pt-2 gap-6 bg-slate-50/30 overflow-x-auto">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutList size={16} />}>Overview</TabButton>
          <TabButton active={activeTab === 'risks'} onClick={() => setActiveTab('risks')} icon={<AlertTriangle size={16} />}>Risks</TabButton>
          <TabButton active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} icon={<ArrowUpRight size={16} />}>Opportunities</TabButton>
          <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText size={16} />}>Documents</TabButton>
          <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<DollarSign size={16} />}>Expenses</TabButton>
          <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<Activity size={16} />}>Activity</TabButton>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'overview' && <OverviewTab task={task} permissions={permissions} />}
          {activeTab === 'risks' && <RisksTab task={task} subTabPermissions={subTabPermissions} />}
          {activeTab === 'opportunities' && <OpportunitiesTab task={task} subTabPermissions={subTabPermissions} />}
          {activeTab === 'documents' && <DocumentsTab task={task} subTabPermissions={subTabPermissions} />}
          {activeTab === 'expenses' && <ExpensesTab task={task} subTabPermissions={subTabPermissions} />}
          {activeTab === 'activity' && <ActivityLogTab task={task} />}
        </div>
      </div>
    </>
  );
}

// Subcomponents
function TabButton({ active, onClick, children, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 pb-3 pt-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
        active ? "border-indigo-500 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function OverviewTab({ task, permissions }: { task: any, permissions?: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 min-h-[100px]">
          {task.description || "No description provided."}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Assignees</h3>
          <div className="flex -space-x-2">
            {task.assignees?.map((a: any, i: number) => (
              <div key={i} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">
                {a.name ? a.name.charAt(0) : 'U'}
              </div>
            ))}
            {(!task.assignees || task.assignees.length === 0) && <span className="text-sm text-slate-400">Unassigned</span>}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Due Date</h3>
          <p className="text-sm text-slate-600">
            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RisksTab({ task, subTabPermissions }: { task: any, subTabPermissions?: any }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRisk, setEditingRisk] = useState<any | null>(null);

  useEffect(() => {
    getRisksByTask(task._id).then(setRisks);
  }, [task._id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      title: e.target.title.value,
      severity: Number(e.target.severity.value),
      probability: Number(e.target.probability.value),
      mitigation_plan: e.target.mitigation_plan.value,
      status: e.target.status ? e.target.status.value : 'OPEN',
    };
    try {
      if (editingRisk && editingRisk._id) {
        await updateRisk(editingRisk._id, data, `/projects/${task.project}`);
        setEditingRisk(null);
      } else {
        await createRisk(task._id, data, `/projects/${task.project}`);
      }
      e.target.reset();
      getRisksByTask(task._id).then(setRisks);
    } catch (err) {
      alert(editingRisk ? "Failed to update risk" : "Failed to add risk");
    }
    setLoading(false);
  };

  const handleDelete = async (riskId: string) => {
    if (!window.confirm("Are you sure you want to delete this risk?")) return;
    try {
      await deleteRisk(riskId, `/projects/${task.project}`);
      getRisksByTask(task._id).then(setRisks);
    } catch (error) {
      alert("Failed to delete risk");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Risk Matrix & Register</h3>
        {(subTabPermissions?.can_create && !editingRisk) && (
        <button onClick={() => setEditingRisk({})} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
          + Add Risk
        </button>
        )}
      </div>

      {editingRisk && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-slate-700">{editingRisk._id ? "Edit Risk" : "New Risk"}</h4>
            <button type="button" onClick={() => setEditingRisk(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={editingRisk._id ? "col-span-1" : "col-span-2"}>
              <label className="block text-xs font-medium text-slate-600 mb-1">Risk Title</label>
              <input name="title" defaultValue={editingRisk.title} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. API limit reached" />
            </div>
            {editingRisk._id && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue={editingRisk.status || 'OPEN'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="OPEN">OPEN</option>
                <option value="MITIGATED">MITIGATED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity (1-5)</label>
              <input name="severity" defaultValue={editingRisk.severity || 3} required type="number" min="1" max="5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Probability (1-5)</label>
              <input name="probability" defaultValue={editingRisk.probability || 3} required type="number" min="1" max="5" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Mitigation Plan</label>
              <textarea name="mitigation_plan" defaultValue={editingRisk.mitigation_plan} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Plan to mitigate..." rows={2}></textarea>
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {loading ? "Saving..." : "Save Risk"}
          </button>
        </form>
      )}

      {risks.length > 0 ? (
        <div className="space-y-3">
          {risks.map(r => (
            <div key={r._id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-2 group">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-slate-800">{r.title}</h4>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full",
                    r.status === 'OPEN' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>{r.status}</span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all -my-1 -mr-1">
                    {(subTabPermissions?.can_update) && (
                      <button onClick={() => setEditingRisk(r)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {(subTabPermissions?.can_delete) && (
                      <button onClick={() => handleDelete(r._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Severity: <b>{r.severity}</b></span>
                <span>Probability: <b>{r.probability}</b></span>
                <span>Score: <b className={r.severity * r.probability >= 15 ? "text-rose-600" : ""}>{r.severity * r.probability}</b></span>
              </div>
              {r.mitigation_plan && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md mt-1">{r.mitigation_plan}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
          No risks recorded yet.
        </div>
      )}
    </div>
  );
}

function OpportunitiesTab({ task, subTabPermissions }: { task: any, subTabPermissions?: any }) {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOpp, setEditingOpp] = useState<any | null>(null);

  useEffect(() => {
    getOpportunitiesByTask(task._id).then(setOpps);
  }, [task._id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      title: e.target.title.value,
      impact_value: Number(e.target.impact_value.value),
      action_plan: e.target.action_plan.value,
      status: e.target.status ? e.target.status.value : 'IDENTIFIED',
    };
    try {
      if (editingOpp && editingOpp._id) {
        await updateOpportunity(editingOpp._id, data, `/projects/${task.project}`);
        setEditingOpp(null);
      } else {
        await createOpportunity(task._id, data, `/projects/${task.project}`);
      }
      e.target.reset();
      getOpportunitiesByTask(task._id).then(setOpps);
    } catch (err) {
      alert(editingOpp ? "Failed to update opportunity" : "Failed to add opportunity");
    }
    setLoading(false);
  };

  const handleDelete = async (oppId: string) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await deleteOpportunity(oppId, `/projects/${task.project}`);
      getOpportunitiesByTask(task._id).then(setOpps);
    } catch (error) {
      alert("Failed to delete opportunity");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Value Optimization</h3>
        {(subTabPermissions?.can_create && !editingOpp) && (
        <button onClick={() => setEditingOpp({})} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
          + Add Opportunity
        </button>
        )}
      </div>

      {editingOpp && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-slate-700">{editingOpp._id ? "Edit Opportunity" : "New Opportunity"}</h4>
            <button type="button" onClick={() => setEditingOpp(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={editingOpp._id ? "col-span-1" : "col-span-2"}>
              <label className="block text-xs font-medium text-slate-600 mb-1">Opportunity Title</label>
              <input name="title" defaultValue={editingOpp.title} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Upsell Pro plan" />
            </div>
            {editingOpp._id && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue={editingOpp.status || 'IDENTIFIED'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                <option value="IDENTIFIED">IDENTIFIED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REALIZED">REALIZED</option>
              </select>
            </div>
            )}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Impact Value ($)</label>
              <input name="impact_value" defaultValue={editingOpp.impact_value} required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Action Plan</label>
              <textarea name="action_plan" defaultValue={editingOpp.action_plan} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" rows={2}></textarea>
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {loading ? "Saving..." : "Save Opportunity"}
          </button>
        </form>
      )}

      {opps.length > 0 ? (
        <div className="space-y-3">
          {opps.map(o => (
            <div key={o._id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-2 group">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-slate-800">{o.title}</h4>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full",
                    o.status === 'IDENTIFIED' ? "bg-slate-100 text-slate-700" :
                    o.status === 'IN_PROGRESS' ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                  )}>{o.status}</span>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all -my-1 -mr-1">
                    {(subTabPermissions?.can_update) && (
                      <button onClick={() => setEditingOpp(o)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {(subTabPermissions?.can_delete) && (
                      <button onClick={() => handleDelete(o._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Value: <b className="text-indigo-600">${o.impact_value?.toLocaleString('en-US')}</b></span>
              </div>
              {o.action_plan && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-md mt-1">{o.action_plan}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
          No opportunities recorded yet.
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ task, subTabPermissions }: { task: any, subTabPermissions?: any }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    getDocumentsByTask(task._id).then(setDocs);
  }, [task._id]);

  const handleUpload = async (e: any) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        data: base64Data
      };
      
      try {
        await uploadDocument(task._id, fileData, "65a1234567890abcdef12345", `/projects/${task.project}`);
        e.target.reset();
        setFile(null);
        setShowForm(false);
        getDocumentsByTask(task._id).then(setDocs);
      } catch (err) {
        alert("Failed to upload document");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(docId, `/projects/${task.project}`);
      getDocumentsByTask(task._id).then(setDocs);
    } catch (error) {
      alert("Failed to delete document");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Attachments</h3>
        {(subTabPermissions?.can_create) && (
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
          {showForm ? "Cancel" : "Upload File"}
        </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">Select File (Max 10MB)</label>
            <input 
              type="file" 
              required 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            />
          </div>
          <button disabled={loading || !file} type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      )}

      {docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map(d => (
            <div key={d._id} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700">{d.file_name}</h4>
                  <p className="text-xs text-slate-400">
                    {d.file_size < 1024 * 1024 
                      ? `${(d.file_size / 1024).toFixed(2)} KB` 
                      : `${(d.file_size / (1024 * 1024)).toFixed(2)} MB`} • {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={d.file_url} target="_blank" className="text-indigo-600 text-xs font-medium hover:underline px-2">View</a>
                {(subTabPermissions?.can_delete) && (
                  <button onClick={() => handleDelete(d._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
          No attachments yet. Max 25MB. PDF, DOCX, XLSX, PNG supported.
        </div>
      )}
    </div>
  );
}

function ExpensesTab({ task, subTabPermissions }: { task: any, subTabPermissions?: any }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingExp, setEditingExp] = useState<any | null>(null);

  useEffect(() => {
    getExpensesByTask(task._id).then(setExpenses);
  }, [task._id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const amount = Number(e.target.amount.value);
    const category = e.target.category.value;
    try {
      if (editingExp && editingExp._id) {
        await updateExpense(editingExp._id, category, amount, `/projects/${task.project}`);
        setEditingExp(null);
      } else {
        await createExpense(task._id, category, amount, `/projects/${task.project}`);
      }
      e.target.reset();
      getExpensesByTask(task._id).then(setExpenses);
    } catch (err) {
      alert(editingExp ? "Failed to update expense" : "Failed to add expense");
    }
    setLoading(false);
  };

  const handleDelete = async (expId: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(expId, `/projects/${task.project}`);
      getExpensesByTask(task._id).then(setExpenses);
    } catch (error) {
      alert("Failed to delete expense");
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budget = task.budget || 0;
  const isOverBudget = budget > 0 && totalExpenses > budget;
  const percentage = budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Expense Register</h3>
        {(subTabPermissions?.can_create && !editingExp) && (
        <button onClick={() => setEditingExp({})} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
          + Add Expense
        </button>
        )}
      </div>
      
      {/* Financial Warning Banner */}
      {budget > 0 && (
        <div className={cn(
          "mb-6 p-4 rounded-xl border",
          isOverBudget ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-slate-50 border-slate-200 text-slate-700"
        )}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {isOverBudget && <AlertTriangle size={16} className="text-rose-600" />}
              <span className="font-semibold text-sm">Budget Status</span>
            </div>
            <div className="text-sm">
              <span className={isOverBudget ? "text-rose-600 font-bold" : "font-medium"}>
                ${totalExpenses.toLocaleString('en-US')}
              </span>
              <span className="text-slate-500"> / ${budget.toLocaleString('en-US')}</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
            <div 
              className={cn("h-2 rounded-full transition-all duration-500", isOverBudget ? "bg-rose-500" : "bg-indigo-500")}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          {isOverBudget && (
            <p className="text-xs text-rose-600 mt-2 font-medium">Warning: Expenses have exceeded the allocated budget by ${(totalExpenses - budget).toLocaleString('en-US')}.</p>
          )}
        </div>
      )}

      {editingExp && (
      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-slate-700">{editingExp._id ? "Edit Expense" : "New Expense"}</h4>
          <button type="button" onClick={() => setEditingExp(null)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <input name="category" defaultValue={editingExp.category} required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Software License" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount ($)</label>
            <input name="amount" defaultValue={editingExp.amount} required type="number" step="0.01" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00" />
          </div>
        </div>
        <button disabled={loading} type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {loading ? "Saving..." : "Save Expense"}
        </button>
      </form>
      )}

      {expenses.length > 0 ? (
        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp._id} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm flex justify-between items-center group">
              <div>
                <h4 className="text-sm font-medium text-slate-700">{exp.category}</h4>
                <p className="text-xs text-slate-400">{new Date(exp.spent_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold text-slate-800">
                  ${exp.amount.toLocaleString('en-US')}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {(subTabPermissions?.can_update) && (
                    <button onClick={() => setEditingExp(exp)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                      <Edit2 size={14} />
                    </button>
                  )}
                  {(subTabPermissions?.can_delete) && (
                    <button onClick={() => handleDelete(exp._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
          No expenses recorded yet.
        </div>
      )}
    </div>
  );
}

function ActivityLogTab({ task }: { task: any }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    getActivityLogsByTask(task._id).then(setLogs);
  }, [task._id]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Audit Trail</h3>
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, i) => (
            <div key={log._id} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                {log.user_id?.name ? log.user_id.name.charAt(0) : 'S'}
              </div>
              <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                <p className="text-sm text-slate-800">
                  <span className="font-semibold">{log.user_id?.name || 'System'}</span> {log.action}
                </p>
                <p className="text-xs text-slate-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                {log.details && (
                  <pre className="mt-2 text-[10px] bg-slate-50 p-2 rounded text-slate-500 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
          No activity recorded yet.
        </div>
      )}
    </div>
  );
}
