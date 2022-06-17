import { useState, useEffect, createContext, useContext } from 'react';
import { CSSTransition } from 'react-transition-group';

import LoginPopup from '../components/LoginPopup';
import { useSettings } from './Settings';
import LoadingScreen from './LoadingScreen';
import {
    internal_apiGet,
    internal_apiPost,
    APIResponse,
    __DEV__,
} from '../utils/api';

const PROGRESS_URL = `/progress?host=site&pathname=${window.location.pathname}`;
const STORAGE_VERSION = 1;

//Context
export const AuthContext = createContext({} as AuthContextProps);

export type UserInfo = {
    sessionToken: string;
    name: string;
    email: string;
    version: number;
};

interface AuthContextProps {
    apiGet: (url: string) => Promise<APIResponse>;
    apiPost: (url: string, data: any) => Promise<APIResponse>;
    getProgress: () => void;
    userInfo: UserInfo;
    progress: string | null;
    setProgress: (progress: string) => void;
    updateUserInfo: (userInfo: Partial<UserInfo>) => void;
}

interface Props {
    children: React.ReactNode;
}

export default function Auth(props: Props) {
    const [settingsFetched, setSettingsFetched] = useState(false);
    const { changedSettings, setChangedSettings, updateSettings, settings } =
        useSettings();

    const [progress, updateProgress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [serverRetry, setServerRetry] = useState<NodeJS.Timer | null>(null);
    const [errorCode, setErrorCode] = useState(0);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        sessionToken: '',
        name: '',
        email: '',
        version: STORAGE_VERSION,
    });

    const isActiveSession = () =>
        Boolean(
            userInfo.sessionToken &&
                userInfo.sessionToken !== 'empty' &&
                userInfo.sessionToken !== 'waiting'
        );

    useEffect(() => {
        const userInfoRaw = localStorage.getItem('userInfo');
        const userInfoParsed = JSON.parse(userInfoRaw || '{}');
        if (!userInfoRaw || userInfoParsed.version !== STORAGE_VERSION) {
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            return;
        }
        if (userInfoParsed.version === STORAGE_VERSION)
            setUserInfo(userInfoParsed);
    }, []);

    const apiGet = async (path: string, options = {}) => {
        const response = await internal_apiGet(
            path,
            userInfo.sessionToken,
            options
        );
        return response;
    };

    const apiPost = async (path: string, data: any, options = {}) => {
        const response = await internal_apiPost(
            path,
            data,
            userInfo.sessionToken,
            options
        );
        return response;
    };

    const updateUserInfo = (userInfo: Partial<UserInfo>) => {
        setUserInfo((info) => {
            const newInfo = {
                ...info,
                ...userInfo,
            };
            localStorage.setItem('userInfo', JSON.stringify(newInfo));
            return newInfo;
        });
    };

    const getProgress = async () => {
        const response = await apiGet(
            PROGRESS_URL + '&needSettings=' + (!settingsFetched).toString()
        );
        if (Math.floor(response.status / 100) === 2) {
            if (response.status === 200) {
                if ('settings' in response && response.settings) {
                    updateSettings(response.settings);
                    setSettingsFetched(true);
                }
                updateProgress(response.progress);
            } else if (response.status === 201) {
                if (!userInfo.sessionToken) {
                    updateProgress('newUser');
                } else if (isActiveSession()) {
                    updateUserInfo({ sessionToken: 'empty' });
                }
            }

            if (!__DEV__) setTimeout(() => setLoading(false), 400);
            else setLoading(false);

            if (serverRetry) {
                clearTimeout(serverRetry);
                setServerRetry(null);
            }
        } else {
            setLoading(true);
            setServerRetry(setTimeout(getProgress, 2000));
            setErrorCode(response.status);
        }
    };

    const setProgress = async (progress: string) => {
        const response = await apiPost(PROGRESS_URL, { progress });
        if (response.status === 200) {
            updateProgress(progress);
        }
    };

    useEffect(() => {
        if (
            (isActiveSession() || (loading && userInfo.sessionToken)) &&
            !progress
        )
            getProgress();
    }, [userInfo]);

    useEffect(() => {
        if (changedSettings) {
            apiPost('/settings', { settings });
            setChangedSettings(false);
        }
    }, [changedSettings]);

    return (
        <AuthContext.Provider
            value={{
                apiGet,
                apiPost,
                getProgress,
                progress,
                setProgress,
                userInfo,
                updateUserInfo,
            }}
        >
            <CSSTransition
                in={loading}
                timeout={1000}
                classNames="curtainHolder"
            >
                <LoadingScreen code={errorCode} />
            </CSSTransition>
            {!loading && (
                <>
                    {(userInfo.sessionToken === 'empty' ||
                        userInfo.sessionToken === 'waiting') && (
                        <LoginPopup open={true} type={'join'} />
                    )}
                    {props.children}
                </>
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};
