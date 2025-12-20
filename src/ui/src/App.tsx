import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Play, Settings, Activity, Image as ImageIcon, Layers, ArrowLeft } from 'lucide-react'
import { LandingPage } from './components/LandingPage'
import clsx from 'clsx'

// Interface matching backend schemas.py
interface JobSettings {
    shoot_name: string;
    base_name: string;
    input_path: string;
    output_path: string;

    // Quality
    quality_optimized: number;
    quality_compressed: number;
    generate_optimized_jpg: boolean;
    generate_optimized_webp: boolean;
    generate_compressed_jpg: boolean;
    generate_compressed_webp: boolean;

    // Watermark
    watermark_enabled: boolean;
    watermark_path: string;
    watermark_position: 'center' | 'tile' | 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
    watermark_opacity: number;

    // Misc
    exif_option: string;
    include_raw_files: boolean;
    rename_files: boolean;
    create_zip_packages: boolean;
    zip_compression_level: number;
}

const DEFAULT_SETTINGS: JobSettings = {
    shoot_name: "My_Shoot",
    base_name: "Photo",
    input_path: "",
    output_path: "C:\\PhotoPackager_Exports", // Default Windows path hint
    quality_optimized: 90,
    quality_compressed: 80,
    generate_optimized_jpg: true,
    generate_optimized_webp: true,
    generate_compressed_jpg: true,
    generate_compressed_webp: false,
    watermark_enabled: false,
    watermark_path: "",
    watermark_position: 'bottom_right',
    watermark_opacity: 0.5,
    exif_option: "keep",
    include_raw_files: false,
    rename_files: true,
    create_zip_packages: true,
    zip_compression_level: 6,
}

function App() {
    const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing')
    const [status, setStatus] = useState<"idle" | "submitting" | "processing" | "success" | "error">("idle")
    const [message, setMessage] = useState("Ready to process.")
    const [jobId, setJobId] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [settings, setSettings] = useState<JobSettings>(DEFAULT_SETTINGS)

    // Polling Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (status === 'processing' && jobId) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/jobs/${jobId}/status`);
                    if (!res.ok) return;

                    const data = await res.json();

                    if (data.status === 'success') {
                        setStatus('success');
                        setMessage("Processing Complete!");
                        setProgress(100);
                    } else if (data.status === 'failure') {
                        setStatus('error');
                        setMessage(`Error: ${data.error || "Unknown Failure"}`);
                    } else if (data.status === 'processing') {
                        setMessage(data.message || "Processing...");
                        setProgress(data.percent || 50); // Use backend percent if available
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [status, jobId]);

    const handleChange = (key: keyof JobSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    const handleSubmit = async () => {
        if (!settings.input_path) {
            setStatus('error');
            setMessage("Please enter a Source Folder Path.");
            return;
        }

        setStatus('submitting');
        setMessage("Submitting Job...");

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Submission Failed");
            }

            const data = await res.json();
            setJobId(data.job_id);
            setStatus('processing');
            setMessage("Job queued. Waiting for worker...");

        } catch (e: any) {
            setStatus('error');
            setMessage(e.message);
        }
    }

    if (viewMode === 'landing') {
        return <LandingPage onStart={() => setViewMode('app')} />
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-neutral-950 to-neutral-950 -z-20" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl bg-neutral-900/50 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('landing')} className="p-2 hover:bg-white/5 rounded-full text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src="/PhotoPackager_Icon.png" alt="Icon" className="w-8 h-8 object-contain" />
                            <div>
                                <h1 className="text-lg font-bold">New Delivery Job</h1>
                                <p className="text-xs text-neutral-500 font-mono">Local Agent Controller</p>
                            </div>
                        </div>
                    </div>
                    <div className={clsx(
                        "px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-2",
                        status === 'processing' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse" :
                            status === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                status === 'error' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                    "bg-neutral-800 border-white/10 text-neutral-500"
                    )}>
                        <Activity className="w-3 h-3" />
                        {status.toUpperCase()}
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8 custom-scrollbar">

                    {/* Section 1: Paths */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2">
                            <FolderOpen className="w-4 h-4" /> Source & Destination
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-300">Input Path (Source)</label>
                                <input
                                    type="text"
                                    value={settings.input_path}
                                    onChange={(e) => handleChange('input_path', e.target.value)}
                                    placeholder="D:\Photos\2024_Wedding_Shoot"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-cyan-100 placeholder:text-neutral-700"
                                />
                                <p className="text-[10px] text-neutral-500">Paste the absolute path to the folder containing your RAW/JPG files.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-300">Output Path (Destination)</label>
                                <input
                                    type="text"
                                    value={settings.output_path}
                                    onChange={(e) => handleChange('output_path', e.target.value)}
                                    placeholder="C:\Exports"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-cyan-100 placeholder:text-neutral-700"
                                />
                                <p className="text-[10px] text-neutral-500">Process results will be saved here in a new subfolder.</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Section 2: Job Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left: Settings */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2">
                                <Settings className="w-4 h-4" /> Configuration
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400">Project Name</label>
                                    <input
                                        type="text"
                                        value={settings.shoot_name}
                                        onChange={(e) => handleChange('shoot_name', e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500/30 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-neutral-400">File Prefix</label>
                                    <input
                                        type="text"
                                        value={settings.base_name}
                                        onChange={(e) => handleChange('base_name', e.target.value)}
                                        className="w-full bg-neutral-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-500/30 transition-colors"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-sm">Rename Files Sequentially</span>
                                <input type="checkbox" checked={settings.rename_files} onChange={(e) => handleChange('rename_files', e.target.checked)} className="accent-cyan-500" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-sm">Create ZIP Packages</span>
                                <input type="checkbox" checked={settings.create_zip_packages} onChange={(e) => handleChange('create_zip_packages', e.target.checked)} className="accent-cyan-500" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 cursor-pointer hover:bg-white/5 transition-colors">
                                <span className="text-sm">Include Original RAWs</span>
                                <input type="checkbox" checked={settings.include_raw_files} onChange={(e) => handleChange('include_raw_files', e.target.checked)} className="accent-cyan-500" />
                            </label>


                            {/* Formats */}
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Output Formats</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex items-center gap-2 p-2 rounded bg-neutral-800/30 hover:bg-white/5 cursor-pointer">
                                        <input type="checkbox" checked={settings.generate_optimized_jpg} onChange={(e) => handleChange('generate_optimized_jpg', e.target.checked)} className="accent-cyan-500" />
                                        <span className="text-xs">Print JPG</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded bg-neutral-800/30 hover:bg-white/5 cursor-pointer">
                                        <input type="checkbox" checked={settings.generate_optimized_webp} onChange={(e) => handleChange('generate_optimized_webp', e.target.checked)} className="accent-cyan-500" />
                                        <span className="text-xs">Print WebP</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded bg-neutral-800/30 hover:bg-white/5 cursor-pointer">
                                        <input type="checkbox" checked={settings.generate_compressed_jpg} onChange={(e) => handleChange('generate_compressed_jpg', e.target.checked)} className="accent-cyan-500" />
                                        <span className="text-xs">Social JPG</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-2 rounded bg-neutral-800/30 hover:bg-white/5 cursor-pointer">
                                        <input type="checkbox" checked={settings.generate_compressed_webp} onChange={(e) => handleChange('generate_compressed_webp', e.target.checked)} className="accent-cyan-500" />
                                        <span className="text-xs">Social WebP</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right: Watermark */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold uppercase tracking-widest mb-2">
                                <Layers className="w-4 h-4" /> Branding & Watermark
                            </div>

                            <div className={clsx(
                                "border rounded-xl p-6 transition-all duration-300",
                                settings.watermark_enabled ? "border-cyan-500/30 bg-cyan-900/5" : "border-white/5 bg-neutral-900/20 opacity-70"
                            )}>
                                <div className="flex items-center justify-between mb-6">
                                    <span className="font-bold flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-cyan-500" />
                                        Enable Watermarking
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={settings.watermark_enabled}
                                        onChange={(e) => handleChange('watermark_enabled', e.target.checked)}
                                        className="w-5 h-5 accent-cyan-500"
                                    />
                                </div>

                                <AnimatePresence>
                                    {settings.watermark_enabled && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-xs text-neutral-400">Watermark File Path (PNG)</label>
                                                <input
                                                    type="text"
                                                    value={settings.watermark_path}
                                                    onChange={(e) => handleChange('watermark_path', e.target.value)}
                                                    placeholder="C:\Assets\Logo_White.png"
                                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:border-cyan-500/30"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs text-neutral-400">Position</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['top_left', 'center', 'top_right', 'bottom_left', 'tile', 'bottom_right'].map(pos => (
                                                        <button
                                                            key={pos}
                                                            onClick={() => handleChange('watermark_position', pos)}
                                                            className={clsx(
                                                                "h-8 rounded text-[10px] font-bold uppercase transition-all border",
                                                                settings.watermark_position === pos
                                                                    ? "bg-cyan-500 text-black border-cyan-400"
                                                                    : "bg-neutral-800 text-neutral-500 border-white/5 hover:bg-white/10"
                                                            )}
                                                        >
                                                            {pos.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs text-neutral-400">Opacity ({settings.watermark_opacity * 100}%)</label>
                                                <input
                                                    type="range" min="0.1" max="1.0" step="0.1"
                                                    value={settings.watermark_opacity}
                                                    onChange={(e) => handleChange('watermark_opacity', parseFloat(e.target.value))}
                                                    className="w-full accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <footer className="p-8 border-t border-white/5 bg-neutral-900/50 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                    {/* Progress Bar Background */}
                    {status === 'processing' && (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute top-0 left-0 h-[1px] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        />
                    )}

                    <div className="text-xs text-neutral-500 font-mono">
                        {message} {status === 'processing' && `(${progress}%)`}
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            disabled={status === 'processing' || status === 'submitting'}
                            onClick={handleSubmit}
                            className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-cyan-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'processing' ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            <span>{status === 'processing' ? 'Processing...' : 'Run Processor'}</span>
                        </button>
                    </div>
                </footer>

            </motion.div >
        </div >
    )
}

export default App
