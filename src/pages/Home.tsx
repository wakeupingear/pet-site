import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import '../css/home.css';

import { useAuth } from '../components/Auth';
import CreatureBox from '../components/CreatureBox';
import { useDialogueMapper } from '../components/DialogueMapper';
import IntroLogo from '../components/IntroLogo';
import { __DEV__ } from '../utils/api';

export default function Home() {
    const { progress } = useAuth();
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

    const [introRolling, setIntroRolling] = useState(false);

    const introLoadCreature = async () => {
        setIntroRolling(false);
        setScrollable(true);
    };

    const [scrollable, setScrollable] = useState(false);
    useEffect(() => {
        const isIntro = progress === 'intro';
        setScrollable(!isIntro);

        if (isIntro) {
            setIntroRolling(true);
        }
    }, [progress]);

    return (
        <div
            className="page"
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
                    />
                    <div className="h-5 w-[1000px] rounded-full bg-black shadow-lg" />
                </div>
                <div className="screen bg-red-400">
                    <div className="door">
                        <div>
                            <div className="doorknob" />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 h-8 w-full bg-slate-500"></div>
            </div>
        </div>
    );
}
