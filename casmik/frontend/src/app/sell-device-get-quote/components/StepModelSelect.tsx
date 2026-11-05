'use client';
import React, { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { deviceModels } from '@/lib/casmikData';

interface Props {
  brand: string;
  brandId: string | null;
  categoryId?: string | null;
  selectedModel: string | null;
  selectedStorage: string | null;
  selectedColor: string | null;
  selectedLenses?: { id: string; name: string; price: number }[];
  onSelect: (modelId: string, modelName: string, storage: string, color: string, basePrice: number, lenses?: { id: string; name: string; price: number }[]) => void;
  onBack: () => void;
}

const COMMON_LENSES = [
  { id: 'lens-kit', name: '18-55mm / 16-50mm Standard Kit Lens', type: 'Kit Lens', price: 4500, icon: '📷' },
  { id: 'lens-prime', name: '50mm f/1.8 Prime Portrait Lens', type: 'Prime Lens', price: 7500, icon: '🔍' },
  { id: 'lens-telephoto', name: '55-250mm / 70-300mm Telephoto Zoom', type: 'Telephoto Zoom', price: 9500, icon: '🔭' },
  { id: 'lens-pro-zoom', name: '24-70mm f/2.8 Pro Standard Zoom', type: 'Professional Zoom', price: 26000, icon: '💎' },
  { id: 'lens-wide', name: '10-18mm / 16-35mm Ultra-Wide Angle', type: 'Wide Angle', price: 14000, icon: '🌄' },
  { id: 'lens-flagship-tele', name: '70-200mm f/2.8 Flagship Telephoto', type: 'Pro Telephoto', price: 36000, icon: '⚡' },
];

const LENS_MOUNTS = [
  { id: 'all', name: 'All Mounts', keywords: [] },
  { id: 'sony-e', name: 'Sony E / FE Mount', keywords: ['sony e', 'fe', 'e-mount', 'e mount'] },
  { id: 'canon-rf', name: 'Canon RF Mount', keywords: ['canon rf', 'rf mount', 'rf'] },
  { id: 'canon-ef', name: 'Canon EF / EF-S', keywords: ['canon ef', 'ef-s', 'ef mount', 'ef'] },
  { id: 'nikon-z', name: 'Nikon Z Mount', keywords: ['nikon z', 'z mount', 'nikkor z', 'z '] },
  { id: 'nikon-f', name: 'Nikon F Mount', keywords: ['nikon f', 'f mount', 'af-s', 'af-p'] },
  { id: 'fuji-x', name: 'Fujifilm X Mount', keywords: ['fuji x', 'xf', 'xc', 'x-mount', 'fujinon x'] },
  { id: 'mft', name: 'Micro Four Thirds (MFT)', keywords: ['micro four thirds', 'mft', 'm4/3', 'lumix g', 'zuiko'] },
  { id: 'l-mount', name: 'L-Mount (Leica/Panasonic/Sigma)', keywords: ['l-mount', 'lumix s', 'leica l', 'dg dn'] },
  { id: 'pl-mount', name: 'Cinema PL Mount', keywords: ['pl mount', 'cine', 'cinema'] },
];

export default function StepModelSelect({ brand, brandId, categoryId, selectedModel, selectedStorage, selectedColor, selectedLenses = [], onSelect, onBack }: Props) {
  const [selectedMount, setSelectedMount] = useState<string>('all');
  const isLensCategory = categoryId === 'cat-lens';

  const modelsForCat = deviceModels.filter(m => {
    const matchesBrand = brandId ? m.brandId === brandId : true;
    const matchesCat = categoryId ? m.categoryId === categoryId : true;
    return matchesBrand && matchesCat && m.active;
  });

  const models = modelsForCat.length > 0 
    ? modelsForCat 
    : deviceModels.filter(m => (brandId ? m.brandId === brandId : true) && m.active);

  const [query, setQuery] = useState('');
  
  const initialModel = models.find(m => m.id === selectedModel || m.slug === selectedModel) || null;
  const [chosenModel, setChosenModel] = useState<typeof models[0] | null>(initialModel);
  const [chosenStorage, setChosenStorage] = useState<string | null>(selectedStorage || initialModel?.storages[0] || null);
  const [chosenColor, setChosenColor] = useState<string | null>(selectedColor || initialModel?.colors[0] || null);
  const [addedLenses, setAddedLenses] = useState<{ id: string; name: string; price: number }[]>(selectedLenses);
  const [customLensName, setCustomLensName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [availableLenses, setAvailableLenses] = useState(COMMON_LENSES);

  React.useEffect(() => {
    fetch('/api/lenses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.lenses) && data.lenses.length > 0) {
          setAvailableLenses(data.lenses.filter((l: any) => l.active !== false));
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (selectedModel) {
      const found = models.find(m => m.id === selectedModel || m.slug === selectedModel);
      if (found) {
        setChosenModel(found);
        setChosenStorage(selectedStorage || found.storages[0] || null);
        setChosenColor(selectedColor || found.colors[0] || null);
      }
    }
  }, [selectedModel, selectedStorage, selectedColor, models]);

  const isCamera = categoryId === 'cat-dslr' || categoryId === 'cat-video-camera' || categoryId === 'cat-action-camera' ||
    (chosenModel?.name && /camera|dslr|mirrorless|eos|alpha|lumix|nikon|fuji/i.test(chosenModel.name));

  const filtered = models.filter(m => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    if (isLensCategory && selectedMount !== 'all') {
      const mountObj = LENS_MOUNTS.find(x => x.id === selectedMount);
      if (mountObj) {
        const text = `${m.name} ${m.alt || ''} ${JSON.stringify(m.specs || '')} ${(m.storages || []).join(' ')}`.toLowerCase();
        const matchesMount = mountObj.keywords.some(k => text.includes(k.toLowerCase()));
        return matchesMount;
      }
    }
    return true;
  });
  const canContinue = chosenModel && chosenStorage && chosenColor;

  const totalLensBonus = addedLenses.reduce((acc, l) => acc + l.price, 0);
  const totalEstimated = (chosenModel?.basePrice || 0) + totalLensBonus;

  const toggleLens = (lens: { id: string; name: string; price: number }) => {
    setAddedLenses(prev => {
      const exists = prev.find(l => l.id === lens.id);
      if (exists) {
        return prev.filter(l => l.id !== lens.id);
      } else {
        return [...prev, lens];
      }
    });
  };

  const handleAddCustomLens = () => {
    if (!customLensName.trim()) return;
    const newLens = {
      id: `custom-lens-${Date.now()}`,
      name: customLensName.trim(),
      price: 8000,
    };
    setAddedLenses(prev => [...prev, newLens]);
    setCustomLensName('');
    setShowCustomInput(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
        <ChevronLeft size={16} /> Back to Brand
      </button>
      <h2 className="text-xl font-bold text-foreground mb-1">
        {isLensCategory ? 'Select Lens Mount & Model' : 'Select Model'}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">Showing models for <span className="font-semibold text-foreground">{brand}</span></p>

      {/* Mount Selector Bar for Camera Lenses */}
      {isLensCategory && (
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>🔍</span> Select Lens Mount:
            </span>
            <span className="text-[11px] text-slate-500">
              {selectedMount === 'all' ? 'All mounts' : LENS_MOUNTS.find(m => m.id === selectedMount)?.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LENS_MOUNTS.map((mount) => (
              <button
                key={mount.id}
                type="button"
                onClick={() => setSelectedMount(mount.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMount === mount.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
                }`}
              >
                {mount.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={isLensCategory ? "Search lens by focal length (e.g. 24-70mm, 50mm)..." : "Search model..."}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 max-h-64 overflow-y-auto scrollbar-hide">
        {filtered.length > 0 ? filtered.map((model) => (
          <button key={`model-btn-${model.id}`} onClick={() => { setChosenModel(model); setChosenStorage(model.storages[0] || null); setChosenColor(model.colors[0] || null); }}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 btn-press ${chosenModel?.id === model.id ? 'border-primary bg-primary-50 shadow-sm ring-1 ring-primary/20' : 'border-border bg-white hover:border-primary/40 hover:bg-primary-50/30'}`}>
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={model.image}
                alt={model.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/categories/dslr.png';
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{model.name}</p>
              <p className="text-xs text-muted-foreground">Up to ₹{model.basePrice.toLocaleString('en-IN')}</p>
            </div>
          </button>
        )) : (
          <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
            {query ? `No model found for "${query}"` : 'No models available for this brand'}
          </div>
        )}
      </div>

      {chosenModel && (
        <div className="space-y-5 fade-in border-t border-border pt-5">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Select Variant / Storage</p>
            <div className="flex flex-wrap gap-2">
              {chosenModel.storages.map(s => (
                <button key={`storage-${s}`} onClick={() => setChosenStorage(s)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all btn-press ${chosenStorage === s ? 'border-primary bg-primary text-white' : 'border-border bg-white text-foreground hover:border-primary/40'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {chosenStorage && (
            <div className="fade-in">
              <p className="text-sm font-semibold text-foreground mb-2">Select Color</p>
              <div className="flex flex-wrap gap-2">
                {chosenModel.colors.map(c => (
                  <button key={`color-${c}`} onClick={() => setChosenColor(c)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all btn-press ${chosenColor === c ? 'border-primary bg-primary-50 text-primary font-semibold' : 'border-border bg-white text-foreground hover:border-primary/40'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Camera Lens Selling Section */}
          {isCamera && (
            <div className="fade-in bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <h3 className="text-sm font-black text-slate-900">Selling with Camera Lenses? (Optional)</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bundle your lenses with this camera to dramatically increase your final payout.
                  </p>
                </div>
                {addedLenses.length > 0 && (
                  <div className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black rounded-lg self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
                    <span>✓</span>
                    <span>+{addedLenses.length} Lens Added (+ ₹ * * * *)</span>
                  </div>
                )}
              </div>

              {/* Review Guarantee Banner */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900 shadow-sm">
                <span className="text-base leading-none mt-0.5">⭐</span>
                <div>
                  <p className="font-extrabold text-emerald-950">
                    You will get the best price after review from our team.
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Select your lenses below without any guesswork. Our certified camera specialists will inspect and evaluate each lens to grant you the maximum market valuation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableLenses.map(lens => {
                  const isSelected = !!addedLenses.find(l => l.id === lens.id);
                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => toggleLens(lens)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-base mt-0.5">{lens.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{lens.name}</p>
                          <span className={`text-xs font-black ml-2 tracking-widest ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                            + ₹ * * * *
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[11px] text-slate-500">{lens.type}</p>
                          <span className="text-[10px] font-bold text-emerald-700">Best price on review</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom lens option */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                >
                  + Have another lens? Add custom lens
                </button>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customLensName}
                      onChange={e => setCustomLensName(e.target.value)}
                      placeholder="e.g. Sigma 30mm f/1.4 DC DN Contemporary"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomLens}
                      className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap"
                    >
                      Add Lens (+ ₹ * * * *)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="px-2.5 py-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span>⭐</span>
                    <span>You will get the best price after review from our team</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {canContinue && (
        <div className="mt-6 fade-in space-y-2">
          {addedLenses.length > 0 && (
            <div className="flex flex-col gap-1 text-xs px-3 py-2.5 bg-emerald-50 text-emerald-900 rounded-xl font-semibold border border-emerald-200">
              <div className="flex justify-between items-center">
                <span>Camera Base Quote:</span>
                <span className="font-black text-sm">₹{chosenModel!.basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-emerald-800 font-bold">
                <span>+ {addedLenses.length} Lens Included:</span>
                <span className="tracking-widest font-black">+ ₹ * * * *</span>
              </div>
              <p className="text-[10.5px] text-emerald-700 mt-0.5 font-medium flex items-center gap-1">
                <span>⭐</span>
                <span>You will get the best price after review from our team</span>
              </p>
            </div>
          )}
          <button onClick={() => onSelect(chosenModel!.id, chosenModel!.name, chosenStorage!, chosenColor!, chosenModel!.basePrice, addedLenses)}
            className="w-full py-3.5 gradient-green text-white rounded-xl font-bold text-sm shadow-green btn-press flex items-center justify-center gap-2">
            <span>Continue to Condition Assessment →</span>
          </button>
        </div>
      )}
    </div>
  );
}
