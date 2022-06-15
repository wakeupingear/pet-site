import { useState, useEffect, createContext, useContext } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useSettings } from './Settings';

const __DEV__ = process.env.NODE_ENV === 'development';
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

const apiUrl = __DEV__
    ? 'http://localhost:5000'
    : 'https://pet-site-api.herokuapp.com';

interface APIResponse {
    status: number;
    [key: string]: any;
}

const processResponse = async (response: Response): Promise<APIResponse> => {
    let returnData: any = {};
    if (response.ok) {
        returnData = await response.json();
    } else {
        returnData = {
            error: response.statusText,
        };
    }
    returnData.status = response.status;
    return returnData;
};

interface Props {
    children: React.ReactNode;
}

export default function Auth(props: Props) {
    const [progress, updateProgress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); //for curtain
    const [userInfo, setUserInfo] = useState<UserInfo>({
        sessionToken: 'empty',
        name: '',
        email: '',
        version: STORAGE_VERSION,
    });

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

    const apiGet = async (path: string, options = {}) => {
        try {
            const response = await fetch(apiUrl + path, {
                ...options,
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: userInfo.sessionToken || '',
                },
            });
            return await processResponse(response);
        } catch (error) {
            return {
                error: 'Connection error',
                status: 500,
            };
        }
    };

    const apiPost = async (path: string, body = {}, options = {}) => {
        try {
            const response = await fetch(apiUrl + path, {
                ...options,
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: userInfo.sessionToken || '',
                },
            });
            return await processResponse(response);
        } catch (error) {
            return {
                error: 'Connection error',
                status: 500,
            };
        }
    };

    const getProgress = async () => {
        const response = await apiGet(PROGRESS_URL);
        if (Math.floor(response.status / 100) === 2) {
            if (response.status === 200) {
                updateProgress(response.progress);
            } else if (response.status === 201) {
                updateProgress('newUser');
            }

            if (!__DEV__) setTimeout(() => setLoading(false), 400);
            else setLoading(false);
        } else setLoading(true);
    };

    const setProgress = async (progress: string) => {
        const response = await apiPost(PROGRESS_URL, { progress });
        if (response.status === 200) {
            updateProgress(progress);
        }
    };

    useEffect(() => {
        if (userInfo.sessionToken && !progress) getProgress();
    }, [userInfo]);

    const { changedSettings, setChangedSettings, settings } = useSettings();
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
            <CSSTransition in={loading} timeout={0} classNames="curtainHolder">
                <div>
                    <div className="curtainLeft" />
                    <div className="curtainRight" />
                </div>
            </CSSTransition>
            {props.children}
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
