import { motion } from 'framer-motion';
import { AnimatedBackground } from './AnimatedBackground';
import { useState } from 'react';
import { Shield, Database, FileCode, Zap, ArrowDown, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import { LegalModal } from './LegalModal';
import { LogicModal } from './LogicModal';
import { PayoffModal } from './PayoffModal';
import { FounderModal } from './FounderModal';

interface LandingPageProps {
    onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
    const [legalOpen, setLegalOpen] = useState<'privacy' | 'terms' | null>(null);
    const [logicOpen, setLogicOpen] = useState(false);
    const [payoffOpen, setPayoffOpen] = useState(false);
    const [founderOpen, setFounderOpen] = useState(false);




    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
            {/* Dynamic Background */}
            <AnimatedBackground />



            {/* Fullscreen Hero */}
            <header className="relative min-h-screen py-32 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >


                    {/* Logo Patch */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        {/* Placeholder for PhotoPackager Logo */}
                        <div className="w-48 h-48 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                            <Zap className="w-24 h-24 text-blue-400" />
                        </div>
                    </motion.div>

                    {/* Animated Text Background */}
                    <div className="relative">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl -z-10"
                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            Package Your Photos <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-400 to-blue-600">
                                Instantly
                            </span>
                        </h1>
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-16 md:mb-20">
                        <span className="text-sm uppercase tracking-[0.2em] text-white/30">
                            Steven Seagondollar | DropShock Digital
                        </span>
                    </div>

                    <button
                        onClick={onStart}
                        className="group relative inline-flex items-center gap-3 px-8 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-neutral-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] mb-16"
                    >
                        <img src="/PhotoPackager_Icon.png" alt="PhotoPackager" className="w-8 h-8 object-contain" />
                        <span>Start Packaging Now</span>
                    </button>

                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity, times: [0, 0.5, 1], ease: "easeInOut" }}
                    className="absolute bottom-6 flex flex-col items-center gap-2 cursor-pointer text-white/20 hover:text-white transition-colors"
                >
                    <span className="text-[10px] uppercase tracking-[0.2em]">Scroll to Learn More</span>
                    <ArrowDown className="w-5 h-5" />
                </motion.div>
            </header>



            {/* Showcase Animation with Hook */}
            <section className="py-24 bg-black relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">

                    {/* The Hook (Moved Here) */}
                    <div className="mb-20">
                        <h2 className="text-2xl md:text-5xl font-bold text-white max-w-5xl mx-auto leading-tight mb-8">
                            Zero Compression Loss. Maximum Efficiency. <br className="hidden md:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-400 to-blue-600">
                                Automated Photography Workflows.
                            </span>
                        </h2>
                        <p className="text-lg md:text-xl text-neutral-400 max-w-4xl mx-auto leading-relaxed">
                            Stop manually organizing, resizing, and stripping EXIF data from hundreds of photos. <br className="hidden md:block" />We package everything automatically, ready for client delivery.
                        </p>
                    </div>

                    <div className="mb-10">
                        <span className="text-xs font-bold text-neutral-500 tracking-[0.2em] uppercase block mb-2">DropShock Digital Presents</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">PhotoPackager</h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-xl overflow-hidden shadow-[0_0_100px_rgba(56,189,248,0.15)] border border-white/10 max-w-4xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />

                        {/* App Screenshot */}
                        <button
                            onClick={onStart}
                            className="relative group text-center block w-full cursor-pointer overflow-hidden rounded-xl"
                        >
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors z-20" />
                            <img
                                src="/app_hero_screenshot.png"
                                alt="PhotoPackager Interface"
                                className="w-full h-auto object-cover mx-auto opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-[1.01]"
                                onError={(e) => {
                                    // Fallback if screenshot missing (auto-recovery to abstract)
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            {/* Fallback Abstract (Hidden by default unless error) */}
                            <div className="hidden absolute inset-0 bg-neutral-900 flex items-center justify-center h-96">
                                <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(56,189,248,0.8)] z-20 animate-[scan_3s_ease-in-out_infinite]" />
                                <span className="text-blue-500 font-mono">Loading Interface...</span>
                            </div>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* 3-Box Educational Flow (Removed from here) */}

            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

            {/* 3 Steps */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                <h2 className="text-3xl font-bold text-center mb-16">The PhotoPackager Workflow</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-blue-500/20 transition-all">
                        <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 select-none">1</div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                            <Database className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Upload & Secure</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                            Upload your full-resolution client shoots. We strip metadata to protect privacy and secure the highest quality raw assets on our backend API.
                        </p>
                        <ul className="text-xs text-neutral-500 space-y-2">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> EXIF Data Stripping</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Secure File Handling</li>
                        </ul>
                    </div>

                    {/* Step 2 */}
                    <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-cyan-500/20 transition-all">
                        <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 select-none">2</div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Optimize & Resize</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                            Our asynchronous Celery workers automatically generate perfect web-ready, high-res, and thumbnail versions of every image with cutting-edge Pillow compression.
                        </p>
                        <ul className="text-xs text-neutral-500 space-y-2">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> Background Processing</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> ZERO Quality Degradation</li>
                        </ul>
                    </div>

                    {/* Step 3 */}
                    <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-indigo-500/20 transition-all">
                        <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 select-none">3</div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                            <FileCode className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Package & Deliver</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                            All your photos are packaged neatly into single ZIP deliverables sorted by optimized size. Ready to be sent to clients instantly.
                        </p>
                        <ul className="text-xs text-neutral-500 space-y-2">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> 1-Click ZIP Archives</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full" /> Streamlined Delivery</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

            {/* NEW 3-COLUMN GRID SECTION (Replacing Payoff, Logic, Founder) */}
            <section className="py-32 px-6 relative z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

                    {/* 1. The Payoff */}
                    <div className="group relative rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden flex flex-col hover:bg-neutral-900/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col h-full items-center text-center z-10">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                                <Zap className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">The Payoff</h3>
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-6">Massive Time Savings</p>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                Why spend hours resizing photos manually? Drop them in, get them out. Professional deliverables in seconds.
                            </p>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setPayoffOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-blue-500/50 pb-0.5 hover:text-blue-500 hover:border-blue-500 transition-all"
                                >
                                    View Benefits <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. The Logic (Existing Focus) */}
                    <div className="group relative rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden flex flex-col hover:bg-neutral-900/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col h-full items-center text-center z-10">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 ring-1 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all">
                                <BookOpen className="w-8 h-8 text-cyan-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">The Logic</h3>
                            <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-6">Why It Matters</p>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                Every client wants high-res for print and web-res for social. Providing both immediately elevates your brand's professionalism.
                            </p>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setLogicOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-cyan-500/50 pb-0.5 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                                >
                                    Deep Dive / Mechanics <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. The Founder */}
                    <div className="group relative rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden flex flex-col hover:bg-neutral-900/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col h-full items-center text-center z-10">
                            <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-white/10 overflow-hidden mb-6 shadow-xl group-hover:scale-105 transition-transform">
                                <img src="/SS_Suit_Backdrop.jpg" alt="Steven Seagondollar" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">The Founder</h3>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-6">Create with Purpose</p>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                "This tool began as a necessity... I needed an automated pipeline to handle post-shoot organization without losing quality."
                            </p>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setFounderOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-indigo-500/50 pb-0.5 hover:text-indigo-500 hover:border-indigo-500 transition-all"
                                >
                                    Read Message <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-blue-500/10 py-12 bg-neutral-950 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500">
                    <div className="flex flex-col text-center md:text-left gap-1">
                        <span className="flex items-center justify-center md:justify-start gap-2 font-bold text-emerald-400">
                            <Shield className="w-4 h-4" />
                            100% Secure Backend API
                        </span>
                        <p className="text-[10px] text-neutral-600 max-w-md mt-2">
                            PhotoPackager securely manages photos. We preserve original quality completely. DropShock Digital ensures enterprise-grade security on photography resources.
                        </p>
                    </div>
                    <p className="text-center md:text-left">© 2026 DropShock Digital. Created by Steven Seagondollar.</p>
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex gap-6">
                            <button onClick={() => setLegalOpen('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                            <button onClick={() => setLegalOpen('terms')} className="hover:text-white transition-colors">Terms of Use</button>
                            <a href="mailto:support@dropshockdigital.com" className="hover:text-white transition-colors">Support</a>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-white/10"></div>
                        <div className="flex gap-6">
                            <a href="https://github.com/DropShock-Digital" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Request Feature
                            </a>
                            <a href="mailto:support@dropshockdigital.com" className="flex items-center gap-2 hover:text-red-400 transition-colors">
                                <AlertTriangle className="w-3 h-3" /> Report Bug
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Legal Modals */}
            <LogicModal
                isOpen={logicOpen}
                onClose={() => setLogicOpen(false)}
            />
            <PayoffModal
                isOpen={payoffOpen}
                onClose={() => setPayoffOpen(false)}
            />
            <FounderModal
                isOpen={founderOpen}
                onClose={() => setFounderOpen(false)}
            />

            <LegalModal
                isOpen={legalOpen === 'terms'}
                onClose={() => setLegalOpen(null)}
                title="Terms of Use"
                content={
                    <div className="space-y-6">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Jurisdiction: Hesperia, San Bernardino County, CA</p>

                        <section>
                            <h3 className="text-white font-bold mb-2">1. Acceptance of Terms</h3>
                            <p>By accessing or using PhotoPackager ("The Software"), you agree to be bound by these Terms. The Software is owned and operated by <strong>DropShock Digital</strong> and <strong>Steven Seagondollar</strong>, operating out of Hesperia, California.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">2. Limitation of Liability</h3>
                            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-lg text-red-200">
                                <p className="uppercase font-bold text-xs mb-2">Important</p>
                                <p>To the maximum extent permitted by law, DropShock Digital and Steven Seagondollar shall NOT be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this software, including but not limited to data loss, leakage of sensitive information to third-party AI providers, or corruption of local files.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">3. User Responsibility</h3>
                            <p>You acknowledge that you are solely responsible for the content you process. You agree not to use this tool to process illegal content or violate the Terms of Service of any third-party AI provider (e.g., OpenAI, Anthropic, Google).</p>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">4. Accessibility (ADA Compliance)</h3>
                            <p>We are committed to making our software accessible to all users, including those with disabilities. We strive to adhere to WCAG 2.1 Level AA standards. If you encounter accessibility barriers, please contact support@dropshockdigital.com.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">5. Governing Law</h3>
                            <p>These terms are governed by the laws of the State of California. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the state and federal courts located in <strong>San Bernardino County, California</strong>.</p>
                        </section>
                    </div>
                }
            />

            <LegalModal
                isOpen={legalOpen === 'privacy'}
                onClose={() => setLegalOpen(null)}
                title="Privacy Policy"
                content={
                    <div className="space-y-6">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Effect Date: December 1, 2025</p>

                        <section>
                            <h3 className="text-white font-bold mb-2">1. The "No-Data" Philosophy</h3>
                            <p>PhotoPackager operates on a simple principle: <strong>We do not want your data.</strong> The software packages photos locally, ensuring client privacy.</p>
                        </section>

                        <section>
                            <h2 className="text-white font-bold mb-4">2. No Third-Party Tracking</h2>
                            <p>We do not use Google Analytics, Facebook Pixels, or third-party cookies. Your usage remains a private interaction between you and your computer.</p>
                        </section>
                    </div>
                }
            />
        </div>
    )
}
