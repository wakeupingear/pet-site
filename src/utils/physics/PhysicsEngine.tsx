import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { PhysicsObject, Vec2 } from './PhysicsObject';
import { CreatureObject, CreatureEmotion, Creature } from './CreatureObject';

interface ObjEntries {
    [key: string]: PhysicsObject | CreatureObject;
}

export const PhysicsContext = createContext({} as PhysicsFunctions);

export interface PhysicsFunctions {
    active: boolean;
    createCreature: (
        creatureData: Creature,
        position?: Vec2,
        emotion?: CreatureEmotion
    ) => number;
    createObject: () => number;
    destroy: () => void;
    destroyObject: (id: number) => boolean;
    physics: PhysicsState;
    physicsObjects: ObjEntries;
    setCanvasOffset: (position: Vec2) => void;
    setFPS: (fps: number) => void;
    setPhysicsCanvasRef: (ref: React.RefObject<HTMLCanvasElement>) => void;
    updateObject: (
        id: number,
        data: Partial<PhysicsObject | CreatureObject>
    ) => void;
    updatePhysics: (physics: Partial<PhysicsState>) => void;
}

export interface MouseData extends Vec2 {
    down: boolean;
    inCanvas: boolean;
}

// internal state
let canvas: any = null;
let width = 0;
let height = 0;
let offset: Vec2 = { x: 0, y: 0 };
let ctx: any = null;
let fps = 1 / 30; //30 FPS
let timer: NodeJS.Timer | null = null;
let mouse = {} as MouseData;
let idCounter = 0;
let objects: ObjEntries = {};

// mutable state
export interface PhysicsState {
    ag: number;
    density: number;
    drag: number;
    gravity: number;
    interactable: boolean;
    border: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
let state: PhysicsState = {
    ag: 9.81,
    density: 0.47,
    drag: 1.22,
    gravity: 1,
    interactable: true,
    border: { left: 0, right: 0, top: 0, bottom: 0 },
};
const defaultState = { ...state };

interface Props {
    children?: JSX.Element[] | JSX.Element;
}

export default function PhysicsEngine(props: Props) {
    const [physics, setPhysics] = useState(state);
    const [physicsObjects, setPhysicsObjects] = useState<ObjEntries>(objects);
    const updatePhysics = (physics: Partial<PhysicsState>) => {
        state = {
            ...state,
            ...physics,
        };
        setPhysics(state);
    };

    const [active, setActive] = useState(false);
    const [physicsCanvasRef, setPhysicsCanvasRef] =
        useState<React.RefObject<HTMLCanvasElement> | null>(null);
    const setup = (ref = physicsCanvasRef) => {
        canvas = ref?.current;
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;

        canvas.onmousedown = mouseDown;
        canvas.onmouseup = mouseUp;
        canvas.onmouseout = (e: any) => {
            mouseUp(e);
            mouse.inCanvas = false;
        };
        canvas.onmousein = (e: any) => {
            mouse.inCanvas = true;
        };
        canvas.onmousemove = getMousePosition;

        if (timer) clearInterval(timer);
        timer = setInterval(loop, fps * 1000);
    };
    const destroy = () => {
        objects = {};
        setPhysicsObjects(objects);
        state = defaultState;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };
    useEffect(() => {
        if (physicsCanvasRef && physicsCanvasRef.current) {
            setup();
            setActive(true);
            return () => {
                destroy();
                setActive(false);
            };
        }
    }, [physicsCanvasRef]);

    const createObject = (
        position: Vec2 = { x: canvas.width / 2, y: canvas.height / 2 },
        velocity: Vec2 = { x: 0, y: 0 },
        e: number = 0.8,
        mass: number = 1,
        radius: number = 50,
        color: string = '#FF0000',
        fixed: boolean = false,
        grabbable: boolean = true
    ) => {
        const id = idCounter++;
        const obj = new PhysicsObject({
            id,
            position,
            velocity,
            e,
            mass,
            radius,
            color,
            fixed,
            grabbable,
            fps,
        });
        objects[id] = obj;
        setPhysicsObjects({ ...objects });
        return id;
    };

    const updateObject = (
        id: number,
        data: Partial<PhysicsObject | CreatureObject>
    ) => {
        const obj = objects[id];
        if (obj) {
            obj.update(data);
            setPhysicsObjects({ ...objects });
        }
    };

    const createCreature = (
        creatureData: Creature,
        position: Vec2 = { x: canvas.width / 2, y: canvas.height / 2 },
        emotion: CreatureEmotion = CreatureEmotion.Neutral
    ) => {
        const id = idCounter++;
        const obj = new CreatureObject({
            id,
            position,
            velocity: { x: 0, y: 0 },
            e: 0.8,
            mass: 1,
            color: '#FFFFFF',
            radius: 100,
            fixed: false,
            grabbable: true,
            fps,
            emotion,
            creatureData,
        });
        objects[id] = obj;
        setPhysicsObjects({ ...objects });
        return id;
    };

    const getMousePosition = (e: MouseEvent) => {
        mouse.inCanvas = true;
        mouse.x = e.pageX - offset.x;
        mouse.y = e.pageY - offset.y;
    };
    const mouseDown = (e: any) => {
        if (e.which === 1) {
            mouse.down = true;
        }
    };
    const mouseUp = (e: any) => {
        if (e.which === 1) {
            mouse.down = false;
        }
    };

    const setCanvasOffset = (position: Vec2) => {
        offset = position;
    };

    const loop = () => {
        //Clear window at the begining of every frame
        ctx.clearRect(0, 0, width, height);

        if (Object.keys(objects).length === 0) return;

        for (const [id, obj] of Object.entries(objects)) {
            //Pass mouse to every object
            obj.mouse = mouse;

            //Move
            obj.move(state.drag, state.density, state.ag, state.gravity);

            //Check if touching the mouse
            const _touchingMouse =
                obj.grabbable &&
                Math.sqrt(
                    Math.pow(Math.abs(mouse.x - obj.position.x), 2) +
                        Math.pow(Math.abs(mouse.y - obj.position.y), 2)
                ) <= obj.radius;

            if (obj.grabbable && state.interactable) {
                if (_touchingMouse || obj.grabbed) {
                    document.body.style.cursor = 'pointer';
                    if (mouse.down) {
                        obj.velocity = { x: 0, y: 0 };
                        if (!obj.grabbed) {
                            obj.grabbed = true;
                            obj.grabX = mouse.x - obj.position.x;
                            obj.grabY = mouse.y - obj.position.y;
                        }
                    }
                    const _grabX = mouse.x - obj.grabX;
                    const _grabY = mouse.y - obj.grabY;
                    if (!mouse.down) {
                        if (obj.grabbed) {
                            obj.velocity = {
                                x: _grabX - obj.position.x,
                                y: _grabY - obj.position.y,
                            };
                        }
                        obj.grabbed = false;
                    } else if (obj.grabbed) {
                        obj.position.x = _grabX;
                        obj.position.y = _grabY;
                    }
                } else if (obj.touchingMouse)
                    document.body.style.cursor = 'default';
            }
            obj.touchingMouse = _touchingMouse;

            //Rendering the ball
            obj.draw(ctx);

            //Handling the ball collisions
            collisionObject(obj);
            collisionWall(obj);
        }

        setPhysicsObjects({ ...objects });
    };

    function collisionWall(ball: PhysicsObject) {
        if (ball.position.x > width - ball.radius + state.border.right) {
            ball.velocity.x *= ball.e;
            ball.position.x = width - ball.radius + state.border.right;
        }
        if (ball.position.y > height - ball.radius + state.border.bottom) {
            ball.velocity.y *= ball.e;
            ball.position.y = height - ball.radius + state.border.bottom;
        }
        if (ball.position.x < ball.radius + state.border.left) {
            ball.velocity.x *= ball.e;
            ball.position.x = ball.radius + state.border.left;
        }
        if (ball.position.y < ball.radius + state.border.top) {
            ball.velocity.y *= ball.e;
            ball.position.y = ball.radius + state.border.top;
        }
    }
    function collisionObject(b1: PhysicsObject) {
        for (const [id, b2] of Object.entries(objects)) {
            if (
                b1.position.x !== b2.position.x &&
                b1.position.y !== b2.position.y
            ) {
                //quick check for potential collisions using AABBs
                if (
                    b1.position.x + b1.radius + b2.radius > b2.position.x &&
                    b1.position.x < b2.position.x + b1.radius + b2.radius &&
                    b1.position.y + b1.radius + b2.radius > b2.position.y &&
                    b1.position.y < b2.position.y + b1.radius + b2.radius
                ) {
                    //pythagoras
                    let distX = b1.position.x - b2.position.x;
                    let distY = b1.position.y - b2.position.y;
                    let d = Math.sqrt(distX * distX + distY * distY);

                    //checking circle vs circle collision
                    if (d < b1.radius + b2.radius) {
                        let nx = (b2.position.x - b1.position.x) / d;
                        let ny = (b2.position.y - b1.position.y) / d;
                        let p =
                            (2 *
                                (b1.velocity.x * nx +
                                    b1.velocity.y * ny -
                                    b2.velocity.x * nx -
                                    b2.velocity.y * ny)) /
                            (b1.mass + b2.mass);

                        // calulating the point of collision
                        let colPointX =
                            (b1.position.x * b2.radius +
                                b2.position.x * b1.radius) /
                            (b1.radius + b2.radius);
                        let colPointY =
                            (b1.position.y * b2.radius +
                                b2.position.y * b1.radius) /
                            (b1.radius + b2.radius);

                        //stoping overlap
                        b1.position.x =
                            colPointX +
                            (b1.radius * (b1.position.x - b2.position.x)) / d;
                        b1.position.y =
                            colPointY +
                            (b1.radius * (b1.position.y - b2.position.y)) / d;
                        b2.position.x =
                            colPointX +
                            (b2.radius * (b2.position.x - b1.position.x)) / d;
                        b2.position.y =
                            colPointY +
                            (b2.radius * (b2.position.y - b1.position.y)) / d;

                        //updating velocity to reflect collision
                        b1.velocity.x -= p * b1.mass * nx;
                        b1.velocity.y -= p * b1.mass * ny;
                        b2.velocity.x += p * b2.mass * nx;
                        b2.velocity.y += p * b2.mass * ny;
                    }
                }
            }
        }
    }

    const setFPS = (newFPS: number) => {
        fps = 1 / newFPS;
        for (const [id, obj] of Object.entries(objects)) obj.fps = fps;
    };

    const destroyObject = (id: number) => {
        if (!(id in objects)) return false;

        delete objects[id];
        setPhysicsObjects({ ...objects });
        return true;
    };

    return (
        <PhysicsContext.Provider
            value={{
                active,
                createCreature,
                createObject,
                destroy,
                destroyObject,
                physics,
                physicsObjects,
                setCanvasOffset,
                setFPS,
                setPhysicsCanvasRef,
                updateObject,
                updatePhysics,
            }}
        >
            {props.children}
        </PhysicsContext.Provider>
    );
}

export const usePhysics = () => {
    const context = useContext(PhysicsContext);
    if (context === undefined) {
        throw new Error('usePhysics must be used within a PhysicsProvider');
    }
    return context;
};
