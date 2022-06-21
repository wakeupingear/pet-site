import { useEffect } from 'react';
import { useSpring, config, animated } from 'react-spring';
import { __DEV__ } from '../utils/api';

interface Props {
    onFinish: () => void;
}

export default function IntroLogo(props: Props) {
    const [styles, api] = useSpring(() => ({
        from: { transform: 'translateX(-700px)' },
        to: { transform: 'translateX(0px)' },
        delay: 1000,
        config: {
            ...config.wobbly,
        },
    }));

    const sequence = async () => {
        await new Promise((f) => setTimeout(f, 2000));
        api.start({
            to: { transform: 'translateX(700px)' },
        });
        await new Promise((f) => setTimeout(f, 2000 + (!__DEV__ ? 2000 : 0)));
        props.onFinish();
    };

    useEffect(() => {
        sequence();
    }, []);

    return (
        <animated.div style={styles} className="intro">
            <h1>'Another Pet Sim'</h1>
            <h3>wf/jf</h3>
        </animated.div>
    );
}
