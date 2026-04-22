import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface PayoffModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PayoffModal({ isOpen, onClose }: PayoffModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-6xl h-fit max-h-[90vh] overflow-y-auto bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-white/5 sticky top-0 bg-neutral-900/95 backdrop-blur z-20">
                            <div>
                                <h2 className="text-2xl font-bold text-white">The Workflow</h2>
                                <p className="text-sky-400 font-bold uppercase tracking-widest text-xs">PhotoPackager at a glance</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white text-lg border-b border-white/10 pb-2">Originals</h4>
                                    <ul className="text-xs text-neutral-400 space-y-3 list-disc pl-4 marker:text-sky-500">
                                        <li>Keep the original shoot intact by copying or moving files according to the job settings you choose.</li>
                                        <li>Generate optimized JPG and WebP deliverables for professional digital handoff.</li>
                                        <li>Use the same workflow every time so the output structure stays predictable for you and the client.</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white text-lg border-b border-white/10 pb-2">Delivery Formats</h4>
                                    <ul className="text-xs text-neutral-400 space-y-3 list-disc pl-4 marker:text-sky-500">
                                        <li>Build client-ready folders without manual renaming, sorting, or rechecking every file.</li>
                                        <li>Choose compressed versions when you need lighter delivery sets for web or sharing.</li>
                                        <li>Save time on repetitive post-shoot prep and spend more time on the actual photography work.</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white text-lg border-b border-white/10 pb-2">Branding</h4>
                                    <ul className="text-xs text-neutral-400 space-y-3 list-disc pl-4 marker:text-sky-500">
                                        <li>Carry the studio name, website, and support email into the generated client README.</li>
                                        <li>Keep metadata handling intentional with preserve or strip options instead of guessing.</li>
                                        <li>Match the delivery style to the job instead of forcing one format for every use case.</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-white text-lg border-b border-white/10 pb-2">Practical Handoff</h4>
                                    <ul className="text-xs text-neutral-400 space-y-3 list-disc pl-4 marker:text-sky-500">
                                        <li>Produce the files clients can actually use instead of just the files the camera produced.</li>
                                        <li>Deliver a shoot as a consistent package rather than a loose folder of images.</li>
                                        <li>Keep the handoff practical, branded, and easy to understand.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
