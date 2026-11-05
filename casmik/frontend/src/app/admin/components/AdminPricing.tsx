'use client';
import React, { useState, useEffect } from 'react';
import { sellQuestions } from '@/lib/casmikData';
import type { Question, QuestionOption } from '@/lib/casmikData';
import { Plus, ChevronDown, ChevronUp, X, Save, Trash2, Edit2, Check, RefreshCw, Camera } from 'lucide-react';

interface CameraLens {
  id: string;
  name: string;
  type: string;
  price: number;
  icon?: string;
  active: boolean;
}

export default function AdminPricing({ initialTab = 'lenses' }: { initialTab?: 'lenses' | 'questions' } = {}) {
  const [activeTab, setActiveTab] = useState<'lenses' | 'questions'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ── LENSES STATE ──
  const [lenses, setLenses] = useState<CameraLens[]>([]);
  const [loadingLenses, setLoadingLenses] = useState<boolean>(true);
  const [editingLens, setEditingLens] = useState<CameraLens | null>(null);
  const [showAddLens, setShowAddLens] = useState<boolean>(false);
  const [newLens, setNewLens] = useState({ name: '', type: 'Kit Lens', price: 5000, icon: '📷' });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // ── QUESTIONS STATE ──
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-dslr');
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<{ qId: string; optId: string; adjustment: number } | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddOption, setShowAddOption] = useState<string | null>(null);

  // New question form state
  const [newQ, setNewQ] = useState({ question: '', subtext: '', categoryId: 'cat-dslr' });
  const [newOpt, setNewOpt] = useState({ label: '', description: '', icon: '📱', priceAdjustment: 0 });

  // Fetch Questions from backend API
  const fetchQuestions = async (catId: string) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/questions?categoryId=${catId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        const mapped: Question[] = data.questions.map((q: any) => ({
          id: q.id,
          categoryId: q.categoryId,
          question: q.question,
          subtext: q.subtext || '',
          sortOrder: q.sortOrder || 1,
          active: q.active !== false,
          options: (q.options || []).map((o: any) => ({
            id: o.id,
            questionId: q.id,
            label: o.label || '',
            description: o.sublabel || o.description || '',
            icon: o.icon || '🔍',
            illustration: o.illustration || 'check',
            priceAdjustment: o.adj !== undefined ? o.adj : (o.priceAdjustment || 0),
            adjustmentType: o.adjustmentType || 'fixed',
            conditionGrade: o.conditionGrade || 'good',
            bulletPoints: o.bulletPoints || [o.sublabel || o.description || ''],
          })),
        }));
        setQuestions(mapped);
        if (mapped.length > 0) setExpandedQ(mapped[0].id);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Fetch Lenses from backend API
  const fetchLenses = async () => {
    setLoadingLenses(true);
    try {
      const res = await fetch('/api/lenses');
      const data = await res.json();
      if (data.success && Array.isArray(data.lenses)) {
        setLenses(data.lenses);
      }
    } catch (err) {
      console.error('Error fetching lenses:', err);
    } finally {
      setLoadingLenses(false);
    }
  };

  useEffect(() => {
    fetchLenses();
    fetchQuestions('cat-dslr');
  }, []);

  const triggerSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // ── LENS ACTIONS ──
  const handleSaveLensEdit = async () => {
    if (!editingLens) return;
    try {
      const res = await fetch('/api/lenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLens),
      });
      const data = await res.json();
      if (data.success) {
        setLenses(prev => prev.map(l => (l.id === editingLens.id ? editingLens : l)));
        triggerSuccess(`Updated "${editingLens.name}" successfully!`);
        setEditingLens(null);
      }
    } catch (err) {
      alert('Failed to update lens');
    }
  };

  const handleToggleLensActive = async (lens: CameraLens) => {
    const updated = { ...lens, active: !lens.active };
    try {
      await fetch('/api/lenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setLenses(prev => prev.map(l => (l.id === lens.id ? updated : l)));
      triggerSuccess(`Lens status changed to ${updated.active ? 'Active' : 'Inactive'}`);
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDeleteLens = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/lenses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLenses(prev => prev.filter(l => l.id !== id));
        triggerSuccess(`Deleted "${name}"`);
      }
    } catch (err) {
      alert('Failed to delete lens');
    }
  };

  const handleCreateLens = async () => {
    if (!newLens.name.trim()) return;
    try {
      const res = await fetch('/api/lenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLens),
      });
      const data = await res.json();
      if (data.success && data.lens) {
        setLenses(prev => [...prev, data.lens]);
        setNewLens({ name: '', type: 'Kit Lens', price: 5000, icon: '📷' });
        setShowAddLens(false);
        triggerSuccess(`Added new lens "${data.lens.name}"!`);
      }
    } catch (err) {
      alert('Failed to create lens');
    }
  };

  // ── QUESTIONS ACTIONS ──
  const handleAdjustmentSave = async () => {
    if (!editingOption) return;
    const targetQ = questions.find(q => q.id === editingOption.qId);
    if (!targetQ) return;

    const updatedOptions = targetQ.options.map(o =>
      o.id === editingOption.optId ? { ...o, priceAdjustment: editingOption.adjustment } : o
    );

    const payload = {
      id: targetQ.id,
      categoryId: selectedCategory,
      question: targetQ.question,
      subtext: targetQ.subtext,
      active: targetQ.active,
      options: updatedOptions.map(o => ({
        id: o.id,
        label: o.label,
        sublabel: o.description || '',
        adj: o.priceAdjustment,
      })),
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev =>
          prev.map(q =>
            q.id === editingOption.qId
              ? { ...q, options: updatedOptions }
              : q
          )
        );
        triggerSuccess('Option deduction amount saved successfully!');
        setEditingOption(null);
      }
    } catch {
      alert('Failed to save adjustment');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQ.question.trim()) return;
    const defaultOptions = [
      { id: `opt-1-${Date.now()}`, label: 'Works Perfectly / Flawless', sublabel: 'Original & 100% functional', adj: 0 },
      { id: `opt-2-${Date.now()}`, label: 'Minor Flaw / Cosmetic Wear', sublabel: 'Light scratches or normal usage', adj: -2500 },
      { id: `opt-3-${Date.now()}`, label: 'Major Defect / Damaged', sublabel: 'Requires repair or replacement', adj: -7000 },
    ];
    const payload = {
      categoryId: newQ.categoryId || selectedCategory,
      question: newQ.question,
      subtext: newQ.subtext,
      active: true,
      options: defaultOptions,
    };
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess(`Added question: "${newQ.question}"`);
        setShowAddQuestion(false);
        setNewQ({ question: '', subtext: '', categoryId: selectedCategory });
        fetchQuestions(selectedCategory);
      }
    } catch {
      alert('Failed to create question');
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/questions?id=${qId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.filter(q => q.id !== qId));
        triggerSuccess('Question deleted successfully');
      }
    } catch {
      alert('Failed to delete question');
    }
  };

  const handleToggleActive = async (qId: string) => {
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;
    const newActive = !targetQ.active;
    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: qId, active: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, active: newActive } : q));
        triggerSuccess(`Question ${newActive ? 'Enabled' : 'Disabled'}`);
      }
    } catch {
      alert('Failed to toggle question status');
    }
  };

  const handleAddOption = async (qId: string) => {
    if (!newOpt.label.trim()) return;
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;

    const optId = `opt-${qId}-${Date.now()}`;
    const option: QuestionOption = {
      id: optId,
      questionId: qId,
      label: newOpt.label,
      description: newOpt.description,
      icon: newOpt.icon,
      illustration: newOpt.icon,
      priceAdjustment: newOpt.priceAdjustment,
      adjustmentType: 'fixed',
      conditionGrade: 'good',
      bulletPoints: [newOpt.description],
    };
    const updatedOptions = [...targetQ.options, option];

    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: qId,
          options: updatedOptions.map(o => ({
            id: o.id,
            label: o.label,
            sublabel: o.description || '',
            adj: o.priceAdjustment,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.map(q => (q.id === qId ? { ...q, options: updatedOptions } : q)));
        setNewOpt({ label: '', description: '', icon: '📱', priceAdjustment: 0 });
        setShowAddOption(null);
        triggerSuccess('New answer option added!');
      }
    } catch {
      alert('Failed to add option');
    }
  };

  const handleDeleteOption = async (qId: string, optId: string) => {
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;
    const updatedOptions = targetQ.options.filter(o => o.id !== optId);

    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: qId,
          options: updatedOptions.map(o => ({
            id: o.id,
            label: o.label,
            sublabel: o.description || '',
            adj: o.priceAdjustment,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.map(q => (q.id === qId ? { ...q, options: updatedOptions } : q)));
        triggerSuccess('Option deleted!');
      }
    } catch {
      alert('Failed to delete option');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <Check size={18} />
          <span className="text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pricing & Add-ons Engine</h2>
          <p className="text-sm text-gray-500">
            Manage Camera Lenses prices, display names, and condition price deductions
          </p>
        </div>

        {activeTab === 'lenses' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLenses}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              title="Refresh Lenses"
            >
              <RefreshCw size={16} className={loadingLenses ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowAddLens(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              <Plus size={16} /> Add Camera Lens
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setNewQ(p => ({ ...p, categoryId: selectedCategory }));
              setShowAddQuestion(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
          >
            <Plus size={16} /> Add Question
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('lenses')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'lenses'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Camera size={16} className={activeTab === 'lenses' ? 'text-primary' : ''} />
          Camera Lenses ({lenses.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'questions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>❓</span> Questions & Deductions ({questions.length})
        </button>
      </div>

      {/* ──────────────── TAB 1: CAMERA LENSES ──────────────── */}
      {activeTab === 'lenses' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📷</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Live Lens Pricing Sync</p>
                <p className="text-xs text-gray-500">
                  Any name or price change here updates both Web & Mobile App instantly.
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-xl">
              MongoDB Live Database
            </div>
          </div>

          {loadingLenses ? (
            <div className="py-16 text-center text-gray-400">Loading camera lenses...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lenses.map(lens => (
                <div
                  key={lens.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
                    lens.active ? 'border-gray-200' : 'border-gray-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {lens.icon || '📷'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {lens.type}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            lens.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {lens.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mt-0.5 truncate" title={lens.name}>
                        {lens.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400">BUNDLE BONUS</p>
                      <p className="text-lg font-black text-emerald-600">
                        +₹{lens.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleLensActive(lens)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          lens.active
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title="Toggle Active"
                      >
                        {lens.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => setEditingLens({ ...lens })}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        title="Edit Name & Price"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteLens(lens.id, lens.name)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        title="Delete Lens"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: QUESTIONS & DEDUCTIONS ──────────────── */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Price Rule Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
            <h3 className="font-bold text-gray-900 mb-3">Price Calculation Formula</h3>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="bg-white px-3 py-1.5 rounded-xl font-bold text-gray-900 shadow-sm">
                Base Price
              </span>
              <span className="text-green-600 font-bold">+</span>
              <span className="bg-green-100 px-3 py-1.5 rounded-xl font-bold text-green-700">
                Camera Lenses Bonus
              </span>
              <span className="text-red-500 font-bold">−</span>
              <span className="bg-red-50 px-3 py-1.5 rounded-xl font-bold text-red-600">
                Condition Deductions
              </span>
              <span className="text-gray-500 font-bold">=</span>
              <span className="bg-primary px-3 py-1.5 rounded-xl font-bold text-white">Final Quote</span>
            </div>
          </div>

          {/* Category Filter Chips for Diagnostic Questions */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'cat-dslr', name: 'DSLR & Mirrorless', icon: '📷' },
                { id: 'cat-smartphone', name: 'Smartphones & Mobile', icon: '📱' },
                { id: 'cat-laptop', name: 'Laptops & MacBooks', icon: '💻' },
                { id: 'cat-lens', name: 'Camera Lenses', icon: '🔍' },
                { id: 'cat-tablet', name: 'Tablets & iPads', icon: '📟' },
                { id: 'cat-action-camera', name: 'Action Cameras', icon: '🏄' },
                { id: 'cat-video-camera', name: 'Video Cameras', icon: '📹' },
                { id: 'cat-gimbal', name: 'Gimbals', icon: '🕹️' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    fetchQuestions(c.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={async () => {
                  if (confirm('Re-seed all 8 categories with the official Camsik diagnostic questions template?')) {
                    setLoadingQuestions(true);
                    try {
                      await fetch('/api/questions?reset=true');
                      await fetchQuestions(selectedCategory);
                      triggerSuccess('Diagnostic questions re-synced for all 8 categories');
                    } catch (e) {
                      console.error('Failed to reset questions:', e);
                    } finally {
                      setLoadingQuestions(false);
                    }
                  }
                }}
                className="text-xs font-bold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                title="Restore official questions for all 8 categories"
              >
                <RefreshCw size={13} />
                <span>Re-sync Defaults</span>
              </button>
              <button
                onClick={() => {
                  setNewQ(p => ({ ...p, categoryId: selectedCategory }));
                  setShowAddQuestion(true);
                }}
                className="text-xs font-bold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-primary/20"
              >
                <Plus size={14} />
                <span>Add Question</span>
              </button>
              <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Category Questions:</span>
                <span className="text-primary font-black">{questions.length}</span>
              </div>
            </div>
          </div>

          {loadingQuestions && (
            <div className="py-12 text-center text-gray-400 font-medium">Loading category questions from API...</div>
          )}

          {!loadingQuestions && questions.length === 0 && (
            <div className="py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center space-y-3 p-6">
              <div className="text-3xl">❓</div>
              <h4 className="font-bold text-gray-800 text-base">No diagnostic questions for this category yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Add condition questions and valuation deductions for this category so users get accurate doorstep quotes.
              </p>
              <button
                onClick={() => {
                  setNewQ(p => ({ ...p, categoryId: selectedCategory }));
                  setShowAddQuestion(true);
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90"
              >
                + Add First Question
              </button>
            </div>
          )}

          {/* Questions List */}
          {!loadingQuestions && questions.length > 0 && (
            <div className="space-y-3">
            {questions.map((q, qi) => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center">
                  <button
                    onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                    className="flex-1 flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                        {qi + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{q.question}</p>
                        <p className="text-xs text-gray-500">
                          {q.options.length} answer options · {q.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          q.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {q.active ? 'Active' : 'Inactive'}
                      </span>
                      {expandedQ === q.id ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 pr-3">
                    <button
                      onClick={() => handleToggleActive(q.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 text-xs font-bold transition-colors"
                      title="Toggle Active"
                    >
                      {q.active ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {expandedQ === q.id && (
                  <div className="p-4 pt-0 border-t border-gray-100 space-y-2 mt-2">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Answer Options</span>
                      <button
                        onClick={() => setShowAddOption(q.id)}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{opt.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-gray-800">{opt.label}</p>
                              {opt.description && (
                                <p className="text-[11px] text-gray-500">{opt.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {editingOption?.optId === opt.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={editingOption.adjustment}
                                  onChange={e =>
                                    setEditingOption(p =>
                                      p ? { ...p, adjustment: Number(e.target.value) } : null
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-primary focus:outline-none"
                                />
                                <button
                                  onClick={handleAdjustmentSave}
                                  className="p-1 rounded-lg bg-emerald-600 text-white"
                                >
                                  <Save size={12} />
                                </button>
                                <button
                                  onClick={() => setEditingOption(null)}
                                  className="p-1 rounded-lg bg-gray-200 text-gray-600"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingOption({
                                    qId: q.id,
                                    optId: opt.id,
                                    adjustment: opt.priceAdjustment,
                                  })
                                }
                                className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                                  opt.priceAdjustment === 0
                                    ? 'bg-gray-200 text-gray-700'
                                    : opt.priceAdjustment > 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {opt.priceAdjustment > 0 ? '+' : ''}₹{opt.priceAdjustment.toLocaleString('en-IN')}
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteOption(q.id, opt.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ──────────────── MODAL: EDIT CAMERA LENS (NAME & PRICE) ──────────────── */}
      {editingLens && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Edit Camera Lens</h3>
              <button
                onClick={() => setEditingLens(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Lens Display Name</label>
                <input
                  type="text"
                  value={editingLens.name}
                  onChange={e => setEditingLens({ ...editingLens, name: e.target.value })}
                  placeholder="e.g. 50mm f/1.8 Prime Portrait Lens"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Lens Type / Category</label>
                  <input
                    type="text"
                    value={editingLens.type}
                    onChange={e => setEditingLens({ ...editingLens, type: e.target.value })}
                    placeholder="e.g. Prime Lens"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Icon Emoji</label>
                  <input
                    type="text"
                    value={editingLens.icon || '📷'}
                    onChange={e => setEditingLens({ ...editingLens, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  Bundle Price Payout Bonus (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    +₹
                  </span>
                  <input
                    type="number"
                    value={editingLens.price}
                    onChange={e => setEditingLens({ ...editingLens, price: Number(e.target.value) })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  This exact amount will be added to user's camera sell payout.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingLens(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLensEdit}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: ADD NEW CAMERA LENS ──────────────── */}
      {showAddLens && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Add New Camera Lens</h3>
              <button
                onClick={() => setShowAddLens(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Lens Display Name</label>
                <input
                  type="text"
                  value={newLens.name}
                  onChange={e => setNewLens({ ...newLens, name: e.target.value })}
                  placeholder="e.g. Sony FE 24-105mm f/4 G OSS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Lens Category</label>
                  <input
                    type="text"
                    value={newLens.type}
                    onChange={e => setNewLens({ ...newLens, type: e.target.value })}
                    placeholder="e.g. Telephoto Zoom"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Icon Emoji</label>
                  <input
                    type="text"
                    value={newLens.icon}
                    onChange={e => setNewLens({ ...newLens, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  Bundle Price Payout Bonus (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    +₹
                  </span>
                  <input
                    type="number"
                    value={newLens.price}
                    onChange={e => setNewLens({ ...newLens, price: Number(e.target.value) })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddLens(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateLens}
                disabled={!newLens.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20"
              >
                Add Lens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: ADD NEW QUESTION ──────────────── */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Add Sell Question</h3>
              <button
                onClick={() => setShowAddQuestion(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Question Text</label>
                <input
                  value={newQ.question}
                  onChange={e => setNewQ(p => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. Is the device under warranty?"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Subtext / Helper</label>
                <input
                  value={newQ.subtext}
                  onChange={e => setNewQ(p => ({ ...p, subtext: e.target.value }))}
                  placeholder="e.g. Check the warranty card or box"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block">Category</label>
                <select
                  value={newQ.categoryId}
                  onChange={e => setNewQ(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="cat-dslr">Cameras & DSLR</option>
                  <option value="cat-smartphone">Smartphones & Mobile</option>
                  <option value="cat-laptop">Laptops & MacBooks</option>
                  <option value="cat-lens">Camera Lenses</option>
                  <option value="cat-tablet">Tablets & iPads</option>
                  <option value="cat-action-camera">Action Cameras</option>
                  <option value="cat-video-camera">Video Cameras</option>
                  <option value="cat-gimbal">Gimbals & Stabilizers</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddQuestion(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                disabled={!newQ.question.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
