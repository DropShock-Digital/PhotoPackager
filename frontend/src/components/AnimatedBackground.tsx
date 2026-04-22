import { motion } from 'framer-motion'

export function AnimatedBackground() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Animated Background Blobs */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-sky-500/18 blur-[120px] rounded-full"
            />
            <motion.div
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-600/12 blur-[100px] rounded-full"
            />
            <motion.div
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                    x: [-20, 20, -20],
                    y: [-20, 20, -20],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/3 w-[40%] h-[40%] bg-cyan-500/10 blur-[90px] rounded-full"
            />
        </div>
    )
}
