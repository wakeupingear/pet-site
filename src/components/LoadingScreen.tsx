import { animated, useSpring } from 'react-spring';
import { SyncLoader } from 'react-spinners';

interface Props {
    code: number;
}

export default function LoadingScreen({ code }: Props) {
    const loadingSpinner = useSpring({
        to: { opacity: 1 },
        from: { opacity: 0 },
        delay: 1000,
    });
    const loadingText = useSpring({
        to: { opacity: 1 },
        from: { opacity: 0 },
        delay: 2000,
    });
    const loadingErrorCode = useSpring({
        to: { opacity: 1 },
        from: { opacity: 0 },
        delay: 3000,
    });

    return (
        <div className="loadingScreen">
            <div className="curtain curtainLeft" />
            <div className="curtain curtainRight" />
            <div className="loadingScreenSpinner">
                <animated.div style={loadingSpinner}>
                    <SyncLoader
                        speedMultiplier={1.25}
                        color="white"
                        size={50}
                        margin={10}
                    />
                </animated.div>
                <animated.div style={loadingText} className="serverLoadingText">
                    <h2>server may or may not be down</h2>
                </animated.div>
                <animated.div
                    style={loadingErrorCode}
                    className="serverLoadingText serverErrorCode"
                >
                    <h2>{code}</h2>
                </animated.div>
            </div>
        </div>
    );
}
