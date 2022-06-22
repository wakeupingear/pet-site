import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useAuth } from '../components/Auth';
import { Vec2 } from '../utils/physics/PhysicsObject';
import useWindowSize from '../utils/useWindowSize';

const MARGIN = 10;

export default function Backstreet() {
    const [location, setLocation] = useState<Vec2 | null>(null);
    const { progress, setProgress } = useAuth();
    const broken = progress === 'broken';

    //Anti inspect element
    const { width, height } = useWindowSize();
    const [startingSize, setStartingSize] = useState<Vec2 | null>(null);
    useEffect(() => {
        if (width && height && !startingSize) {
            setStartingSize({ x: width, y: height });
        }
    }, [width, height]);

    const [clicks, setClicks] = useState(0);
    const handleClick = () => {
        setClicks((oldclicks) => oldclicks + 1);
        if (clicks >= 5) setProgress('broken');
    };

    useEffect(() => {
        if (!broken) {
            const path = window.location.pathname;
            let num = 0,
                num2 = 0;
            for (let i = 0; i < path.length; i++) {
                const code = path.charCodeAt(i);
                num += code * code;
                num2 += code * code * code;
            }
            const x = MARGIN + (num % (100 - MARGIN * 2));
            const y = MARGIN + (num2 % (100 - MARGIN * 2));
            setLocation({ x, y });
        }
    }, [broken]);

    return (
        <div className="page">
            <Helmet>
                <title>???</title>
            </Helmet>
            {!broken && (
                <div className="backstreetCovered">
                    {location &&
                        width === startingSize?.x &&
                        height === startingSize?.y && (
                            <div
                                className="backstreetTarget"
                                onClick={handleClick}
                                style={{
                                    position: 'absolute',
                                    left: location.x + '%',
                                    top: location.y + '%',
                                }}
                            ></div>
                        )}
                </div>
            )}
        </div>
    );
}
