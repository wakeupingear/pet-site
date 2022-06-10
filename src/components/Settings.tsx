import { useState, createContext, useContext } from 'react';

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
}

export default function Settings(props: Props) {
    const [settings, setSettings] = useState<Settings>({
        fps: 60,
    });

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
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
