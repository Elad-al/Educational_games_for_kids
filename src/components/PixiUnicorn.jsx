import React, { useRef, useState, useEffect } from 'react';
import { Container, Sprite, Graphics, useTick, withFilters } from '@pixi/react';
import * as PIXI from 'pixi.js';

// Load the high-fidelity unicorn image texture
const unicornTexture = PIXI.Texture.from('./assets/images/disney_pink_unicorn.png');

// Create a small 64x64 noise texture for the displacement map
const canvas = document.createElement('canvas');
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext('2d');
for (let i = 0; i < 64*64; i++) {
    const v = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i % 64, Math.floor(i / 64), 1, 1);
}
const noiseTexture = PIXI.Texture.from(canvas);
const displacementSprite = new PIXI.Sprite(noiseTexture);
displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
const displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
displacementFilter.scale.x = 2; // Subtle wind ripple
displacementFilter.scale.y = 5;

// HOC for Filters in @pixi/react
const Filters = withFilters(Container, {
    displacement: displacementFilter
});

export default function PixiUnicorn({ x, y, isGalloping }) {
    const [time, setTime] = useState(0);

    useTick((delta) => {
        setTime((prev) => prev + delta * 0.05);
        // Move the displacement sprite to create scrolling wind
        displacementSprite.x += 1 * delta;
        displacementSprite.y -= 1 * delta;
    });

    // Breathing calculations
    const breatheY = isGalloping ? 1 : 1 + Math.sin(time) * 0.015;
    const bounceY = isGalloping ? Math.abs(Math.sin(time * 3)) * 20 : 0;
    const bodyRot = isGalloping ? Math.sin(time * 3) * 0.05 : 0;

    // Blinking logic (blink every few seconds)
    const blinkCycle = time % 10;
    const isBlinking = blinkCycle > 9.5 && blinkCycle < 9.7;

    return (
        <Filters 
            x={x} 
            y={y - bounceY} 
            rotation={bodyRot}
            scale={{ x: 1, y: breatheY }}
            displacement={displacementFilter}
        >
            <Sprite
                texture={unicornTexture}
                anchor={0.5}
                blendMode={PIXI.BLEND_MODES.MULTIPLY}
                scale={0.4}
            />
            {/* Draw a procedural blinking eyelid over the eye */}
            {isBlinking && (
                <Graphics
                    draw={(g) => {
                        g.clear();
                        g.beginFill(0xff8a80); // Pink eyelid color
                        g.drawEllipse(-15, -45, 12, 12);
                        g.endFill();
                    }}
                />
            )}
        </Filters>
    );
}
