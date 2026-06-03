import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Camera, FileImage, Github, Package, Shield, Zap } from 'lucide-react';
import { AnimatedBackground } from './AnimatedBackground';
import { FounderModal } from './FounderModal';
import { LegalModal } from './LegalModal';
import { LogicModal } from './LogicModal';
import { PayoffModal } from './PayoffModal';

interface LandingPageProps {
    onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
    const [legalOpen, setLegalOpen] = useState<'privacy' | 'terms' | null>(null);
    const [logicOpen, setLogicOpen] = useState(false);
    const [payoffOpen, setPayoffOpen] = useState(false);
    const [founderOpen, setFounderOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-sky-500/30 selection:text-sky-100 overflow-x-hidden">
            <AnimatedBackground />

            <header className="relative min-h-screen py-28 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full"
                >
                    <div className="absolute left-1/2 top-52 -translate-x-1/2 w-[34rem] h-[34rem] bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-[2rem] bg-sky-500/25 blur-3xl" />
                            <img
                                src="/PhotoPackager_Patch.png"
                                alt="PhotoPackager logo"
                                className="relative w-44 h-44 md:w-52 md:h-52 rounded-[2rem] object-contain"
                            />
                        </div>
                    </motion.div>

                    <div className="relative max-w-5xl mx-auto">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-cyan-400/20 to-blue-500/15 blur-3xl -z-10"
                            animate={{ opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 5, repeat: Infinity }}
                        />
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-6 leading-tight">
                            Make Photoshoots <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-200 via-cyan-400 to-blue-500">
                                Client Accessible
                            </span>
                        </h1>
                    </div>

                    <p className="text-lg md:text-2xl text-neutral-300 max-w-4xl mx-auto leading-relaxed">
                        Package shoots for delivery.
                    </p>

                    <div className="flex items-center justify-center mt-10">
                        <button
                            onClick={onStart}
                            className="group inline-flex items-center gap-3 px-8 py-5 rounded-full font-semibold text-lg border border-sky-400/20 bg-sky-500/12 text-sky-50 shadow-[0_0_40px_rgba(14,165,233,0.12)] hover:bg-sky-500/16 hover:border-sky-400/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                        >
                            <img src="/PhotoPackager_Icon.png" alt="" aria-hidden="true" className="w-8 h-8 object-contain" />
                            <span>Package Client Delivery</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs uppercase tracking-[0.2em] text-white/35">
                        <span className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-sky-400" />
                            Keep originals by default
                        </span>
                        <span className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            Optimized and compressed outputs
                        </span>
                        <span className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                            Branded README.txt included
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity, times: [0, 0.5, 1], ease: 'easeInOut' }}
                    className="absolute bottom-6 flex flex-col items-center gap-2 cursor-pointer text-white/20 hover:text-white transition-colors"
                >
                        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll to learn more</span>
                        <ArrowDown className="w-5 h-5" />
                    </motion.div>
            </header>

            <section className="px-6 pb-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center max-w-3xl mx-auto">
                        <span className="text-xs font-bold text-sky-400 tracking-[0.2em] uppercase block mb-3">App Preview</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            The interface, framed cleanly.
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.8 }}
                        className="relative mx-auto max-w-6xl"
                    >
                        <div className="absolute inset-0 -z-10 rounded-[3rem] bg-sky-500/20 blur-[160px]" />
                        <div className="absolute inset-x-10 top-10 h-40 -z-10 rounded-full bg-blue-500/10 blur-[90px]" />
                        <div className="relative overflow-hidden rounded-[2rem] border border-sky-500/20 bg-neutral-950/90 p-3 md:p-4 shadow-[0_0_120px_rgba(14,165,233,0.16)]">
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-blue-500/10" />
                            <img
                                src="/windows_app.png"
                                alt="PhotoPackager app screenshot"
                                className="relative w-full rounded-[1.3rem] border border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-24 bg-black relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16 text-center max-w-4xl mx-auto">
                        <span className="text-xs font-bold text-sky-400 tracking-[0.2em] uppercase block mb-3">What the app does</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                            Package Photoshoots for Client Download
                        </h2>
                        <p className="text-lg text-neutral-400 leading-relaxed">
                            Organize, convert, compress, and package without the handwork.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-sky-500/20 transition-all">
                            <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 select-none">1</div>
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-6 text-sky-400">
                                <Camera className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Organize the shoot</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                                Start from the originals and let the app build the folder structure for you.
                            </p>
                            <ul className="text-xs text-neutral-500 space-y-2">
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full" /> Copy or move with care</li>
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full" /> Predictable output folders</li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-cyan-500/20 transition-all">
                            <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 select-none">2</div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                                <FileImage className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Create the right formats</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                                Generate optimized JPG or WebP deliverables, or compressed versions for lighter sharing.
                            </p>
                            <ul className="text-xs text-neutral-500 space-y-2">
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> Quality settings stay configurable</li>
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-cyan-500 rounded-full" /> EXIF handling stays intentional</li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative group hover:border-blue-500/20 transition-all">
                            <div className="absolute top-6 right-6 text-7xl font-bold text-white/5 select-none">3</div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                                <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Deliver the package</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                                Bundle the job into ZIP archives with a README.txt that carries your studio details.
                            </p>
                            <ul className="text-xs text-neutral-500 space-y-2">
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Branding included in the package</li>
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full" /> Easy for clients to navigate</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-sky-500/15 to-transparent" />

            <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="group relative rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden flex flex-col hover:bg-neutral-900/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col h-full items-center text-center z-10">
                            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6 ring-1 ring-sky-500/20 group-hover:ring-sky-500/40 transition-all">
                                <Shield className="w-8 h-8 text-sky-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Keep Originals</h3>
                            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-6">Copy by default</p>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                Keep the source shoot intact unless you explicitly choose otherwise.
                            </p>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setPayoffOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-sky-500/50 pb-0.5 hover:text-sky-400 hover:border-sky-400 transition-all"
                                >
                                    Learn the workflow <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="group relative rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden flex flex-col hover:bg-neutral-900/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col h-full items-center text-center z-10">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 ring-1 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all">
                                <Zap className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Multiple Formats</h3>
                            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6">JPEG and WebP</p>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                Generate optimized and compressed versions for galleries, previews, and quick sharing.
                            </p>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setLogicOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-cyan-500/50 pb-0.5 hover:text-cyan-400 hover:border-cyan-400 transition-all"
                                >
                                    See why it matters <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="group relative rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden flex flex-col hover:bg-neutral-900/50 transition-colors">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-8 flex flex-col h-full items-center text-center z-10">
                            <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-white/10 overflow-hidden mb-6 shadow-xl group-hover:scale-105 transition-transform">
                                <img src="/SS_Suit_Backdrop.jpg" alt="Steven Seagondollar" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">The Founder</h3>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">Built from real post-shoot work</p>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                                PhotoPackager came from the desire to turn a finished shoot into a clean delivery without repeating the same folder work twice.
                            </p>
                            <div className="mt-auto">
                                <button
                                    onClick={() => setFounderOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-blue-500/50 pb-0.5 hover:text-blue-400 hover:border-blue-400 transition-all"
                                >
                                    Read the note <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t border-sky-500/10 py-12 bg-neutral-950 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500">
                    <div className="flex flex-col text-center md:text-left gap-1">
                        <span className="flex items-center justify-center md:justify-start gap-2 font-bold text-sky-400">
                            <Package className="w-4 h-4" />
                            Built for repeatable client delivery
                        </span>
                        <p className="text-[10px] text-neutral-600 max-w-md mt-2">
                            PhotoPackager keeps the workflow explicit: organize the shoot, choose the outputs, and package the handoff with your own branding.
                        </p>
                    </div>
                    <p className="text-center md:text-left">© 2026 DropShock Digital. Created by Steven Seagondollar.</p>
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex gap-6">
                            <button onClick={() => setLegalOpen('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                            <button onClick={() => setLegalOpen('terms')} className="hover:text-white transition-colors">Terms of Use</button>
                            <a href="mailto:support@dropshockdigital.com" className="hover:text-white transition-colors">Support</a>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-white/10" />
                        <div className="flex gap-6">
                            <a href="https://github.com/DropShock-Digital/PhotoPackager" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-sky-400 transition-colors">
                                <Github className="w-3.5 h-3.5" />
                                PhotoPackager on GitHub
                            </a>
                            <a href="mailto:support@dropshockdigital.com" className="flex items-center gap-2 hover:text-red-400 transition-colors">
                                <Shield className="w-3.5 h-3.5" />
                                Contact support
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <LogicModal isOpen={logicOpen} onClose={() => setLogicOpen(false)} />
            <PayoffModal isOpen={payoffOpen} onClose={() => setPayoffOpen(false)} />
            <FounderModal isOpen={founderOpen} onClose={() => setFounderOpen(false)} />

            <LegalModal
                isOpen={legalOpen === 'terms'}
                onClose={() => setLegalOpen(null)}
                title="Terms of Use"
                content={
                    <div className="space-y-6">
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Jurisdiction: Hesperia, San Bernardino County, CA</p>

                        <section>
                            <h3 className="text-white font-bold mb-2">1. Acceptance of Terms</h3>
                            <p>By accessing or using PhotoPackager, you agree to these Terms. The software is owned and operated by DropShock Digital LLC and Steven Seagondollar.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">2. Limitation of Liability</h3>
                            <div className="p-4 bg-sky-900/10 border border-sky-500/20 rounded-lg text-sky-100">
                                <p className="uppercase font-bold text-xs mb-2">Important</p>
                                <p>To the maximum extent permitted by law, DropShock Digital LLC and Steven Seagondollar are not liable for damages resulting from use of the software, including data loss or corruption of local files.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">3. User Responsibility</h3>
                            <p>You are responsible for the content you process and for choosing settings appropriate to your workflow.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">4. Accessibility</h3>
                            <p>If you encounter accessibility barriers, please contact support@dropshockdigital.com.</p>
                        </section>

                        <section>
                            <h3 className="text-white font-bold mb-2">5. Governing Law</h3>
                            <p>These terms are governed by the laws of the State of California, with disputes subject to the courts located in San Bernardino County, California.</p>
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
                        <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Effective Date: December 1, 2025</p>

                        <section>
                            <h3 className="text-white font-bold mb-2">1. The No-Data Philosophy</h3>
                            <p>PhotoPackager is designed to package photos, not to turn your workflow into a data product. The goal is to keep the delivery process focused on your files and your settings.</p>
                        </section>

                        <section>
                            <h2 className="text-white font-bold mb-4">2. No Third-Party Tracking</h2>
                            <p>We do not use analytics cookies or hidden tracking scripts in the site copy here. Your usage should feel like a straightforward product interaction, not a marketing funnel.</p>
                        </section>
                    </div>
                }
            />
        </div>
    );
}
