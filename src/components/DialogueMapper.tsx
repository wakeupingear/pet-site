import { useState, useEffect, createContext, useContext } from 'react';

import { useAuth } from './Auth';

import Dialogue, {
    DialogueObject,
    DialogueOptions,
    DomInteractions,
    TextData,
} from './Dialogue';
import scriptDataImport from '../data/script.json';
import { DialoguePresets } from '../utils/types';
const SCRIPT: {
    [key: string]:
        | {
              text: TextData;
              preset?: string;
          }
        | TextData;
} = scriptDataImport;

export const DialogueMapperContext = createContext(
    {} as DialogueMapperContextProps
);

interface DialogueMapperContextProps {
    addDialogue: (key: string) => void;
    dialogue: DialogueMap;
    removeDialogue: (key: string) => void;
    setDomInteractions: React.Dispatch<
        React.SetStateAction<{
            [key: string]: Function;
        }>
    >;
}

interface DialogueMap {
    [key: string]: DialogueObject;
}

interface Props {
    children: React.ReactNode;
}

export default function DialogueMapper(props: Props) {
    const { progress } = useAuth();
    const [dialogue, setDialogue] = useState<DialogueMap>({});
    const [domInteractions, setDomInteractions] = useState<DomInteractions>({});

    const commandHandler = (
        command: string,
        val: string,
        ind: number
    ): number => {
        if (command in domInteractions) {
            domInteractions[command](val);
            return ind + 1;
        }
        return ind;
    };

    const addDialogue = async (
        key: string,
        options?: DialogueOptions,
        preset?: string
    ) => {
        let text: TextData = [];
        const data = SCRIPT[key];
        if (data) {
            if (typeof data === 'string') {
                text = data;
            } else if (typeof data === 'object' && 'text' in data) {
                if (data.preset) {
                    preset = data.preset;
                }
                text = data.text;
            } else text = data;
        }

        const newEntry = {
            key: key,
            text: text,
            onComplete: () => removeDialogue(key),
            ...DialoguePresets[preset || ''],
            ...options,
        };
        setDialogue((oldMap) => ({
            ...oldMap,
            [key]: newEntry,
        }));
    };

    const removeDialogue = (key: string) => {
        setDialogue((oldMap) => {
            const state = { ...oldMap };
            delete state[key];
            return state;
        });
    };

    useEffect(() => {
        if (!progress) return;
        addDialogue(progress);
    }, [progress]);

    return (
        <DialogueMapperContext.Provider
            value={{
                addDialogue,
                dialogue,
                removeDialogue,
                setDomInteractions,
            }}
        >
            {props.children}
            {Object.keys(dialogue).map((key) => {
                const box = dialogue[key];
                return <Dialogue {...box} commandHandler={commandHandler} />;
            })}
        </DialogueMapperContext.Provider>
    );
}

export const useDialogueMapper = () => {
    const context = useContext(DialogueMapperContext);
    if (context === undefined) {
        throw new Error(
            'useDialogueMapper must be used within a DialogueMapperProvider'
        );
    }
    return context;
};
