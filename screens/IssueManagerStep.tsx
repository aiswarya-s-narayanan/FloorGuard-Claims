import React, { useState, useRef } from 'react';
import { Issue, IssueStepView } from '../types';
import ProgressStepper from '../components/ProgressStepper';
import { Plus, Trash2, Camera, ChevronRight, Upload, Loader2, Info, ArrowLeft, AlertTriangle, X } from 'lucide-react';
import { detectIssue } from "../api/IssueDetectionApi";

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
  const [capturedFiles, setCapturedFiles] = useState<File[]>([]);

  const [detectedResult, setDetectedResult] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string>('');
  const [clarityWarning, setClarityWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files) as File[];
      const newUrls = newFiles.map(file => URL.createObjectURL(file));

      setCurrentImages(prev => [...prev, ...newUrls]);
      setCapturedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const startAnalysis = async () => {
    if (currentImages.length === 0) return;

    setAnalyzing(true);
    setError(''); // Reset error state
    setView(IssueStepView.ANALYZING);

    try {
      console.log('Starting analysis with', capturedFiles.length, 'files');
      const result = await detectIssue(capturedFiles);
      console.log('Analysis result:', result);

      // Extract data from the nested ai_detection_result object
      const aiResult = result.ai_detection_result;

      setDetectedResult(aiResult.issue_type);
      setShortDescription(aiResult.short_description || '');
      setSeverity(aiResult.severity || 'unknown');

      // Check for image clarity
      if (aiResult.image_clarity === 0) {
        setClarityWarning(aiResult.detailed_description || aiResult.description || 'Low image clarity detected.');
        setRemarks(''); // Don't populate remarks if clarity is low
      } else {
        setRemarks(aiResult.detailed_description || aiResult.description || ''); // Auto-populate remarks with API description
      }
    } catch (error) {
      console.error('Detection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Detection failed';
      setError(errorMessage);
      setDetectedResult("Detection failed");
      setSeverity('unknown');
      setRemarks('');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveIssue = () => {
    if (currentImages.length > 0 && detectedResult) {
      onAddIssue({
        id: Date.now().toString(),
        imageUrls: currentImages,
        detectedIssue: detectedResult,
        severity: severity,
        remarks: remarks,
        timestamp: Date.now(),
      });
      // Reset
      setCurrentImages([]);
      setCapturedFiles([]);
      setDetectedResult('');
      setShortDescription('');
      setSeverity('');
      setRemarks('');
      setView(IssueStepView.LIST);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const resetAnalysisState = () => {
    setDetectedResult('');
    setShortDescription('');
    setSeverity('');
    setRemarks('');
    setError('');
    setAnalyzing(false);
  };

  const goBackToCapture = () => {
    resetAnalysisState();
    setView(IssueStepView.CAPTURE);
  };

  // --- SUB-VIEWS ---

  // 1. ANALYZING / RESULT VIEW
  if (view === IssueStepView.ANALYZING) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white">
        <div className="bg-white p-4 flex items-center gap-2 shadow-sm border-b">
          <button onClick={goBackToCapture} className="p-2 hover:bg-gray-100 rounded-full">
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Error</span>
                </div>
                <p className="text-sm text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-2">Please check your network connection and try again.</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">AI Detection Result</span>
                </div>
              </div>

              <p className="text-xl font-bold text-blue-900">{detectedResult}</p>
              <div className="mt-2 text-sm space-y-1">
                <div>
                  <span className="font-semibold text-gray-700">Short Description: </span>
                  <span className="text-gray-900 font-medium">{shortDescription}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Severity: </span>
                  <span className="text-gray-900 font-medium">{severity.charAt(0).toUpperCase() + severity.slice(1)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Remarks</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 placeholder-gray-400 min-h-[100px]"
                placeholder="Edit the description as needed..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Auto-populated from AI. You can edit as needed.</p>
            </div>

            <div className="mt-auto">
              <button onClick={saveIssue} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-emerald-700 transition-colors" disabled={!!error}>
                Add This Issue
              </button>
              <button onClick={goBackToCapture} className="w-full mt-3 py-3 text-gray-500 font-medium">
                Retake Photo
              </button>
            </div>
          </div>
        )
        }

        {/* Low Clarity Warning Popup */}
        {clarityWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-scale-in">
              <div className="bg-amber-50 p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Image Clarity Issue</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {clarityWarning}
                </p>
                <button
                  onClick={() => setClarityWarning(null)}
                  className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-200"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </div >
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
                <button onClick={() => { setCurrentImages([]); setCapturedFiles([]); }} className="text-xs text-red-500 font-medium hover:underline">Clear All</button>
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
                        setCapturedFiles(prev => prev.filter((_, idx) => idx !== i));
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
    )
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
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">Issue #{idx + 1}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${issue.severity === 'severe' ? 'bg-red-500 text-white' :
                      issue.severity === 'moderate' ? 'bg-orange-500 text-white' :
                        issue.severity === 'minor' ? 'bg-yellow-500 text-white' :
                          'bg-gray-400 text-white'
                      }`}>
                      {issue.severity?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
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
