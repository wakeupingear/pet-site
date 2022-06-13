import { useState, createContext, useContext, useEffect } from 'react';
import Modal from 'react-modal';
import Switch from 'react-switch';
import ReactSlider from 'react-slider';

export const SettingsContext = createContext({} as SettingsContextProps);

interface SettingsContextProps {
    changedSettings: boolean;
    setChangedSettings: React.Dispatch<React.SetStateAction<boolean>>;
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
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

    return (
        <SettingsContext.Provider
            value={{
                changedSettings,
                setChangedSettings,
                settings,
                setSettings,
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
                            renderTrack={(props, state) => <div {...props} />} //custom track
                        />
                    </div>
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
