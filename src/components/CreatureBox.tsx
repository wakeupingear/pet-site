import { useEffect, useState, useRef } from 'react';
import useWindowSize from '../utils/useWindowSize';

import useCreaturePhysics, { PhysicsFunctions } from './CreaturePhysics';
import { useSettings } from './Settings';

interface CreatureBoxProps {
    width?: number | string;
    height?: number | string;
    variant?: string;
}

export default function CreatureBox(props: CreatureBoxProps) {
    const { width: screenWidth, height: screenHeight } = useWindowSize();
    const { width, height } = props;
    const { settings } = useSettings();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        createCreature,
        createObject,
        destroy,
        setCanvasOffset,
        setFPS,
        setup,
        objList,
    }: PhysicsFunctions = useCreaturePhysics(canvasRef.current, 0.47, 1.22, 1);

    useEffect(() => {
        if (canvasRef.current) {
            setup(canvasRef.current);
            createCreature();
        }

        return () => {
            destroy();
        };
    }, [canvasRef]);

    useEffect(() => {
        setFPS(settings.fps);
    }, [settings]);

    const boxRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (boxRef.current) {
            const { offsetTop, offsetLeft } = boxRef.current;
            setCanvasOffset(offsetLeft, offsetTop);
        }
    }, [boxRef, screenWidth, screenHeight]);

    return (
        <div
            className={'creatureBox creatureBox' + props.variant}
            style={{ width, height }}
            ref={boxRef}
        >
            <div className="creatureBoxBack" />
            <canvas
                className="creatureCanvas"
                width={width || '900'}
                height={height || '600'}
                ref={canvasRef}
            >
                Where tf is the JS tho
            </canvas>
            {Object.keys(objList).map((id) => {
                return objList[id].render();
            })}
            <div className="creatureBoxFront" />
        </div>
    );
}
