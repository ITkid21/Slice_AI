import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
    const canvasRef = useRef(null);
    const [status, setStatus] = useState("INITIALIZING KERNEL");
    const [progress, setProgress] = useState(0);

    // Particle Animation Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.color = Math.random() > 0.5 ? '#60a5fa' : '#a78bfa'; // Blue or Purple
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX * 3;
                    this.y -= directionY * 3;
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            const numberOfParticles = (canvas.width * canvas.height) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();

                // Connect particles
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(100, 116, 139, ${1 - distance / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }

                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        // Event Listeners
        const handleMouseMove = (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Text Sequence Logic
    useEffect(() => {
        console.log("LoadingScreen Mounted");
        const statuses = [
            "INITIALIZING KERNEL...",
            "LOADING NEURAL WEIGHTS...",
            "CALIBRATING PHYSICS ENGINE...",
            "CONNECTING TO SILICON FAB...",
            "SYSTEM READY"
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < statuses.length) {
                setStatus(statuses[i]);
                i++;
            }
        }, 800);

        // Progress Bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    console.log("Loading Complete. Triggering onComplete.");
                    return 100;
                }
                return prev + 2 + Math.random() * 3; // Minimum 2% increment to ensure speed
            });
        }, 100); // Faster updates (100ms)

        return () => {
            console.log("LoadingScreen Unmounted");
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, []);

    // Trigger onComplete when progress is 100
    useEffect(() => {
        if (progress >= 100) {
            const timer = setTimeout(() => {
                console.log("Calling onComplete callback");
                onComplete();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [progress, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center overflow-hidden cursor-default pointer-events-none"
        >
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="z-10 text-center space-y-8 relative">
                {/* Main Title with Popping Letters */}
                <div className="flex justify-center space-x-2 md:space-x-4">
                    {"SLICE AI".split("").map((letter, index) => {
                        // Calculate threshold for each letter (roughly evenly distributed)
                        // Total 8 chars. 100 / 8 = 12.5% per letter.
                        const threshold = (index + 1) * 10; // Slightly earlier thresholds
                        const isVisible = progress >= threshold;

                        return (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0, y: 50, rotateX: 90 }}
                                animate={isVisible ? { opacity: 1, scale: 1, y: 0, rotateX: 0 } : { opacity: 0, scale: 0, y: 50, rotateX: 90 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 15,
                                    mass: 0.8
                                }}
                                className={`text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${index < 5 ? 'from-blue-500 to-blue-400' : 'from-purple-500 to-pink-500'} drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]`}
                            >
                                {letter === " " ? "\u00A0" : letter}
                            </motion.span>
                        );
                    })}
                </div>

                {/* Subtitle / Status */}
                <div className="h-8">
                    <motion.p
                        key={status}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-blue-400 font-mono text-sm tracking-[0.2em]"
                    >
                        {'>'} {status}
                    </motion.p>
                </div>

                {/* Removed Progress Bar */}
            </div>

            <div className="absolute bottom-10 left-10 text-gray-600 text-xs font-mono">
                MOUSE INTERACTION ENABLED // QUANTUM DECOHERENCE ACTIVE
            </div>

            {/* Skip Button */}
            <button
                onClick={onComplete}
                className="absolute bottom-10 right-10 z-50 cursor-pointer pointer-events-auto text-gray-500 hover:text-white text-xs font-mono border border-gray-800 hover:border-gray-500 px-3 py-1 rounded transition-colors"
            >
                [ SKIP STARTUP ]
            </button>
        </motion.div>
    );
};

export default LoadingScreen;
