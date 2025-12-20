import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Github, ArrowDown, Lock, CheckCircle, Layers, Shield } from 'lucide-react';
import { LegalModal } from './LegalModal';
import clsx from 'clsx';

interface LandingPageProps {
    onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
    const [legalOpen, setLegalOpen] = useState<'privacy' | 'terms' | null>(null);
    const [scrolled, setScrolled] = useState(false);

    // Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-neutral-950 to-neutral-950" />
                <motion.div
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full"
                />
            </div>

            {/* Nav */}
            <nav className={clsx("fixed top-0 w-full z-50 border-b transition-all duration-300", scrolled ? "bg-black/80 backdrop-blur-md border-white/5" : "bg-transparent border-transparent")}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/PhotoPackager_Icon.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold tracking-tight hidden sm:block">PhotoPackager</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6 text-xs md:text-sm font-bold text-neutral-400">
                        {/* Desktop Links */}
                        <a href="https://dropshockdigital.com" target="_blank" className="hover:text-cyan-500 transition-colors hidden md:block">DropShock Digital</a>
                        <a href="https://stevenseagondollar.com" target="_blank" className="hover:text-cyan-500 transition-colors hidden md:block">Steven Seagondollar</a>
                        <a href="https://github.com/DropShock-Digital" target="_blank" className="hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10">
                            <Github className="w-4 h-4" />
                            <span className="hidden sm:block">GitHub</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Fullscreen Hero */}
            <header className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto z-10 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md">
                        The Photographer's Delivery Engine
                    </div>

                    {/* Logo Patch */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        <img src="/PhotoPackager_Patch_New.jpg" alt="PhotoPackager Patch" className="w-64 h-auto object-contain drop-shadow-[0_0_50px_rgba(6,182,212,0.2)] rounded-xl" />
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight max-w-4xl">
                        Make Client Deliverables, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-blue-400 to-cyan-600">
                            Client Accessible.
                        </span>
                    </h1>

                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10 px-4">
                        Don't let massive file sizes ruin your client's experience. Automatically resize, watermark, and package your shoots locally.
                    </p>

                    <button
                        onClick={onStart}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-cyan-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Camera className="w-5 h-5" />
                        <span>Connect Shoot Folder</span>
                    </button>

                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity, times: [0, 0.5, 1], ease: "easeInOut" }}
                    className="absolute bottom-10 flex flex-col items-center gap-2 cursor-pointer text-white/30 hover:text-white transition-colors"
                >
                    <span className="text-xs uppercase tracking-widest">Why PhotoPackager?</span>
                    <ArrowDown className="w-6 h-6" />
                </motion.div>
            </header>

            {/* Feature Grid */}
            <section className="py-24 bg-neutral-900/20 border-y border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-cyan-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Intelligent Resizing</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Clients don't need 40MB files for Instagram. We generate print-ready optimized JPEGs (~2MB) and ultra-light web editions (KB range) so they never have to delete your photos to save space.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-blue-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Watermarking</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Enable the "Anti-Theft" toggle to automatically stamp your logo. Choose corner placement or full-tile coverage to protect your proofs before payment.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-sky-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 text-sky-400">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Local-First Privacy</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                No cloud uploads. No bandwidth fees. Your RAW files are processed entirely on your machine using your CPU/GPU, ensuring client privacy and lightning speed.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Founder Story */}
            <section className="py-24 px-6 relative z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[100px] rounded-full -z-10" />

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <div className="inline-flex items-center gap-2 text-cyan-500 font-bold uppercase tracking-widest text-xs mb-2">
                            <CheckCircle className="w-4 h-4" />
                            The Origin Story
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                            From "Photosierra" to <br />
                            <span className="text-white">PhotoPackager</span>
                        </h2>
                        <div className="space-y-4 text-neutral-400 leading-relaxed text-sm md:text-base">
                            <p>
                                I recognized that clients had massive issues downloading my exported photos. They were 30-40MB a file! They didn't need all that information, especially when they were just going to slap an Instagram filter on it anyway.
                            </p>
                            <p>
                                I realized they just needed high-res and sharp images, but optimized. A 2MB file is still perfect for printing 8x10s, but downloads instantly.
                            </p>
                            <p>
                                Even better, for clients with zero phone storage, our intelligent downscaler creates versions in the kilobyte range. This motivates usage—they never delete the photos because they take up zero space.
                            </p>
                            <p className="text-white font-bold pt-2">
                                I originally called this "Photosierra" after a client who struggled with this exact problem. I built it to help her. Now, it's evolved into PhotoPackager—a tool for any photographer who wants their work to be accessible.
                            </p>
                        </div>

                        <div className="pt-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                                <img src="/SS_Suit_Backdrop.jpg" alt="Steven Seagondollar" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-sm">
                                <div className="text-white font-bold">Steven Seagondollar</div>
                                <div className="text-cyan-500 text-xs">Founder, DropShock Digital</div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 flex justify-center">
                        {/* Abstract Visual Representation of "Compression" */}
                        <div className="relative w-full max-w-sm aspect-square">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
                            <img src="/app_hero_screenshot.png" alt="App Interface" className="relative z-10 w-full h-auto rounded-xl shadow-2xl border border-white/10 rotate-3 hover:rotate-0 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-neutral-950 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500">
                    <div className="flex flex-col text-center md:text-left gap-1">
                        <span className="flex items-center justify-center md:justify-start gap-2 font-bold text-white">
                            <Shield className="w-4 h-4 text-cyan-500" />
                            Local-First & Secure
                        </span>
                        <p className="text-[10px] text-neutral-600 max-w-md mt-2">
                            PhotoPackager is a trademark of DropShock Digital.
                        </p>
                    </div>
                    <p className="text-center md:text-left">© 2025 DropShock Digital.</p>
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex gap-6">
                            <button onClick={() => setLegalOpen('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                            <button onClick={() => setLegalOpen('terms')} className="hover:text-white transition-colors">Terms of Use</button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Legal Modals */}
            <LegalModal
                isOpen={legalOpen === 'terms'}
                onClose={() => setLegalOpen(null)}
                title="Terms of Use"
                content={
                    <div className="space-y-6">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Jurisdiction: Hesperia, CA</p>
                        <p>By using PhotoPackager, you agree that you are responsible for the photos you process. DropShock Digital is not liable for data loss.</p>
                    </div>
                }
            />

            <LegalModal
                isOpen={legalOpen === 'privacy'}
                onClose={() => setLegalOpen(null)}
                title="Privacy Policy"
                content={
                    <div className="space-y-6">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Effect Date: December 2025</p>
                        <h3 className="text-white font-bold mb-2">1. Local Processing</h3>
                        <p>PhotoPackager processes files locally. No images are uploaded to our servers.</p>
                        <h3 className="text-white font-bold mt-4 mb-2">2. Usage Rights</h3>
                        <p>You retain full rights to all photos processed with this software.</p>
                    </div>
                }
            />
        </div>
    )
}
