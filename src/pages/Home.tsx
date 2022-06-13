import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import '../css/home.css';

import { useAuth } from '../components/Auth';
import CreatureBox from '../components/CreatureBox';
import { useDialogueMapper } from '../components/DialogueMapper';

export default function Home() {
    const {} = useAuth();
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

    return (
        <div className="page">
            <Helmet>
                <title>pet shop</title>
            </Helmet>
            <CreatureBox variant="Window" />
        </div>
    );
}
