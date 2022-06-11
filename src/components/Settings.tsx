import { useState, createContext, useContext } from 'react';
import Modal from 'react-modal';
import Switch from "react-switch";
import ReactSlider from 'react-slider'

export const SettingsContext = createContext({} as SettingsContextProps);

interface SettingsContextProps {
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
    const [open, setOpen] = useState(true);
    const [settings, setSettings] = useState<Settings>({
        fps: 60,
        volume: 100
    });
    const [changed, setChanged] = useState(false);

    const updateSettings = (change: Partial<Settings>) => {
        setSettings(current => {
            return {
                ...current,
                ...change
            };
        });
    }

    const uploadSetttings = async () => {

    }

    const openModal = () => setOpen(true);
    const closeModal = () => {
        setOpen(false);
        if (changed) {
            uploadSetttings();
            setChanged(false);
        }
    }

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            <button className='settingsButton' onClick={openModal}>settings</button>
            <Modal
                isOpen={open}
                onRequestClose={closeModal}
                contentLabel="Setttings"
                closeTimeoutMS={120}
                shouldCloseOnOverlayClick
                shouldCloseOnEsc
                overlayClassName="settingsModal"
                className="settingsModalPage"
            >
                <h1>settings</h1>
                <div className='settingsContent'>
                    <h2>vol</h2>
                    <div className='settingsSlider'>
                        <ReactSlider
                            className="horizontal-slider"
                            thumbClassName="example-thumb"
                            trackClassName="example-track"
                            onAfterChange={(volume) => updateSettings({volume})}
                            renderTrack={(props, state) => <div {...props} />}//custom track
                        />
                    </div>
                </div>
                <a href='willfarhat.com' target="_blank">will farhat</a>
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
