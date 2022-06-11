export type Vec2 = {
    x: number;
    y: number;
};

export interface PhysicsObjectProps {
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

export default class PhysicsObject {
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

    draw(ctx: CanvasRenderingContext2D) {
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

    move(drag: number, density: number, ag: number, gravity: number, fps: number) {
        if (!this.fixed && !this.grabbed) {
            //physics - calculating the aerodynamic forces to drag
            // -0.5 * Cd * A * v^2 * rho
            let fx =
                -0.5 *
                drag *
                density *
                this.area *
                this.velocity.x *
                this.velocity.x *
                (this.velocity.x / Math.abs(this.velocity.x));
            let fy =
                -0.5 *
                drag *
                density *
                this.area *
                this.velocity.y *
                this.velocity.y *
                (this.velocity.y / Math.abs(this.velocity.y));

            fx = isNaN(fx) ? 0 : fx;
            fy = isNaN(fy) ? 0 : fy;
            //Calculating the accleration of the ball
            //F = ma or a = F/m
            let ax = fx / this.mass;
            let ay = ag * gravity + fy / this.mass;

            //Calculating the ball velocity
            this.velocity.x += ax * fps;
            this.velocity.y += ay * fps;

            //Calculating the position of the ball
            this.position.x += this.velocity.x * fps * 100;
            this.position.y += this.velocity.y * fps * 100;
        }
    }
}
