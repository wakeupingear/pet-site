import { useState } from 'react';

import { PhysicsObject, Vec2 } from '../utils/physics/PhysicsObject';
import {
    CreatureObject,
    CreatureEmotion,
    Creature,
} from '../utils/physics/CreatureObject';

interface ObjEntries {
    [key: string]: PhysicsObject | CreatureObject;
}

export type PhysicsFunctions = {
    createCreature: (
        creatureData: Creature,
        position?: Vec2,
        emotion?: CreatureEmotion
    ) => number;
    createObject: () => number;
    destroy: () => void;
    destroyObject: (id: number) => boolean;
    setCanvasOffset: (x: number, y: number) => void;
    setFPS: (fps: number) => void;
    setup: (ref: HTMLCanvasElement) => void;
    objList: ObjEntries;
    updateCreature: (
        id: number,
        creatureData?: Creature,
        position?: Vec2,
        emotion?: CreatureEmotion
    ) => void;
};

export interface MouseData extends Vec2 {
    down: boolean;
    inCanvas: boolean;
}

let canvas: any = null;
let ctx: any = null;
let fps = 1 / 30; //30 FPS
let timer: NodeJS.Timer | null = null;
let mouse = {} as MouseData;
let ag = 9.81; //m/s^2 acceleration due to gravity on earth = 9.81 m/s^2.
let width = 0;
let height = 0;
let offsetX = 0,
    offsetY = 0;
let objects: ObjEntries = {};
let idCounter = 0;

export default function usePhysicsEngine(
    canvasRef: any,
    drag: number,
    density: number,
    gravity: number
): PhysicsFunctions {
    const [objList, setObjList] = useState<ObjEntries>(objects);

    const setup = (ref = canvasRef) => {
        canvas = ref;
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
        startInterval();
    };
    const destroy = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

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
        return id;
    };

    const updateCreature = (
        id: number,
        creatureData?: Creature,
        position?: Vec2,
        emotion?: CreatureEmotion
    ) => {
        if (objects[id] instanceof CreatureObject) {
            const obj = objects[id] as CreatureObject;
            if (creatureData !== undefined) obj.creatureData = creatureData;
            if (position !== undefined) obj.position = position;
            if (emotion !== undefined) obj.emotion = emotion;
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
        return id;
    };

    const startInterval = () => {
        if (timer) clearInterval(timer);
        timer = setInterval(loop, fps * 1000);
    };

    const getMousePosition = (e: MouseEvent) => {
        mouse.inCanvas = true;
        mouse.x = e.pageX - offsetX;
        mouse.y = e.pageY - offsetY;
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

    const setCanvasOffset = (x: number, y: number) => {
        offsetX = x;
        offsetY = y;
    };

    const loop = () => {
        //Clear window at the begining of every frame
        ctx.clearRect(0, 0, width, height);
        for (const [id, obj] of Object.entries(objects)) {
            //Pass mouse to every object
            obj.mouse = mouse;

            //Move
            obj.move(drag, density, ag, gravity);

            //Check if touching the mouse
            const _touchingMouse =
                obj.grabbable &&
                Math.sqrt(
                    Math.pow(Math.abs(mouse.x - obj.position.x), 2) +
                        Math.pow(Math.abs(mouse.y - obj.position.y), 2)
                ) <= obj.radius;
            if (obj.grabbable) {
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

        //Update the state
        setObjList({ ...objects });
    };

    function collisionWall(ball: PhysicsObject) {
        if (ball.position.x > width - ball.radius) {
            ball.velocity.x *= ball.e;
            ball.position.x = width - ball.radius;
        }
        if (ball.position.y > height - ball.radius) {
            ball.velocity.y *= ball.e;
            ball.position.y = height - ball.radius;
        }
        if (ball.position.x < ball.radius) {
            ball.velocity.x *= ball.e;
            ball.position.x = ball.radius;
        }
        if (ball.position.y < ball.radius) {
            ball.velocity.y *= ball.e;
            ball.position.y = ball.radius;
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

        startInterval();
    };

    const destroyObject = (id: number) => {
        if (!(id in objects)) return false;

        delete objects[id];
        setObjList(objects);
        return true;
    };

    return {
        createCreature,
        createObject,
        destroy,
        destroyObject,
        setCanvasOffset,
        setFPS,
        setup,
        objList,
        updateCreature,
    };
}