import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import useDigitInput from 'react-digit-input';

import { useAuth } from './Auth';
import Button from './Button';

interface Props {
    open: boolean;
    type: string;
}

enum RequestStatus {
    UserInput,
    Loading,
    Success,
    Error,
}

export default function LoginPopup(props: Props) {
    const { apiPost, userInfo, updateUserInfo } = useAuth();
    const [loading, setLoading] = useState<RequestStatus>(
        RequestStatus.UserInput
    );

    const [email, setEmail] = useState('willf668@gmail.com');
    const [password, setPassword] = useState('vio');
    const [password2, setPassword2] = useState('vio');
    const [showPassword, setShowPassword] = useState(false);

    const isLogin = props.type === 'login';
    const waitingForEmail = !isLogin && userInfo.sessionToken !== 'empty';

    const valid = () => {
        if (!email) return false;
        const emailInd = email.indexOf('@');
        const domainInd = email.lastIndexOf('.');
        return Boolean(
            loading !== RequestStatus.Loading &&
                email &&
                emailInd > 0 &&
                emailInd < email.length - 1 &&
                domainInd > -1 &&
                domainInd > emailInd &&
                domainInd < email.length - 1 &&
                password &&
                password2 &&
                password === password2
        );
    };

    const connect = async (path: string) => {
        setLoading(RequestStatus.Loading);
        const response = await apiPost(path, { email, password });
        if (response.status === 200) {
            updateUserInfo({
                email: email,
                sessionToken: response.sessionToken,
            });
            setLoading(RequestStatus.Success);
        } else {
            setLoading(RequestStatus.Error);
        }
    };

    const passwordInputType = showPassword ? 'text' : 'password';

    const [code, onChange] = useState('');
    const digits = useDigitInput({
        acceptedCharacters: /^[0-9]$/,
        length: 6,
        value: code,
        onChange,
    });

    const checkCode = async (code: string) => {
        const numCode = Number(code);
        if (numCode < 100000) return;
        setLoading(RequestStatus.Loading);
        const response = await apiPost('/signup/code', {
            email,
            code: numCode,
        });
        if (response.status === 200) {
            setLoading(RequestStatus.Success);
            updateUserInfo({
                sessionToken: response.sessionToken,
            });
        } else {
            setLoading(RequestStatus.Error);
        }
    };

    useEffect(() => {
        checkCode(code);
    }, [code]);

    return (
        <Modal
            isOpen={props.open}
            contentLabel={props.type}
            closeTimeoutMS={150}
            overlayClassName="modal"
            className="modalPage formModalPage"
        >
            {!waitingForEmail ? (
                <>
                    <h1>{props.type}</h1>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email"
                    />
                    <input
                        value={password}
                        type={passwordInputType}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                    />
                    {!isLogin && (
                        <input
                            value={password2}
                            type={passwordInputType}
                            onChange={(e) => setPassword2(e.target.value)}
                            placeholder="confirm password"
                        />
                    )}
                    <Button
                        active={valid()}
                        error={loading === RequestStatus.Error}
                        onClick={() => connect(isLogin ? '/login' : '/signup')}
                    >
                        go
                    </Button>
                </>
            ) : (
                <>
                    <h1>check ur email</h1>
                    <div>
                        <div className="digitInput">
                            <input
                                inputMode="decimal"
                                autoFocus
                                {...digits[0]}
                            />
                            <input inputMode="decimal" {...digits[1]} />
                            <input inputMode="decimal" {...digits[2]} />
                            <input inputMode="decimal" {...digits[3]} />
                            <input inputMode="decimal" {...digits[4]} />
                            <input inputMode="decimal" {...digits[5]} />
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            updateUserInfo({ sessionToken: 'empty' })
                        }
                    >
                        go back
                    </Button>
                </>
            )}
        </Modal>
    );
}
