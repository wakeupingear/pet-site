import { ReactElement, useEffect, useRef, useState } from 'react';
import { __DEV__ } from '../utils/api';
import useWindowSize from '../utils/useWindowSize';
import { useAuth } from './Auth';
import Button from './Button';

import { PhysicsState, usePhysics } from '../utils/physics/PhysicsEngine';
import { Creature } from '../utils/physics/CreatureObject';
import { useSettings } from './Settings';
import { Vec2 } from '../utils/physics/PhysicsObject';
import getLocation from '../utils/getLocation';

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
    physicsState?: Partial<PhysicsState>;
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
    const { myCreature, destroyMyCreature, setMyCreature } = useAuth();

    const {
        active,
        physicsObjects,
        setCanvasOffset,
        setFPS,
        setPhysics,
        setPhysicsCanvasRef,
    } = usePhysics();

    const localRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        setPhysicsCanvasRef(localRef);
    }, [localRef]);

    useEffect(() => {
        setFPS(settings.fps);
    }, [settings]);

    const boxRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (boxRef.current) {
            const { offsetTop, offsetLeft } = boxRef.current;
            setCanvasOffset({ x: offsetLeft, y: offsetTop });
        }
    }, [boxRef, screenWidth, screenHeight]);

    useEffect(() => {
        if (active) {
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
    }, [active, screenWidth, screenHeight, props.size]);

    useEffect(() => {
        if (active && props.physicsState) {
            setPhysics(props.physicsState);
        }
    }, [active]);

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
            location: getLocation(),
        };
        setMyCreature(newCreature);
    };

    const toggleCreature = () => {
        if (!myCreature) createCreatureFromTemplate();
        else destroyMyCreature();
    };

    return (
        <>
            {__DEV__ && (
                <div>
                    <Button onClick={toggleCreature}>
                        {!myCreature ? 'Create' : 'Destroy'}
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
                    ref={localRef}
                />
                {Object.keys(physicsObjects).map((id) => {
                    return physicsObjects[id].render();
                })}
                <div className="creatureBoxFront">{props.front}</div>
            </div>
        </>
    );
}
