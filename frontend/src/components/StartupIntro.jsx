import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StartupIntro = ({ onComplete }) => {
    const [stage, setStage] = useState(0); // 0: Boot, 1: Core, 2: Logo, 3: Transition
    const [bootLines, setBootLines] = useState([]);

    // Phase 1: System Boot Text Sequence
    useEffect(() => {
        if (stage !== 0) return;

        const lines = [
            "Initializing Silicon Intelligence Engine...",
            "Loading Architecture Core...",
            "Calibrating Interconnect Fabric...",
            "Mapping Compute Clusters...",
            "Verifying Neural Weights...",
            "System Check: PASS"
        ];

        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < lines.length) {
                setBootLines(prev => [...prev, lines[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
                setTimeout(() => setStage(1), 500);
            }
        }, 300); // Fast typing effect

        return () => clearInterval(interval);
    }, [stage]);

    // Phase 2: AI Core Activation (Timer)
    useEffect(() => {
        if (stage === 1) {
            const timer = setTimeout(() => setStage(2), 2500); // 2.5s for Core animation
            return () => clearTimeout(timer);
        }
    }, [stage]);

    // Phase 3: Logo Reveal (Timer)
    useEffect(() => {
        if (stage === 2) {
            const timer = setTimeout(() => setStage(3), 2000); // 2s for Logo read
            return () => clearTimeout(timer);
        }
    }, [stage]);

    // Phase 4: Transition (Timer)
    useEffect(() => {
        if (stage === 3) {
            const timer = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [stage, onComplete]);

    const handleSkip = () => {
        setStage(3); // Jump to transition
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-[#0B0F1A] flex items-center justify-center overflow-hidden font-mono text-blue-400 select-none pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
        >
            {/* Background Grid - Subtle */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center justify-center h-full pointer-events-none">

                {/* Phase 1: Boot Sequence */}
                <AnimatePresence>
                    {stage === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                            className="text-left w-full max-w-lg space-y-2"
                        >
                            {bootLines.map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-sm md:text-base border-l-2 border-blue-500 pl-3"
                                >
                                    <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    {line}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Phase 2: AI Core Activation */}
                <AnimatePresence>
                    {stage === 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 3, filter: "blur(20px)" }}
                            transition={{ duration: 0.8 }}
                            className="relative flex items-center justify-center"
                        >
                            {/* Pulsing Core */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                {/* Outer Ring */}
                                <motion.div
                                    className="absolute inset-0 border-4 border-dashed border-blue-500/30 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                />
                                {/* Middle Ring */}
                                <motion.div
                                    className="absolute inset-4 border-2 border-purple-500/50 rounded-full"
                                    initial={{ scale: 0.9, opacity: 0.5 }}
                                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                {/* Inner Core */}
                                <motion.div
                                    className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.6)] flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    <motion.div
                                        className="w-full h-full rounded-full bg-white/10"
                                        animate={{ opacity: [0, 0.5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </motion.div>
                            </div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-16 text-xl tracking-widest text-blue-200 uppercase"
                            >
                                Gemini AI Co-Architect Online
                            </motion.h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Phase 3: Logo Reveal */}
                <AnimatePresence>
                    {stage === 2 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <motion.h1
                                className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 mb-4 drop-shadow-2xl"
                                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                style={{ backgroundSize: "200% 200%" }}
                            >
                                SiliceAI Architect
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl md:text-2xl text-gray-400 tracking-[0.3em] font-light"
                            >
                                Designing the Future of Intelligent Silicon
                            </motion.p>

                            {/* Dynamic Fake Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-gray-500"
                            >
                                <div>
                                    <div className="uppercase tracking-widest mb-1">System Node</div>
                                    <div className="text-blue-400 text-lg">5nm</div>
                                </div>
                                <div>
                                    <div className="uppercase tracking-widest mb-1">Frequency</div>
                                    <div className="text-purple-400 text-lg">2.5 GHz</div>
                                </div>
                                <div>
                                    <div className="uppercase tracking-widest mb-1">TDP</div>
                                    <div className="text-blue-400 text-lg">150W</div>
                                </div>
                                <div>
                                    <div className="uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-green-400 text-lg">READY</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Skip Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                onClick={handleSkip}
                className="absolute bottom-8 right-8 text-xs uppercase tracking-widest border border-gray-700 px-4 py-2 hover:bg-white/5 transition-colors z-50 pointer-events-auto cursor-pointer"
            >
                Skip Initialization
            </motion.button>
        </motion.div>
    );
};

export default StartupIntro;
