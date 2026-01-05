import React, { useState, useRef } from 'react';
import { Issue, IssueStepView } from '../types';
import ProgressStepper from '../components/ProgressStepper';
import { Plus, Trash2, Camera, ChevronRight, Upload, Loader2, Info, ArrowLeft } from 'lucide-react';

interface IssueManagerStepProps {
  issues: Issue[];
  onAddIssue: (issue: Issue) => void;
  onRemoveIssue: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const IssueManagerStep: React.FC<IssueManagerStepProps> = ({ issues, onAddIssue, onRemoveIssue, onNext, onBack }) => {
  const [view, setView] = useState<IssueStepView>(issues.length > 0 ? IssueStepView.LIST : IssueStepView.CAPTURE);

  // Capture State
  const [analyzing, setAnalyzing] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [detectedResult, setDetectedResult] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentImages(prev => [...prev, url]);

      // If this is the first image, or user wants to keep adding, we stay in capture or move to a "ready to analyze" state?
      // For now, let's keep them in CAPTURE view until they decide to analyze.
      // But original flow went straight to analyzing. Let's start analyzing after the first one is added? 
      // Or better, let them add multiple then click "Done".
      // Let's change the flow: Show preview in CAPTURE view, allow adding more, then "Analyze".

      // However, to stick to the plan: "Update `handleCapture` to append new images to `currentImages` instead of replacing."
      // And "Display a horizontal scroll/grid of currently captured images."
    }
  };

  const startAnalysis = () => {
    if (currentImages.length > 0) {
      setAnalyzing(true);
      setView(IssueStepView.ANALYZING);

      // Simulate AI
      setTimeout(() => {
        setAnalyzing(false);
        const outcomes = ['Broken Tile', 'Scratched Surface', 'Water Damage', 'Grout Discoloration'];
        setDetectedResult(outcomes[Math.floor(Math.random() * outcomes.length)]);
      }, 2000);
    }
  };

  const saveIssue = () => {
    if (currentImages.length > 0 && detectedResult) {
      onAddIssue({
        id: Date.now().toString(),
        imageUrls: currentImages,
        detectedIssue: detectedResult,
        remarks: remarks,
        timestamp: Date.now(),
      });
      // Reset
      setCurrentImages([]);
      setDetectedResult('');
      setRemarks('');
      setView(IssueStepView.LIST);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // --- SUB-VIEWS ---

  // 1. ANALYZING / RESULT VIEW
  if (view === IssueStepView.ANALYZING) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        <div className="bg-white p-4 flex items-center gap-2 shadow-sm border-b">
          <button onClick={() => setView(IssueStepView.CAPTURE)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800">Issue Analysis</h2>
        </div>

        {analyzing ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-full max-w-xs aspect-square bg-gray-100 rounded-2xl overflow-hidden relative mb-8 border border-gray-200">
              {currentImages.length > 0 && <img src={currentImages[0]} className="w-full h-full object-cover opacity-50" />}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 p-4 rounded-full shadow-lg">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-200">
                <div className="h-full bg-emerald-500 animate-[width_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Analyzing {currentImages.length} Image{currentImages.length !== 1 ? 's' : ''}...</h3>
            <p className="text-gray-500 mt-2">Identifying the defect type from visual patterns.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="mb-6 grid grid-cols-2 gap-2">
              {currentImages.map((img, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 relative group">
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">AI Detection Result</span>
              </div>
              <p className="text-xl font-bold text-blue-900">{detectedResult}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Remarks (Optional)</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 placeholder-gray-400 min-h-[100px]"
                placeholder="Describe the issue in your own words..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>

            <div className="mt-auto">
              <button onClick={saveIssue} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors">
                Add This Issue
              </button>
              <button onClick={() => setView(IssueStepView.CAPTURE)} className="w-full mt-3 py-3 text-gray-500 font-medium">
                Retake Photo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. CAPTURE SELECTION VIEW
  if (view === IssueStepView.CAPTURE) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 flex items-center gap-2 shadow-sm z-20">
          <button onClick={issues.length > 0 ? () => setView(IssueStepView.LIST) : onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800 text-lg">Capture Evidence</h2>
        </div>
        <ProgressStepper currentStep={2} totalSteps={3} label="Issue Evidence" />

        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="text-center mb-8 mt-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Photos</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              Take clear photos of the defect to help our AI analyze the issue.
            </p>
          </div>

          <div
            onClick={triggerFileSelect}
            className="w-full aspect-[4/3] bg-white border-2 border-dashed border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all shadow-sm group mb-8 relative overflow-hidden"
          >
            <div className="bg-emerald-50 p-5 rounded-full group-hover:bg-emerald-100 transition-colors z-10">
              <Camera className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="text-center z-10">
              <p className="font-bold text-gray-800 text-lg">Tap to Capture</p>
              <p className="text-gray-400 text-sm mt-1">or browse gallery</p>
            </div>

            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          </div>

          {/* Preview of captured images */}
          {currentImages.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Captured ({currentImages.length})</span>
                <button onClick={() => setCurrentImages([])} className="text-xs text-red-500 font-medium hover:underline">Clear All</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {currentImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden relative shadow-md group">
                    <img src={img} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImages(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-1.5 right-1.5 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Mini add button in grid */}
                <button
                  onClick={triggerFileSelect}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors bg-white/50"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleCapture}
            multiple
          />
        </div>

        {/* Floating Action Bar */}
        {currentImages.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sticky bottom-0 z-30">
            <button
              onClick={startAnalysis}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Analyze Images
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. LIST VIEW (Management)
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-2 shadow-sm z-20">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-800">Managed Issues</h2>
      </div>
      <ProgressStepper currentStep={2} totalSteps={3} label="Review Issues" />

      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 pl-1">Added Issues ({issues.length})</h3>
        <div className="space-y-3">
          {issues.map((issue, idx) => (
            <div key={issue.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
              <div className="w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 relative overflow-hidden">
                <img src={issue.imageUrls[0]} className="w-full h-full object-cover" />
                {issue.imageUrls.length > 1 && (
                  <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-bold">
                    +{issue.imageUrls.length - 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-sm">Issue #{idx + 1}</h4>
                  <button onClick={() => onRemoveIssue(issue.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-emerald-600 font-semibold text-sm mt-1">{issue.detectedIssue}</p>
                <p className="text-gray-400 text-xs truncate mt-1">{issue.remarks || "No remarks"}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setView(IssueStepView.CAPTURE)}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Another Issue
        </button>
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={onNext}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-colors"
        >
          <span>Review & Submit</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default IssueManagerStep;
