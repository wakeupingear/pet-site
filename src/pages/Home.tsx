import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import '../css/home.css';

import { useAuth } from '../components/Auth';
import CreatureBox, {
    createCreatureFromTemplate,
} from '../components/CreatureBox';
import { useDialogueMapper } from '../components/DialogueMapper';
import IntroLogo from '../components/IntroLogo';
import { __DEV__ } from '../utils/api';
import { Link } from 'react-router-dom';
import { usePhysics } from '../utils/physics/PhysicsEngine';
import { sleep } from '../utils';

export default function Home() {
    const { progress } = useAuth();
    const { createCreature, updateObject } = usePhysics();
    const { setDomInteractions } = useDialogueMapper();

    useEffect(() => {
        setDomInteractions({
            alert: (val: string) => alert(val),
            askForName: () => {
                const name = prompt('*Right, what is your name...?');
                if (name) {
                    localStorage.setItem('name', name);
                }
            },
            askForEmail: () => {
                const email = prompt('*Now he wants an email?');
                if (email) {
                    localStorage.setItem('email', email);
                }
            },
            askForPassword: () => {
                const password = prompt(
                    '*Password too? This is just a phishing scheme with extra steps!'
                );
                if (password) {
                    localStorage.setItem('password', password);
                }
            },
        });
    }, []);

    const [introCreatureId, setIntroCreatureId] = useState<number>(NaN);
    const [introRolling, setIntroRolling] = useState(false);
    const introLoadCreature = async () => {
        setIntroRolling(false);
        const id = createCreature(createCreatureFromTemplate(), {
            x: -200,
            y: 500,
        });

        updateObject(id, { moveTowardsMouse: false, moveDir: 3 });

        await sleep(2000);
        updateObject(id, { moveTowardsMouse: true, moveDir: 0 });

        await sleep(10000);

        updateObject(id, { moveTowardsMouse: false, moveDir: 3 });

        await sleep(2000);

        setScrollable(true);
    };

    const [scrollable, setScrollable] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const isIntro = progress === 'intro';
        setScrollable(!isIntro);

        if (isIntro) {
            if (__DEV__) introLoadCreature();
            else setIntroRolling(true);
        }
    }, [progress]);

    useEffect(() => {
        if (pageRef.current && progress && !__DEV__) {
            pageRef.current.scrollTo({
                left: progress === 'intro' ? 0 : pageRef.current.scrollWidth,
            });
        }
    }, [pageRef, progress]);

    return (
        <div
            className="page"
            ref={pageRef}
            style={{
                overflowX: scrollable || __DEV__ ? 'scroll' : 'hidden',
            }}
        >
            <Helmet>
                <title>pet shop</title>
            </Helmet>
            <div className="screenContainer">
                <div className="screen ">
                    <CreatureBox
                        front={
                            <>
                                <div className="grass" />
                                <div className="glass" />
                                {introRolling && (
                                    <IntroLogo onFinish={introLoadCreature} />
                                )}
                            </>
                        }
                        size={{ x: 900, y: 500 }}
                        physicsState={{
                            interactable: false,
                            border: {
                                top: 0,
                                right: 600,
                                bottom: 0,
                                left: -600,
                            },
                        }}
                    />
                    <div className="h-5 w-[1000px] rounded-full bg-black shadow-lg" />
                </div>
                <div className="screen bg-red-400">
                    <div className="door">
                        <Link className="doorLink" to={'/store'}>
                            <div className="doorInner">
                                <div className="doorknob" />
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="absolute bottom-0 h-8 w-full bg-slate-500"></div>
            </div>
        </div>
    );
}
