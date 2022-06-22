import Tag from '../../components/Tag';
import { PhysicsObject, PhysicsObjectProps, Vec2 } from './PhysicsObject';

export type Creature = {
    name: string;
    health: number;
    styles: {
        color: string;
        radius: number;
    };
    location: string;
};

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
    creatureData: Creature;
};

export class CreatureObject extends PhysicsObject {
    emotion: CreatureEmotion;
    creatureData: Creature;

    velocityLookDelay = 0;

    constructor(props: CreatureProps) {
        super(props);

        this.emotion = props.emotion;
        this.creatureData = props.creatureData;
        this.radius = this.creatureData.styles.radius;

        Object.setPrototypeOf(this, CreatureObject.prototype);
    }

    move(drag: number, density: number, ag: number, gravity: number) {
        super.move(drag, density, ag, gravity);
    }

    draw = (ctx: CanvasRenderingContext2D) => {};

    render(): JSX.Element | null {
        let target: Vec2 = this.position;
        let shouldLook = true;
        const velThresh = 2;
        if (this.velocityLookDelay > 0) this.velocityLookDelay--;
        if (
            Math.abs(this.velocity.x) > velThresh ||
            Math.abs(this.velocity.y) > velThresh
        ) {
            target = {
                x: this.velocity.x,
                y: this.velocity.y,
            };
            this.velocityLookDelay = 60;
        } else if (
            !this.grabbed &&
            this.mouse.inCanvas &&
            this.velocityLookDelay === 0
        ) {
            target = {
                x: this.mouse.x - this.position.x,
                y: this.mouse.y - this.position.y,
            };
        } else shouldLook = false;

        const eyeAng = shouldLook ? Math.atan2(target.y, target.x) : 0;
        const lenX = shouldLook ? Math.cos(eyeAng) * 0.5 : 0;
        const lenY = shouldLook ? Math.sin(eyeAng) * 0.5 : 0;

        const eye = (
            <div
                className="creatureEye"
                style={{
                    width: this.radius * 0.75 + 'px',
                    height: this.radius * 0.75 + 'px',
                }}
            >
                <div
                    className="creatureEyeball"
                    style={
                        shouldLook
                            ? {
                                  top: `${50 + lenY * 40}%`,
                                  left: `${50 + lenX * 40}%`,
                              }
                            : {}
                    }
                />
            </div>
        );

        return (
            <div
                key={this.id}
                className="physicsObject"
                style={{
                    top: this.position.y + 'px',
                    left: this.position.x + 'px',
                    width: this.radius * 2 + 'px',
                    height: this.radius * 2 + 'px',
                    backgroundColor: this.creatureData.styles.color,
                }}
            >
                <div
                    className={
                        'creatureEyebox ' +
                        (!shouldLook && 'creatureEyeNeutral')
                    }
                    style={{
                        top: this.radius / 6 + lenY * 10 + 'px',
                        left: lenX * 30 + 'px',
                    }}
                >
                    {eye}
                    <div
                        className="creatureEyeSpacer"
                        style={{
                            width: this.radius / 4,
                        }}
                    />
                    {eye}
                </div>
                <Tag />
            </div>
        );
    }
}
