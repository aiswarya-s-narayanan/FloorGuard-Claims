import React, { useState, useRef } from 'react';
import { InvoiceDetails } from '../types';
import ProgressStepper from '../components/ProgressStepper';
import { Camera, Upload, Loader2, CheckCircle2, FileText, Calendar, User, ArrowLeft } from 'lucide-react';
import { extractInvoice } from '../api/invoiceApi';


interface InvoiceStepProps {
  data: InvoiceDetails;
  onUpdate: (details: Partial<InvoiceDetails>) => void;
  onNext: () => void;
  onBack: () => void;
}

const InvoiceStep: React.FC<InvoiceStepProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(!!data.invoiceNumber);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    switch (file?.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/jpg':
      case 'application/pdf':
        startAnalysis(file);
        break;
      default:
        alert('Unsupported file type. Please upload a JPEG, PNG, JPG, or PDF file.');
    }
    console.log(file);
    if (file) {
      startAnalysis(file);
    }
  };
  //   if (file) {
  //     startAnalysis(file);
  //   }
  // };

  const parseDate = (dateString: string): string => {
    if (!dateString) return '';

    try {
      // Fix common typos in backend data
      let correctedDate = dateString
        .replace('Noveber', 'November')
        .replace('Deceber', 'December')
        .replace('Janaury', 'January')
        .replace('Feburary', 'February')
        .trim();

      let date: Date | null = null;

      // Try parsing as ISO format first (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(correctedDate)) {
        date = new Date(correctedDate);
      }
      // Try DD/MM/YYYY format (common in many countries)
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(correctedDate)) {
        const parts = correctedDate.split('/');
        // Assume DD/MM/YYYY format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      }
      // Try MM-DD-YYYY or DD-MM-YYYY with dashes
      else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(correctedDate)) {
        const parts = correctedDate.split('-');
        // Assume DD-MM-YYYY format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      }
      // Try natural language date parsing (e.g., "November 15, 2024")
      else {
        date = new Date(correctedDate);
      }

      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString);
        return '';
      }

      // Use local date components to avoid timezone shifts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date parsing error:', error, 'Input:', dateString);
      return '';
    }
  };

  const startAnalysis = async (file: File) => {
    try {
      onUpdate({ file });
      setIsAnalyzing(true);

      const response = await extractInvoice(file);

      if (response?.data && response.data.length > 0) {
        const result = response.data[0];

        onUpdate({
          customerName: result['Customer Name'] || '',
          invoiceNumber: result['Invoice Number'] || '',
          purchaseDate: parseDate(result['Purchase Date']),
        });

        setIsAnalyzed(true);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to extract invoice details');
    } finally {
      setIsAnalyzing(false);
    }
  };


  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 flex items-center gap-2 shadow-sm z-20">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-800">New Claim</h2>
      </div>

      <ProgressStepper currentStep={1} totalSteps={3} label="Invoice Details" />

      <div className="flex-1 p-6 overflow-y-auto">
        {!isAnalyzed && !isAnalyzing && (
          <div className="h-full flex flex-col justify-center items-center space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Invoice</h3>
              <p className="text-gray-500 text-sm">We'll scan it to auto-fill details.</p>
            </div>

            <button
              onClick={triggerFileSelect}
              className="w-full py-6 bg-emerald-600 text-white rounded-2xl shadow-lg flex flex-col items-center gap-3 active:bg-emerald-700 transition-colors"
            >
              <Camera className="w-8 h-8" />
              <span className="font-bold text-lg">Scan Invoice</span>
            </button>

            <div className="w-full flex items-center gap-4">
              <div className="h-[1px] bg-gray-200 flex-1"></div>
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="h-[1px] bg-gray-200 flex-1"></div>
            </div>

            <button
              onClick={triggerFileSelect}
              className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-semibold">Upload PDF / Image</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {isAnalyzing && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
              <div className="bg-white p-4 rounded-full shadow-md relative z-10 border border-emerald-100">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
            </div>
            <h3 className="mt-8 text-lg font-bold text-gray-800">Reading invoice details...</h3>
            <p className="text-sm text-gray-500 mt-2">Our AI is extracting the data for you.</p>
          </div>
        )}

        {isAnalyzed && !isAnalyzing && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Scan Complete</p>
                <p className="text-xs text-emerald-600">Please review the extracted details below.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block pl-1">Customer Name</label>
                <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={data.customerName}
                    onChange={(e) => onUpdate({ customerName: e.target.value })}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-300 font-medium"
                    placeholder="Name"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block pl-1">Invoice Number</label>
                <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={(e) => onUpdate({ invoiceNumber: e.target.value })}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-300 font-medium"
                    placeholder="INV-0000"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block pl-1">Purchase Date</label>
                <div className="flex items-center border border-gray-200 bg-white rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="date"
                    value={data.purchaseDate}
                    onChange={(e) => onUpdate({ purchaseDate: e.target.value })}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-300 font-medium bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 pb-4">
              <button
                onClick={onNext}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition-colors"
              >
                Confirm & Continue
              </button>
              <button
                onClick={() => { setIsAnalyzed(false); onUpdate({ file: null }); }}
                className="w-full mt-3 text-gray-500 font-medium py-2 text-sm hover:text-gray-700"
              >
                Re-scan Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceStep
