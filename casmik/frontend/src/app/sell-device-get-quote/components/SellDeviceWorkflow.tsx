'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import StepCategorySelect from './StepCategorySelect';
import StepBrandSelect from './StepBrandSelect';
import StepModelSelect from './StepModelSelect';
import StepConditionQuestions from './StepConditionQuestions';
import StepQuoteResult from './StepQuoteResult';
import QuoteSummaryPanel from './QuoteSummaryPanel';
import { categories, brands, deviceModels } from '@/lib/casmikData';
import type { DeviceVerificationReport } from '@/lib/deviceVerification/types';

export type SellState = {
  category: string | null;
  categoryName: string;
  brand: string | null;
  brandName: string;
  model: string | null;
  modelName: string;
  storage: string | null;
  color: string | null;
  lenses?: { id: string; name: string; price: number }[];
  answers: Record<string, string>;
  currentPrice: number;
  basePrice: number;
  adjustments: { label: string; amount: number; reason: string }[];
  deviceVerification: DeviceVerificationReport | null;
};

const INITIAL_STATE: SellState = {
  category: null,
  categoryName: '',
  brand: null,
  brandName: '',
  model: null,
  modelName: '',
  storage: null,
  color: null,
  lenses: [],
  answers: {},
  currentPrice: 0,
  basePrice: 0,
  adjustments: [],
  deviceVerification: null,
};

const steps = [
  { id: 'step-category', label: 'Category' },
  { id: 'step-brand', label: 'Brand' },
  { id: 'step-model', label: 'Model' },
  { id: 'step-condition', label: 'Condition' },
  { id: 'step-quote', label: 'Get Quote' },
];

export default function SellDeviceWorkflow() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [sellState, setSellState] = useState<SellState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<SellState>) => {
    setSellState(prev => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => setCurrentStep(s => Math.min(s + 1, steps.length - 1)), []);
  const goBack = useCallback(() => setCurrentStep(s => Math.max(s - 1, 0)), []);
  const goToStep = useCallback((i: number) => { 
    if (i <= currentStep) setCurrentStep(i); 
  }, [currentStep]);

  // Sync URL query params to workflow state
  useEffect(() => {
    const modelParam = searchParams.get('model');
    const brandParam = searchParams.get('brand');
    const catParam = searchParams.get('cat') || searchParams.get('category');
    const storageParam = searchParams.get('storage');
    const colorParam = searchParams.get('color');

    // 1. Deepest match: Specific camera/lens model
    if (modelParam) {
      const lowerModel = modelParam.toLowerCase().trim();
      const matchedModel = deviceModels.find(m => 
        m.id.toLowerCase() === lowerModel ||
        m.slug.toLowerCase() === lowerModel ||
        m.name.toLowerCase() === lowerModel ||
        m.slug.toLowerCase().includes(lowerModel) ||
        lowerModel.includes(m.slug.toLowerCase())
      );

      if (matchedModel) {
        const matchedBrand = brands.find(b => b.id === matchedModel.brandId);
        const matchedCategory = categories.find(c => c.id === matchedModel.categoryId);
        const chosenStorage = storageParam || matchedModel.storages[0] || 'Standard';
        const chosenColor = colorParam || matchedModel.colors[0] || 'Black';

        setSellState({
          category: matchedModel.categoryId,
          categoryName: matchedCategory?.name || 'Device',
          brand: matchedModel.brandId,
          brandName: matchedBrand?.name || 'Brand',
          model: matchedModel.id,
          modelName: matchedModel.name,
          storage: chosenStorage,
          color: chosenColor,
          answers: {},
          currentPrice: matchedModel.basePrice,
          basePrice: matchedModel.basePrice,
          adjustments: [],
          deviceVerification: null,
        });
        setCurrentStep(3); // Land directly on condition inspection questions
        return;
      }
    }

    // 2. Brand match (with optional category context)
    if (brandParam) {
      const lowerBrand = brandParam.toLowerCase().trim();
      const matchedBrand = brands.find(b => 
        b.id.toLowerCase() === lowerBrand ||
        b.slug.toLowerCase() === lowerBrand ||
        b.name.toLowerCase() === lowerBrand ||
        b.id.toLowerCase().includes(lowerBrand)
      );

      if (matchedBrand) {
        let matchedCategory = catParam ? categories.find(c => 
          c.id.toLowerCase() === catParam.toLowerCase() ||
          c.slug.toLowerCase() === catParam.toLowerCase() ||
          c.id.toLowerCase().includes(catParam.toLowerCase())
        ) : null;

        if (!matchedCategory) {
          matchedCategory = categories.find(c => c.id === matchedBrand.categoryId) || null;
        }

        const resolvedCatId = matchedCategory ? matchedCategory.id : matchedBrand.categoryId;
        const resolvedCatName = matchedCategory ? matchedCategory.name : 'Device';

        setSellState(prev => ({
          ...prev,
          category: resolvedCatId,
          categoryName: resolvedCatName,
          brand: matchedBrand.id,
          brandName: matchedBrand.name,
          model: null,
          modelName: '',
          storage: null,
          color: null,
          answers: {},
          currentPrice: 0,
          basePrice: 0,
          adjustments: [],
        }));
        setCurrentStep(2); // Land on Model selection for that brand
        return;
      }
    }

    // 3. Category match only
    if (catParam) {
      const lowerCat = catParam.toLowerCase().trim();
      const matchedCategory = categories.find(c => 
        c.id.toLowerCase() === lowerCat ||
        c.slug.toLowerCase() === lowerCat ||
        c.id.toLowerCase().includes(lowerCat)
      );

      if (matchedCategory) {
        setSellState(prev => ({
          ...prev,
          category: matchedCategory.id,
          categoryName: matchedCategory.name,
          brand: null,
          brandName: '',
          model: null,
          modelName: '',
          storage: null,
          color: null,
          answers: {},
          currentPrice: 0,
          basePrice: 0,
          adjustments: [],
        }));
        setCurrentStep(1); // Land on Brand selection for that category
        return;
      }
    }
  }, [searchParams]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Step progress bar */}
      <div className="mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex items-center min-w-max gap-0">
          {steps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <React.Fragment key={step.id}>
                <button onClick={() => goToStep(i)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 ${done ? 'cursor-pointer hover:bg-primary-50' : active ? '' : 'cursor-default opacity-50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-border text-muted-foreground'}`}>
                    {done ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-semibold leading-none ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    {(done || active) && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-none">
                        {i === 0 && sellState.categoryName ? sellState.categoryName : ''}
                        {i === 1 && sellState.brandName ? sellState.brandName : ''}
                        {i === 2 && sellState.modelName ? sellState.modelName : ''}
                        {i === 3 && sellState.storage ? sellState.storage : ''}
                        {i === 4 && sellState.currentPrice > 0 ? `₹${sellState.currentPrice.toLocaleString('en-IN')}` : ''}
                      </p>
                    )}
                  </div>
                </button>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-8 mx-1 flex-shrink-0 transition-all duration-300 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {currentStep === 0 && (
            <StepCategorySelect
              selected={sellState.category}
              onSelect={(id, name) => { updateState({ category: id, categoryName: name, deviceVerification: null }); goNext(); }}
            />
          )}
          {currentStep === 1 && (
            <StepBrandSelect
              selected={sellState.brand}
              categoryId={sellState.category}
              onSelect={(id, name) => { updateState({ brand: id, brandName: name, deviceVerification: null }); goNext(); }}
              onBack={goBack}
            />
          )}
          {currentStep === 2 && (
            <StepModelSelect
              brand={sellState.brandName || 'Selected Brand'}
              brandId={sellState.brand}
              categoryId={sellState.category}
              selectedModel={sellState.model}
              selectedStorage={sellState.storage}
              selectedColor={sellState.color}
              selectedLenses={sellState.lenses}
              onSelect={(modelId, modelName, storage, color, basePrice, lenses) => {
                updateState({ model: modelId, modelName, storage, color, basePrice, currentPrice: basePrice, adjustments: [], deviceVerification: null, lenses: lenses || [] });
                goNext();
              }}
              onBack={goBack}
            />
          )}
          {currentStep === 3 && (
            <StepConditionQuestions
              sellState={sellState}
              onUpdate={updateState}
              onNext={goNext}
              onBack={goBack}
              onSelectModel={() => setCurrentStep(2)}
            />
          )}
          {currentStep >= 4 && (
            <StepQuoteResult sellState={sellState} onSchedulePickup={() => {}} onBack={goBack} onUpdateState={updateState} />
          )}
        </div>
        <div className="xl:col-span-1">
          <QuoteSummaryPanel sellState={sellState} currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
}