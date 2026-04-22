import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileImage, Settings, Package, Play, X, Check, Loader2, Download, Image as ImageIcon, Briefcase, Camera, Github } from 'lucide-react';
import clsx from 'clsx';
import { LandingPage } from './components/LandingPage';
import { AnimatedBackground } from './components/AnimatedBackground';
import './index.css';

interface JobSettings {
  process_original_files: boolean;
  process_raw_files: boolean;
  generate_optimized_jpg: boolean;
  generate_compressed_jpg: boolean;
  generate_optimized_webp: boolean;
  generate_compressed_webp: boolean;
  quality_presets: string;
  exif_option: string;
  create_zip_archives: boolean;
  max_workers: number;
  company_name: string;
  website_url: string;
  support_email: string;
  shoot_base_name?: string;
}

interface JobResponse {
  job_id: string;
  status: string;
  message: string;
  result?: {
    zip_packages?: Array<string | {
      filename?: string;
      download_url?: string;
    }>;
    [key: string]: unknown;
  };
  error?: string;
}

function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<JobSettings>({
    process_original_files: true,
    process_raw_files: false,
    generate_optimized_jpg: true,
    generate_compressed_jpg: true,
    generate_optimized_webp: false,
    generate_compressed_webp: false,
    quality_presets: "high",
    exif_option: "keep",
    create_zip_archives: true,
    max_workers: 10,
    company_name: "DropShock Digital LLC",
    website_url: "https://www.dropshockdigital.com",
    support_email: "support@dropshockdigital.com",
    shoot_base_name: ""
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setSettings(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
        alert("Please select files to format.");
        return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const settingsToSubmit = { ...settings };
    const apiSettings = {
        ...settingsToSubmit,
        create_zip_packages: settingsToSubmit.create_zip_archives,
        quality_optimized: settingsToSubmit.quality_presets === "high" ? 95 : 85,
        quality_compressed: settingsToSubmit.quality_presets === "high" ? 80 : 70
    };

    formData.append('settings', JSON.stringify(apiSettings));

    try {
      setJobStatus({ job_id: '', status: 'uploading', message: 'Uploading files and starting job...' });
      const response = await fetch('/api/jobs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to start job: ${response.statusText}`);
      }

      const raw = await response.json();
      setJobStatus(raw);
      setIsPolling(true);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setJobStatus({ job_id: '', status: 'failed', message });
      setIsPolling(false);
    }
  };

  useEffect(() => {
    let intervalId: number;

    if (isPolling && jobStatus?.job_id) {
      intervalId = window.setInterval(async () => {
        try {
          const response = await fetch(`/api/jobs/${jobStatus.job_id}/status`);
          const data: JobResponse = await response.json();
          setJobStatus(data);

          if (data.status === 'success' || data.status === 'failed' || data.status === 'failure') {
            setIsPolling(false);
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isPolling, jobStatus?.job_id]);

  return (
    <div className="relative min-h-screen bg-black">
      {/* Global Nav */}
      <nav className={clsx("fixed top-0 w-full z-50 border-b transition-all duration-300", scrolled ? "bg-black/80 backdrop-blur-md border-white/5" : "bg-transparent border-transparent")}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-sky-400" />
            <span className="font-bold tracking-tight text-white hidden sm:block">PhotoPackager</span>
          </div>

          <div className="flex items-center gap-2 md:gap-6 text-xs md:text-sm font-bold text-neutral-400">
            <a href="https://dropshockdigital.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors hidden md:block">DropShock Digital</a>
            <a href="https://stevenseagondollar.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors hidden md:block">Steven Seagondollar</a>
            <a href="https://github.com/DropShock-Digital" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10">
              <Github className="w-4 h-4" />
              <span className="hidden sm:block">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {viewMode === 'landing' ? (
        <LandingPage onStart={() => setViewMode('app')} />
      ) : (
        <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-auto font-sans text-neutral-200 py-24">
          {/* Background & Decor */}
          <div className="absolute inset-0 bg-slate-950 -z-20 fixed" />
          <AnimatedBackground />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-card w-full max-w-5xl mx-4 p-4 md:p-8 relative z-10 flex flex-col gap-6"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Header Section */}
              <div className="flex items-start justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.1)]">
                    <Package className="w-12 h-12 text-sky-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-sky-400 to-indigo-500">
                      PhotoPackager
                    </h1>
                    <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
                        <Loader2 className="w-3 h-3" /> Processing Engine
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setViewMode('landing')} className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-white/10 shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    Back
                  </button>
                  <div className={clsx(
                    "px-3 py-1 rounded-full text-xs font-mono border flex items-center h-fit",
                    jobStatus?.status === 'failed' || jobStatus?.status === 'failure' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                    jobStatus?.status === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    "bg-slate-800/50 border-white/10 text-slate-400"
                  )}>
                    {jobStatus ? jobStatus.status.toUpperCase() : "IDLE"}
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-2">

                {/* Left Col: Setup */}
                <div className="md:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/30 font-semibold flex items-center gap-2">
                      <Camera className="w-3 h-3" /> Source Photos
                    </label>
                    <div 
                      className={clsx(
                        "w-full bg-slate-900/50 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer backdrop-blur-sm",
                        isDragging ? "border-sky-500 bg-sky-500/10" : "border-white/10 hover:border-sky-500/50 hover:bg-white/5"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        multiple 
                        {...({ webkitdirectory: "true", directory: "true" } as React.InputHTMLAttributes<HTMLInputElement> & { webkitdirectory?: string; directory?: string })} 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                      />
                      {files.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <FileImage size={40} className="text-sky-400 mb-4" />
                          <p className="text-sm font-medium text-white">
                            {files.length} file{files.length === 1 ? '' : 's'} selected
                          </p>
                          <p className="text-xs text-white/40 mt-1 font-mono">
                            Click or drag to change directory
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <UploadCloud size={40} className="text-white/20 mb-4" />
                          <p className="text-sm font-medium text-white/70">
                            Drop your source folder here
                          </p>
                          <p className="text-xs text-white/40 mt-1 font-mono">
                            Or click to browse your system
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="text-xs uppercase tracking-wider text-white/30 font-semibold flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Job Details
                    </label>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider font-bold mb-1">
                          <span>Shoot Base Name (Optional)</span>
                      </div>
                      <input 
                        type="text" 
                        id="shoot_base_name" 
                        name="shoot_base_name" 
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-sm" 
                        placeholder="e.g. Smith-Wedding"
                        value={settings.shoot_base_name}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider font-bold mb-1">
                                <span>Company Name</span>
                            </div>
                            <input type="text" name="company_name" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-sm" value={settings.company_name} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider font-bold mb-1">
                                <span>Support Email</span>
                            </div>
                            <input type="email" name="support_email" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-sm" value={settings.support_email} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider font-bold mb-1">
                            <span>Website URL</span>
                        </div>
                        <input type="text" name="website_url" className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors backdrop-blur-sm" value={settings.website_url} onChange={handleChange} />
                    </div>

                  </div>
                </div>

                {/* Right Col: Advanced Settings */}
                <div className="md:col-span-5 bg-slate-900/30 p-6 rounded-2xl border border-white/5 h-fit backdrop-blur-md">
                  <div className="flex items-center gap-2 text-sky-400 mb-6">
                    <Settings className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Processing Config</span>
                  </div>

                  <div className="space-y-6">
                      
                      <div className="space-y-3">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Formats & Archives</span>
                          <label className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                             <div className="relative flex items-center">
                               <input type="checkbox" name="generate_optimized_jpg" checked={settings.generate_optimized_jpg} onChange={handleChange} className="peer sr-only" />
                               <div className="w-5 h-5 border border-white/20 rounded-md peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all flex items-center justify-center bg-slate-900">
                                 <Check className={clsx("w-3 h-3 text-white transition-opacity", settings.generate_optimized_jpg ? "opacity-100" : "opacity-0")} strokeWidth={3} />
                               </div>
                             </div>
                             <span className="text-sm text-white/70 group-hover:text-white transition-colors">Optimized JPG</span>
                          </label>
                          <label className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                             <div className="relative flex items-center">
                               <input type="checkbox" name="generate_compressed_jpg" checked={settings.generate_compressed_jpg} onChange={handleChange} className="peer sr-only" />
                               <div className="w-5 h-5 border border-white/20 rounded-md peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all flex items-center justify-center bg-slate-900">
                                 <Check className={clsx("w-3 h-3 text-white transition-opacity", settings.generate_compressed_jpg ? "opacity-100" : "opacity-0")} strokeWidth={3} />
                               </div>
                             </div>
                             <span className="text-sm text-white/70 group-hover:text-white transition-colors">Compressed JPG</span>
                          </label>
                          <label className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                             <div className="relative flex items-center">
                               <input type="checkbox" name="generate_optimized_webp" checked={settings.generate_optimized_webp} onChange={handleChange} className="peer sr-only" />
                               <div className="w-5 h-5 border border-white/20 rounded-md peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all flex items-center justify-center bg-slate-900">
                                 <Check className={clsx("w-3 h-3 text-white transition-opacity", settings.generate_optimized_webp ? "opacity-100" : "opacity-0")} strokeWidth={3} />
                               </div>
                             </div>
                             <span className="text-sm text-white/70 group-hover:text-white transition-colors">Optimized WebP</span>
                          </label>
                          <label className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                             <div className="relative flex items-center">
                               <input type="checkbox" name="generate_compressed_webp" checked={settings.generate_compressed_webp} onChange={handleChange} className="peer sr-only" />
                               <div className="w-5 h-5 border border-white/20 rounded-md peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-all flex items-center justify-center bg-slate-900">
                                 <Check className={clsx("w-3 h-3 text-white transition-opacity", settings.generate_compressed_webp ? "opacity-100" : "opacity-0")} strokeWidth={3} />
                               </div>
                             </div>
                             <span className="text-sm text-white/70 group-hover:text-white transition-colors">Compressed WebP</span>
                          </label>
                          <label className="flex items-center gap-4 cursor-pointer group p-2 mt-2 border-t border-white/5 hover:bg-white/5 rounded-lg transition-colors">
                             <div className="relative flex items-center">
                               <input type="checkbox" name="create_zip_archives" checked={settings.create_zip_archives} onChange={handleChange} className="peer sr-only" />
                               <div className="w-5 h-5 border border-white/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center bg-slate-900">
                                 <Check className={clsx("w-3 h-3 text-white transition-opacity", settings.create_zip_archives ? "opacity-100" : "opacity-0")} strokeWidth={3} />
                               </div>
                             </div>
                             <span className="text-sm text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors">Create ZIP Archives</span>
                          </label>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-4">
                         <div className="space-y-1">
                             <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Quality Preset</span>
                             <select name="quality_presets" className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 appearance-none transition-colors" value={settings.quality_presets} onChange={handleChange}>
                                <option value="high">High Quality (95 / 80)</option>
                                <option value="web">Web Optimized (85 / 70)</option>
                             </select>
                         </div>
                         <div className="space-y-1">
                             <span className="text-xs font-bold text-white/40 uppercase tracking-wider">EXIF Policy</span>
                             <select name="exif_option" className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50 appearance-none transition-colors" value={settings.exif_option} onChange={handleChange}>
                                <option value="keep">Keep EXIF Data</option>
                                <option value="strip">Strip All Metadata</option>
                             </select>
                         </div>
                         <div className="space-y-1">
                             <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex justify-between">
                                 <span>Max CPU Workers</span>
                                 <span className="text-sky-400 font-mono">{settings.max_workers}</span>
                             </span>
                             <input type="range" name="max_workers" className="w-full accent-sky-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" value={settings.max_workers} onChange={handleChange} min={1} max={32} />
                         </div>
                      </div>

                  </div>
                </div>
              </div>

              {/* Status Section (if active) */}
              {jobStatus && (
                 <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 mt-2 backdrop-blur-sm">
                     <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                         <strong className="flex items-center gap-2 text-white">
                             {jobStatus.status === 'success' ? <Check size={20} className="text-emerald-500" /> : null}
                             {jobStatus.status === 'failed' || jobStatus.status === 'failure' ? <X size={20} className="text-red-500" /> : null}
                             {jobStatus.status === 'started' || jobStatus.status === 'uploading' || jobStatus.status === 'queued' ? <Loader2 size={20} className="animate-spin text-sky-400" /> : null}
                             Status: <span className={clsx(
                                 "uppercase text-xs font-bold px-3 py-1 rounded-full ml-2 tracking-wider",
                                 jobStatus.status === 'success' ? "bg-emerald-500/20 text-emerald-400" :
                                 jobStatus.status === 'failed' || jobStatus.status === 'failure' ? "bg-red-500/20 text-red-400" :
                                 "bg-sky-500/20 text-sky-400"
                             )}>{jobStatus.status}</span>
                         </strong>
                         <span className="text-xs font-mono text-white/30 truncate">Job ID: {jobStatus.job_id || 'Generating...'}</span>
                     </div>
                     <p className="text-sm text-white/70">{jobStatus.message}</p>
                     {jobStatus.error && <p className="text-sm text-red-400 mt-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{jobStatus.error}</p>}
                     
                     {jobStatus.result && jobStatus.result.zip_packages && jobStatus.result.zip_packages.length > 0 && (
                       <div className="mt-6 pt-4 border-t border-white/5">
                         <strong className="text-sm text-white/80 block mb-3 uppercase tracking-wider">Download Packages</strong>
                         <div className="flex flex-wrap gap-3">
                         {jobStatus.result.zip_packages.map((zipInfo, idx) => {
                           const fileName = typeof zipInfo === 'string' ? zipInfo : (zipInfo.filename ?? "package.zip");
                           const shortName = fileName.split('\\').pop()?.split('/').pop() || fileName;
                           return (
                             <a key={idx} href={`/api/jobs/${jobStatus.job_id}/download/${shortName}`} download className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all text-sm font-medium hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                                <Download size={16} /> {shortName}
                             </a>
                           );
                         })}
                         </div>
                       </div>
                     )}
                 </div>
              )}

              {/* Footer / Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-4">
                <div className="flex items-center gap-2 text-xs font-mono text-white/30 truncate">
                  <ImageIcon className="w-3 h-3 flex-shrink-0" />
                  {files.length > 0 ? (
                    <span className="text-white/50">{files.length} Photo{files.length === 1 ? '' : 's'} Ready vs {settings.max_workers} Workers</span>
                  ) : (
                    <span>Awaiting Input Photos</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {isPolling && (
                      <button 
                        type="button" 
                        onClick={() => setIsPolling(false)}
                        className="px-6 py-3 rounded-xl bg-slate-800 border border-white/10 text-white font-bold hover:bg-slate-700 transition-colors shadow-lg"
                      >
                         Cancel Monitoring
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isPolling || files.length === 0 || jobStatus?.status === 'uploading'}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 shadow-lg"
                    >
                      {jobStatus?.status === 'uploading' ? <Loader2 className="w-4 h-4 fill-white animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                      <span>{jobStatus?.status === 'uploading' ? 'Uploading...' : 'Start Packaging'}</span>
                    </button>
                </div>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;
