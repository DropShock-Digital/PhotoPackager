import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, AlertTriangle, Zap } from 'lucide-react';

interface LogicModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LogicModal({ isOpen, onClose }: LogicModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 overflow-y-auto"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 overflow-y-auto pointer-events-none"
                    >
                        <div className="min-h-full flex items-center justify-center p-4">
                            <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative">
                                <div className="p-8 border-b border-white/5 flex items-center justify-center sticky top-0 bg-neutral-900/95 backdrop-blur z-20">
                                    <h2 className="text-2xl font-bold">
                                        The Logic: <span className="text-sky-400">Why Multiple Deliverables Matter</span>
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="absolute right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-neutral-400 hover:text-white" />
                                    </button>
                                </div>

                                <div className="p-8 md:p-16 relative">
                                    <div className="relative border-l-2 border-white/10 pl-8 md:pl-16 space-y-24">
                                        <div className="relative">
                                            <div className="absolute -left-[41px] md:-left-[73px] top-0 w-5 h-5 bg-neutral-900 border-4 border-sky-900 rounded-full" />
                                            <div className="grid md:grid-cols-12 gap-8">
                                                <div className="md:col-span-4">
                                                    <div className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                                                        <BookOpen className="w-5 h-5 text-sky-400" />
                                                        Keep Originals Safe
                                                    </div>
                                                    <div className="text-neutral-500 text-sm">The Starting Point</div>
                                                </div>
                                                <div className="md:col-span-8 space-y-6">
                                                    <div>
                                                        <strong className="text-white block mb-2">Copy before you transform</strong>
                                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                                            The safest default is to leave your source files untouched and create the delivery package from copies. That keeps the original shoot available for archive, retouching, or re-use later.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-white block mb-2">Choose the output mix</strong>
                                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                                            From the same shoot, PhotoPackager can generate optimized JPEG/WebP versions, compressed variants for lighter delivery, and original-file exports when you need them.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -left-[41px] md:-left-[73px] top-0 w-5 h-5 bg-neutral-900 border-4 border-cyan-900 rounded-full" />
                                            <div className="grid md:grid-cols-12 gap-8">
                                                <div className="md:col-span-4">
                                                    <div className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                                                        <AlertTriangle className="w-5 h-5 text-cyan-400/70" />
                                                        Format Choices
                                                    </div>
                                                    <div className="text-cyan-400/50 text-sm">The Practical Part</div>
                                                </div>
                                                <div className="md:col-span-8 space-y-6">
                                                    <div>
                                                        <strong className="text-white block mb-2">Optimized files for normal delivery</strong>
                                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                                            Use optimized versions when you want strong quality with smaller files for galleries, proofs, or standard client handoff.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-white block mb-2">Compressed files for lighter sharing</strong>
                                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                                            Use compressed variants when you want quick-loading preview sets, smaller downloads, or web use without making the client sort through the raw originals.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -left-[41px] md:-left-[73px] top-0 w-5 h-5 bg-black border-4 border-sky-400 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5)]" />
                                            <div className="grid md:grid-cols-12 gap-8">
                                                <div className="md:col-span-4">
                                                    <div className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                                                        <Zap className="w-5 h-5 text-sky-400" />
                                                        Brand the Handoff
                                                    </div>
                                                    <div className="text-sky-400 text-sm">The Delivery Layer</div>
                                                </div>
                                                <div className="md:col-span-8 space-y-6">
                                                    <div>
                                                        <strong className="text-white block mb-2">Folder structure that makes sense</strong>
                                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                                            Package outputs into predictable folders so the client can find originals, optimized files, and compressed versions without guesswork.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-white block mb-2">A README.txt that travels with the package</strong>
                                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                                            Include your studio name, website, and support contact in the delivery so the handoff stays clear and branded.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-white/5 bg-neutral-900/50 text-center">
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors"
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
