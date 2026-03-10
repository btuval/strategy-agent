import React, { useState } from "react";
import { agentClient } from "@/api/agentClient";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImportData() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState('');

  const handleImport = async () => {
    setStatus('loading');
    setMessage('');
    setProgress('Starting import...');
    
    try {
      const fileUrl = ''; // Set your file URL or use a file picker
      setProgress('Processing customer data...');
      const { data } = await agentClient.functions.invoke('importCustomerData', { file_url: fileUrl });
      
      if (data.success) {
        setStatus('success');
        setMessage(`Successfully imported ${data.imported} customers!`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Import failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Import failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center mx-auto">
          <Upload className="w-7 h-7 text-blue-400" />
        </div>
        
        <div>
          <h1 className="text-xl font-semibold text-white mb-2">Import Customer Data</h1>
          <p className="text-sm text-slate-400">Load the 5K customer baseline dataset into the system</p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 space-y-4">
          {status === 'idle' && (
            <>
              <p className="text-xs text-slate-400">
                This will import customer data with calculated churn scores, risk segments, and AI-generated recommendations.
              </p>
              <Button
                onClick={handleImport}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Customer Data
              </Button>
            </>
          )}

          {status === 'loading' && (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
              <p className="text-sm text-slate-300">{progress}</p>
              <p className="text-xs text-slate-500">This may take a minute...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm text-emerald-400">{message}</p>
              <Button
                onClick={() => window.location.href = '/Dashboard'}
                variant="outline"
                className="w-full border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
              >
                View Dashboard
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-sm text-red-400">{message}</p>
              <Button
                onClick={handleImport}
                variant="outline"
                className="w-full border-white/10 text-slate-300 hover:bg-white/5"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}