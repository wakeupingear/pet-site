import PhysicsObject, { PhysicsObjectProps } from "./PhysicsObject";

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

export type CreatureProps = PhysicsObjectProps & {
    emotion: CreatureEmotion;
};

export default class CreatureObject extends PhysicsObject {
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

    move(drag: number, density: number, ag: number, gravity: number, fps: number) {
        super.move(drag,density,ag,gravity,fps);
    }
}
