import { useEffect, useState } from 'react';

interface Props {
    active?: boolean;
    error?: boolean;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    children?: React.ReactNode | React.ReactNode[];
}

export default function Button({
    active = true,
    children,
    error,
    onClick,
}: Props) {
    const [errorAnimation, setErrorAnimation] = useState(false);
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        if (onClick && active && !errorAnimation) onClick(e);
    };

    useEffect(() => {
        if (error) {
            setErrorAnimation(true);
            setTimeout(() => {
                setErrorAnimation(false);
            }, 500);
        }
    }, [error]);

    return (
        <div
            className={
                'button ' +
                (active && 'buttonActive ') +
                (errorAnimation && 'buttonError')
            }
            onClick={handleClick}
        >
            {children}
        </div>
    );
}
