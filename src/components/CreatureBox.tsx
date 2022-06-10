import { useEffect, useState, useRef } from 'react';

import CreaturePhysics, { PhysicsFunctions } from './CreaturePhysics';
import { useSettings } from './Settings';

interface CreatureBoxProps {
    width?: number | string;
    height?: number | string;
    variant?: string;
}

export default function CreatureBox(props: CreatureBoxProps) {
    const { width, height } = props;
    const { settings } = useSettings();

    const [canvasFunctions, setCanvasFunctions] =
        useState<PhysicsFunctions | null>(null);
    const [fps, setFps] = useState(settings.fps);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        let functions: PhysicsFunctions;
        if (canvasRef.current && !canvasFunctions) {
            functions = CreaturePhysics(canvasRef.current, 0.47, 1.22, 1);
            functions.setup();
            functions.createCreature();
            setCanvasFunctions(functions);
        }

        return () => {
            if (functions) {
                functions.destroy();
            }
        };
    }, [canvasRef]);

    useEffect(() => {
        if (canvasFunctions) {
            canvasFunctions.setFPS(fps);
        }
    }, [fps, canvasFunctions]);

    const boxRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (canvasFunctions && boxRef.current) {
            const { offsetTop, offsetLeft } = boxRef.current;
            canvasFunctions.setCanvasOffset(offsetLeft, offsetTop);
        }
    }, [canvasFunctions, boxRef.current]);

    return (
        <div
            className={'creatureBox shadow creatureBox' + props.variant}
            style={{ width, height }}
            ref={boxRef}
        >
            <div
                className="creatureBoxBack"
                onClick={(e) => e.preventDefault()}
            />
            <canvas
                className="creatureCanvas"
                width={width || '900'}
                height={height || '600'}
                ref={canvasRef}
            >
                Where tf is the JS tho
            </canvas>
            <div
                className="creatureBoxFront"
                onClick={(e) => e.preventDefault()}
            />
        </div>
    );
}
