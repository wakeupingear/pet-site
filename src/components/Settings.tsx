import { userInfo } from 'os';
import { useState, createContext, useContext, useEffect } from 'react';
import Modal from 'react-modal';
import ReactSlider from 'react-slider';
import Button from './Button';

import { internal_apiGet, __DEV__ } from '../utils/api';

export const SettingsContext = createContext({} as SettingsContextProps);

interface SettingsContextProps {
    changedSettings: boolean;
    setChangedSettings: React.Dispatch<React.SetStateAction<boolean>>;
    settings: Settings;
    updateSettings: (change: Partial<Settings>) => void;
}

interface Props {
    children: React.ReactNode;
}

interface Settings {
    fps: number;
    volume: number;
}

Modal.setAppElement('#root');

export default function Settings(props: Props) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        fps: 60,
        volume: 100,
    });
    const [changed, setChanged] = useState(false);
    const [changedSettings, setChangedSettings] = useState(false);

    const updateSettings = (change: Partial<Settings>) => {
        setSettings((current) => {
            return {
                ...current,
                ...change,
            };
        });
    };

    const openModal = () => setOpen(true);
    const closeModal = () => {
        setOpen(false);
        if (changed) {
            setChangedSettings(true);
            setChanged(false);
        }
    };

    useEffect(() => {
        if (open) setChanged(true);
    }, [settings]);

    const resetServer = async () => {
        const response = await internal_apiGet(
            '/admin/reset',
            'foojardigibutterjoe'
        );
        console.log(response);
        if (response.status === 200) {
            window.location.reload();
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                changedSettings,
                setChangedSettings,
                settings,
                updateSettings,
            }}
        >
            <div
                className={'settingsButton ' + (open && 'settingsHidden')}
                onClick={openModal}
            >
                <div />
            </div>
            <Modal
                isOpen={open}
                onRequestClose={closeModal}
                contentLabel="Setttings"
                closeTimeoutMS={120}
                shouldCloseOnOverlayClick
                shouldCloseOnEsc
                overlayClassName="modal settingsModal"
                className="modalPage settingsModalPage"
            >
                <h1>settings</h1>
                <div className="settingsContent">
                    <div>
                        <h2>vol</h2>
                        <div className="settingsSlider">
                            <ReactSlider
                                defaultValue={settings.volume}
                                className="horizontal-slider"
                                thumbClassName="example-thumb"
                                trackClassName="example-track"
                                onAfterChange={(volume) =>
                                    updateSettings({ volume })
                                }
                                renderTrack={(props, state) => (
                                    <div {...props} />
                                )}
                            />
                        </div>
                    </div>
                    {__DEV__ && (
                        <Button onClick={resetServer}>Reset Server</Button>
                    )}
                </div>
                <a href="willfarhat.com" target="_blank">
                    will farhat
                </a>
            </Modal>
            {props.children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error(
            'useSettings must be used within a SettingsContextProvider'
        );
    }
    return context;
};
