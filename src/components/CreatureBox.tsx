import { ReactElement, useEffect, useRef, useState } from 'react';
import { __DEV__ } from '../utils/api';
import useWindowSize from '../utils/useWindowSize';
import { useAuth } from './Auth';
import Button from './Button';

import usePhysicsEngine, { PhysicsFunctions } from './PhysicsEngine';
import { Creature } from '../utils/physics/CreatureObject';
import { useSettings } from './Settings';
import { Vec2 } from '../utils/physics/PhysicsObject';

const COLORS = [
    '#6A5ACD',
    '#FF7F50',
    '#FF1493',
    '#FFD700',
    '#66CDAA',
    '#EE82EE',
    '#DC143C',
    '$BA55D3',
];

interface CreatureBoxProps {
    back?: ReactElement;
    front?: ReactElement;
    marginHorizontal?: number;
    marginVertical?: number;
    size?: Vec2;
    variant?: string;
}

export default function CreatureBox(props: CreatureBoxProps) {
    const { width: screenWidth, height: screenHeight } = useWindowSize();
    const originalSize = props.size || { x: 900, y: 600 };
    const [size, setSize] = useState(originalSize);
    const { settings } = useSettings();
    const { creature, setCreature } = useAuth();
    const [creatureId, setCreatureId] = useState<number>(NaN);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        createCreature,
        createObject,
        destroy,
        destroyObject,
        setCanvasOffset,
        setFPS,
        setup,
        objList,
        updateCreature,
    }: PhysicsFunctions = usePhysicsEngine(canvasRef.current, 0.47, 1.22, 1);

    useEffect(() => {
        if (canvasRef.current) {
            setup(canvasRef.current);
        }

        return () => {
            destroy();
        };
    }, [canvasRef]);

    useEffect(() => {
        if (creature) {
            if (!isNaN(creatureId)) updateCreature(creatureId, creature);
            else {
                const id = createCreature(creature);
                setCreatureId(id);
            }
        }
    }, [creature]);

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

    useEffect(() => {
        if (canvasRef.current) {
            const { marginHorizontal = 6, marginVertical = 6 } = props;
            const newSize = originalSize;
            if (screenWidth) {
                newSize.x = Math.min(
                    screenWidth - marginHorizontal * 2,
                    newSize.x
                );
            }
            if (screenHeight) {
                newSize.y = Math.min(
                    screenHeight - marginVertical * 2,
                    newSize.y
                );
            }

            setSize(newSize);
            // Change object position here
        }
    }, [canvasRef, screenWidth, screenHeight, props.size]);

    const createCreatureFromTemplate = (
        creatureData: Partial<Creature> = {}
    ) => {
        const newCreature: Creature = {
            name: '',
            health: 0,
            ...creatureData,
            styles: {
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                radius: Math.round(70 + Math.random() * 80),
                ...creatureData.styles,
            },
        };
        setCreature(newCreature);
    };

    const toggleCreature = () => {
        if (isNaN(creatureId)) {
            createCreatureFromTemplate();
        } else {
            if (destroyObject(creatureId)) {
                setCreature(null);
                setCreatureId(NaN);
            }
        }
    };

    return (
        <>
            {__DEV__ && false && (
                <div>
                    <Button onClick={toggleCreature}>
                        {isNaN(creatureId) ? 'Create' : 'Destroy'}
                    </Button>
                </div>
            )}
            <div
                className={'creatureBox creatureBox' + props.variant}
                style={{ width: size.x, height: size.y }}
                ref={boxRef}
            >
                <div className="creatureBoxBack">{props.back}</div>
                <canvas
                    className="creatureCanvas"
                    width={size.x}
                    height={size.y}
                    ref={canvasRef}
                />
                {Object.keys(objList).map((id) => {
                    return objList[id].render();
                })}
                <div className="creatureBoxFront">{props.front}</div>
            </div>
        </>
    );
}
