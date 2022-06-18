import React, { createRef, useEffect, useRef, useState } from 'react';
import { useSettings } from './Settings';

const NUM_DOTS = 20;
const PRECISION_PV = 10;
const LERP = 0.3;

type Dot = {
    x: number;
    y: number;
    id: number;
};

let dots: Dot[] = Array.apply(null, Array(NUM_DOTS)).map(function (x, index) {
    return {
        x: 0,
        y: 0,
        id: index,
    };
});

let active = false;
let mouseOut = true;
let mouseDown = false;
let snapNext = false;
let stoppedMoving = false;

const onMouseOut = () => {
    mouseOut = false;
    if (!active) {
        active = true;
        snapNext = true;
    }
};
const onMouseEnter = () => (mouseOut = true);
const onMouseDown = () => (mouseDown = true);
const onMouseUp = () => (mouseDown = false);

const mouse = {
    x: 0,
    y: 0,
};

const updateMouse = (event: MouseEvent) => {
    mouse.x = event.pageX;
    mouse.y = event.pageY;

    if (snapNext) {
        dots.forEach((dot) => {
            dot.x = mouse.x;
            dot.y = mouse.y;
        });
        snapNext = false;
    }
};

export default function Cursor() {
    const { settings } = useSettings();

    const elementsRef = useRef(
        Array.from({ length: NUM_DOTS }, () => createRef<any>())
    );

    useEffect(() => {
        if (settings.cursorTrail || true) {
            window.addEventListener('mousemove', updateMouse);
            window.addEventListener('mouseover', onMouseEnter);
            window.addEventListener('mouseout', onMouseOut);
            window.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mouseup', onMouseUp);

            const animate = () => {
                let { x, y } = mouse;

                dots.forEach((dot, index) => {
                    if (index === NUM_DOTS - 1)
                        stoppedMoving = Boolean(dot.x == x && dot.y === y);

                    if (stoppedMoving && mouseOut) active = false;

                    dot.x = x;
                    dot.y = y;

                    if (index < NUM_DOTS - 1) {
                        const nextDot = dots[index + 1];
                        x =
                            Math.round(
                                (x +
                                    (nextDot.x - dot.x) * LERP +
                                    Number.EPSILON) *
                                    PRECISION_PV
                            ) / PRECISION_PV;
                        y =
                            Math.round(
                                (y +
                                    (nextDot.y - dot.y) * LERP +
                                    Number.EPSILON) *
                                    PRECISION_PV
                            ) / PRECISION_PV;
                    }

                    if (
                        elementsRef.current[index] &&
                        elementsRef.current[index].current
                    ) {
                        elementsRef.current[index].current.style.left =
                            x + 'px';
                        elementsRef.current[index].current.style.top = y + 'px';
                        elementsRef.current[index].current.style.opacity =
                            Number(!stoppedMoving && !mouseDown);
                    }
                });

                requestAnimationFrame(animate);
            };

            animate();

            return () => {
                window.removeEventListener('mousemove', updateMouse);
                window.document.removeEventListener('mouseover', onMouseEnter);
                window.document.removeEventListener('mouseout', onMouseOut);
                window.document.removeEventListener('mousedown', onMouseDown);
                window.document.removeEventListener('mouseup', onMouseUp);
            };
        }
    }, [settings.cursorTrail, elementsRef]);

    return (
        <>
            {dots.map((dot, index) => {
                const size = (NUM_DOTS - index) / (NUM_DOTS * 1.4) + 'rem';
                return (
                    <div
                        ref={elementsRef.current[index]}
                        key={dot.id}
                        className="cursorPoint"
                        style={{
                            width: size,
                            height: size,
                        }}
                    />
                );
            })}
        </>
    );
}
