export enum CreatureEmotion {
    Neutral,
    Happy,
    Sad,
    Angry,
    Scared,
    Sleepy,
    Dead,
    Surprised,
    Confused,
    Depressed,
}

export type Vec2 = {
    x: number;
    y: number;
};

export type PhysicsFunctions = {
    createCreature: (position?: Vec2, emotion?: CreatureEmotion) => number;
    createObject: () => number;
    destroy: () => void;
    setCanvasOffset: (x: number, y: number) => void;
    setFPS: (fps: number) => void;
    setup: () => void;
};

interface PhysicsObjectProps {
    id: number;
    position: Vec2;
    velocity: Vec2;
    e: number;
    mass: number;
    radius: number;
    color: string;
    fixed: boolean;
    grabbable: boolean;
}

class PhysicsObject {
    id: number;
    position: Vec2;
    velocity: Vec2;
    e: number;
    mass: number;
    radius: number;
    color: string;
    area: number;
    fixed: boolean;
    grabbable: boolean;

    touchingMouse = false;
    rotation = 0;
    rotationProgress = 0;

    grabbed = false;
    grabX = 0;
    grabY = 0;

    constructor(props: PhysicsObjectProps) {
        this.id = props.id;
        this.position = props.position; //m
        this.velocity = props.velocity; // m/s
        this.e = -props.e; // has no units
        this.mass = props.mass; //kg
        this.radius = props.radius; //m
        this.color = props.color;
        this.area = (Math.PI * props.radius * props.radius) / 10000; //m^2
        this.fixed = props.fixed;
        this.grabbable = props.grabbable;
    }

    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            2 * Math.PI,
            true
        );
        ctx.fill();
        ctx.closePath();
    };
}

export type CreatureProps = PhysicsObjectProps & {
    emotion: CreatureEmotion;
};

class Creature extends PhysicsObject {
    emotion: CreatureEmotion;

    constructor(props: CreatureProps) {
        super(props);

        this.emotion = props.emotion;
    }

    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            2 * Math.PI,
            true
        );
        ctx.fill();
        ctx.closePath();
    };
}

export default function CreaturePhysics(
    canvasRef: any,
    drag: number,
    density: number,
    gravity: number
): PhysicsFunctions {
    let canvas: any = null;
    let ctx: any = null;
    let fps = 1 / 30; //30 FPS
    let timer: NodeJS.Timer | null = null;
    let mouse = { x: 0, y: 0, isDown: false };
    let ag = 9.81; //m/s^2 acceleration due to gravity on earth = 9.81 m/s^2.
    let width = 0;
    let height = 0;
    let offsetX = 0,
        offsetY = 0;
    let objects: { [key: string]: PhysicsObject } = {};

    let idCounter = 0;

    const setup = () => {
        canvas = canvasRef;
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;

        canvas.onmousedown = mouseDown;
        canvas.onmouseup = mouseUp;
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
        });
        objects[id] = obj;
        return id;
    };

    const createCreature = (
        position: Vec2 = { x: canvas.width / 2, y: canvas.height / 2 },
        emotion: CreatureEmotion = CreatureEmotion.Neutral
    ) => {
        const id = idCounter++;
        const obj = new Creature({
            id,
            position,
            velocity: { x: 0, y: 0 },
            e: 0.8,
            mass: 1,
            radius: 100,
            color: '#0000FF',
            fixed: false,
            grabbable: true,
            emotion,
        });
        objects[id] = obj;
        return id;
    };

    const startInterval = () => {
        if (timer) clearInterval(timer);
        timer = setInterval(loop, fps * 1000);
    };

    const getMousePosition = (e: MouseEvent) => {
        mouse.x = e.pageX - offsetX;
        mouse.y = e.pageY - offsetY;
    };
    const mouseDown = (e: any) => {
        if (e.which == 1) {
            mouse.isDown = true;
        }
    };
    const mouseUp = (e: any) => {
        if (e.which == 1) {
            mouse.isDown = false;
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
            if (!obj.fixed && !obj.grabbed) {
                //physics - calculating the aerodynamic forces to drag
                // -0.5 * Cd * A * v^2 * rho
                let fx =
                    -0.5 *
                    drag *
                    density *
                    obj.area *
                    obj.velocity.x *
                    obj.velocity.x *
                    (obj.velocity.x / Math.abs(obj.velocity.x));
                let fy =
                    -0.5 *
                    drag *
                    density *
                    obj.area *
                    obj.velocity.y *
                    obj.velocity.y *
                    (obj.velocity.y / Math.abs(obj.velocity.y));

                fx = isNaN(fx) ? 0 : fx;
                fy = isNaN(fy) ? 0 : fy;
                //Calculating the accleration of the ball
                //F = ma or a = F/m
                let ax = fx / obj.mass;
                let ay = ag * gravity + fy / obj.mass;

                //Calculating the ball velocity
                obj.velocity.x += ax * fps;
                obj.velocity.y += ay * fps;

                //Calculating the position of the ball
                obj.position.x += obj.velocity.x * fps * 100;
                obj.position.y += obj.velocity.y * fps * 100;
            }

            //Check if touching the mouse
            const _touchingMouse =
                obj.grabbable &&
                Math.abs(mouse.x - obj.position.x) < obj.radius &&
                Math.abs(mouse.y - obj.position.y) < obj.radius;
            if (obj.grabbable) {
                if (_touchingMouse || obj.grabbed) {
                    document.body.style.cursor = 'pointer';
                    if (mouse.isDown) {
                        obj.velocity = { x: 0, y: 0 };
                        if (!obj.grabbed) {
                            obj.grabbed = true;
                            obj.grabX = mouse.x - obj.position.x;
                            obj.grabY = mouse.y - obj.position.y;
                        }
                    }
                    const _grabX = mouse.x - obj.grabX;
                    const _grabY = mouse.y - obj.grabY;
                    if (!mouse.isDown) {
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
                b1.position.x != b2.position.x &&
                b1.position.y != b2.position.y
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
        startInterval();
    };

    return {
        createCreature,
        createObject,
        destroy,
        setCanvasOffset,
        setFPS,
        setup,
    };
}
