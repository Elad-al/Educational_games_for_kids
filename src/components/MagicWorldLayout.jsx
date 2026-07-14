import React from 'react';
import { motion } from 'framer-motion';
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const particlesInit = async (engine) => {
    await loadSlim(engine);
};

export default function MagicWorldLayout({ children }) {

    const particlesConfig = {
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: { events: { resize: true } },
        particles: {
            color: { value: ["#FFD700", "#ffffff"] },
            move: {
                direction: "top-right",
                enable: true,
                outModes: { default: "out" },
                random: true,
                speed: 0.8,
                straight: false,
            },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: {
                value: { min: 0.3, max: 0.8 },
                animation: { enable: true, speed: 1, minimumValue: 0.2 }
            },
            shape: { type: "circle" },
            size: {
                value: { min: 3, max: 8 },
                animation: { enable: true, speed: 2, minimumValue: 2, sync: false }
            },
        },
        detectRetina: true,
    };

    return (
        <div className="game-background" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Sun – scales with viewport using clamp() */}
            <div style={{
                position: 'absolute', top: '5%', right: '8%', zIndex: 2,
                width: 'clamp(50px, 9vw, 120px)',
                height: 'clamp(50px, 9vw, 120px)'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <g>
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 50 50"
                            to="360 50 50"
                            dur="30s"
                            repeatCount="indefinite"
                        />
                        <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50 M22 22 L29 29 M71 71 L78 78 M22 78 L29 71 M71 22 L78 29"
                            stroke="#FFD700" strokeWidth="5" strokeLinecap="round"/>
                    </g>
                    <circle cx="50" cy="50" r="25" fill="#FFD700" stroke="#FFA000" strokeWidth="3"/>
                    <circle cx="43" cy="45" r="3" fill="#333"/>
                    <circle cx="57" cy="45" r="3" fill="#333"/>
                    <path d="M42 55 Q50 62 58 55" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
                </svg>
            </div>

            {/* Clouds – viewport-relative widths */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none' }}>
                <motion.div
                    style={{ position: 'absolute', top: '15%', left: '-20%' }}
                    animate={{ x: ['0vw', '120vw'] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                    <svg
                        width="clamp(90px,13vw,200px)"
                        height="clamp(45px,6.5vw,100px)"
                        viewBox="0 0 100 50" fill="#FFF" opacity="0.9"
                    >
                        <circle cx="30" cy="30" r="15"/><circle cx="50" cy="20" r="20"/><circle cx="70" cy="30" r="15"/>
                        <rect x="30" y="30" width="40" height="15" rx="7.5"/>
                    </svg>
                </motion.div>
                <motion.div
                    style={{ position: 'absolute', top: '30%', left: '-20%' }}
                    animate={{ x: ['0vw', '120vw'] }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear", delay: 10 }}
                >
                    <svg
                        width="clamp(70px,10vw,150px)"
                        height="clamp(35px,5vw,75px)"
                        viewBox="0 0 100 50" fill="#FFF" opacity="0.8"
                    >
                        <circle cx="30" cy="30" r="15"/><circle cx="50" cy="20" r="20"/><circle cx="70" cy="30" r="15"/>
                        <rect x="30" y="30" width="40" height="15" rx="7.5"/>
                    </svg>
                </motion.div>
            </div>

            {/* Hills Layer – preserveAspectRatio none so SVG stretches to fill */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '45%', zIndex: 4, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                    {/* Background Bushes */}
                    <path d="M -5 70 Q 10 50 25 70 Q 35 55 45 70 Z" fill="#689F38" opacity="0.9" />
                    <path d="M 70 70 Q 80 50 90 70 Q 95 60 105 70 Z" fill="#689F38" opacity="0.9" />
                    {/* Deep Back Hills */}
                    <path d="M -10 100 Q 30 20 70 100 Z" fill="#7CB342" />
                    <path d="M 30 100 Q 80 15 130 100 Z" fill="#8BC34A" />
                    {/* Mid Hills */}
                    <path d="M -20 100 Q 40 40 90 100 Z" fill="#9CCC65" />
                    <path d="M 40 100 Q 80 50 120 100 Z" fill="#AED581" />
                    {/* Front Ground */}
                    <path d="M -10 85 Q 50 65 110 85 L 110 100 L -10 100 Z" fill="#8BC34A" />
                    <path d="M -10 95 Q 50 80 110 95 L 110 100 L -10 100 Z" fill="#9CCC65" />
                    {/* Dirt Path */}
                    <path d="M 10 100 Q 25 90 40 90 T 80 100 Z" fill="#795548" opacity="0.3" />
                </svg>
            </div>

            {/* Foreground Flowers Left – scales with viewport */}
            <div style={{
                position: 'absolute', bottom: '0%', left: '2%', zIndex: 4, pointerEvents: 'none',
                width: 'clamp(40px, 7vw, 100px)',
                height: 'clamp(60px, 10.5vw, 150px)'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 100 150">
                    <path d="M 40 150 Q 35 80 40 40" stroke="#2E7D32" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <path d="M 40 100 Q 15 90 5 70 Q 20 100 40 110" fill="#4CAF50" />
                    <path d="M 40 120 Q 65 110 75 90 Q 60 120 40 130" fill="#4CAF50" />
                    <g transform="translate(40, 40)">
                        <circle cx="-14" cy="-14" r="14" fill="#F48FB1" />
                        <circle cx="14" cy="-14" r="14" fill="#F48FB1" />
                        <circle cx="-14" cy="14" r="14" fill="#F48FB1" />
                        <circle cx="14" cy="14" r="14" fill="#F48FB1" />
                        <circle cx="0" cy="0" r="12" fill="#FFEB3B" />
                    </g>
                    <path d="M 40 130 Q 70 120 80 90" stroke="#2E7D32" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <g transform="translate(80, 90) scale(0.6)">
                        <circle cx="-14" cy="-14" r="14" fill="#CE93D8" />
                        <circle cx="14" cy="-14" r="14" fill="#CE93D8" />
                        <circle cx="-14" cy="14" r="14" fill="#CE93D8" />
                        <circle cx="14" cy="14" r="14" fill="#CE93D8" />
                        <circle cx="0" cy="0" r="12" fill="#FFEB3B" />
                    </g>
                </svg>
            </div>

            {/* Foreground Flowers Right – scales with viewport */}
            <div style={{
                position: 'absolute', bottom: '0%', right: '2%', zIndex: 4, pointerEvents: 'none',
                width: 'clamp(50px, 8vw, 120px)',
                height: 'clamp(75px, 12vw, 180px)'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 120 180">
                    <path d="M 60 180 Q 70 100 60 50" stroke="#2E7D32" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M 62 130 Q 95 120 110 90 Q 90 130 60 145" fill="#4CAF50" />
                    <path d="M 58 150 Q 25 140 10 110 Q 30 150 60 165" fill="#4CAF50" />
                    <g transform="translate(60, 50)">
                        <circle cx="-16" cy="-16" r="16" fill="#FF5252" />
                        <circle cx="16" cy="-16" r="16" fill="#FF5252" />
                        <circle cx="-16" cy="16" r="16" fill="#FF5252" />
                        <circle cx="16" cy="16" r="16" fill="#FF5252" />
                        <circle cx="0" cy="0" r="14" fill="#FFD700" />
                    </g>
                    <circle cx="20" cy="170" r="4" fill="#FFFFFF" />
                    <circle cx="25" cy="165" r="4" fill="#FFFFFF" />
                    <circle cx="15" cy="165" r="4" fill="#FFFFFF" />
                    <circle cx="20" cy="166" r="2.5" fill="#FFEB3B" />
                </svg>
            </div>

            {/* Small scattered flowers – clamp scales them small on mobile */}
            <div style={{
                position: 'absolute', bottom: '5%', left: '25%', zIndex: 4, pointerEvents: 'none',
                width: 'clamp(14px, 2.5vw, 30px)',
                height: 'clamp(14px, 2.5vw, 30px)'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 30 30">
                    <circle cx="10" cy="15" r="5" fill="#FFFFFF" />
                    <circle cx="20" cy="15" r="5" fill="#FFFFFF" />
                    <circle cx="15" cy="10" r="5" fill="#FFFFFF" />
                    <circle cx="15" cy="20" r="5" fill="#FFFFFF" />
                    <circle cx="15" cy="15" r="3" fill="#FFEB3B" />
                </svg>
            </div>
            <div style={{
                position: 'absolute', bottom: '12%', right: '35%', zIndex: 4, pointerEvents: 'none',
                width: 'clamp(18px, 3vw, 40px)',
                height: 'clamp(18px, 3vw, 40px)'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 40 40">
                    <circle cx="15" cy="20" r="6" fill="#FFFFFF" />
                    <circle cx="25" cy="20" r="6" fill="#FFFFFF" />
                    <circle cx="20" cy="15" r="6" fill="#FFFFFF" />
                    <circle cx="20" cy="25" r="6" fill="#FFFFFF" />
                    <circle cx="20" cy="20" r="4" fill="#FFEB3B" />
                </svg>
            </div>

            {/* Particles */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
                <ParticlesProvider init={particlesInit}>
                    <Particles id="tsparticles" options={particlesConfig} />
                </ParticlesProvider>
            </div>

            {/* Foreground Content */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
}
