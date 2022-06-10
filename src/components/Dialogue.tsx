import { useState, useEffect, useRef } from 'react';

const KEY_NAMES: { [key: string]: string } = {
    '13': 'enter',
    '27': 'escape',
    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down',
};

export type TextData = (string | number | Function)[] | string;

export type DialogueObject = DialogueProps & {
    key: string;
};

export type DialogueOptions = Omit<DialogueObject, 'text' | 'key'>;

export type DialogueProps = {
    commandDelimiter?: string;
    commandHandler?: (command: string, val: string, ind: number) => number;
    confirmKeys?: { [key: string]: string };
    cursor?: string;
    delayMap?: { [key: string]: number };
    globalInput?: boolean;
    height?: number | string;
    onComplete?: () => void;
    text: TextData;
    typeSpeed?: number;
    width?: number | string;
};

export const DialoguePropsDefault = {
    commandDelimiter: '$',
    confirmKeys: {
        enter: '', // Enter
    },
    globalInput: true,
    typeSpeed: 50,
};

export const DialogueState = {
    Printing: 0,
    Waiting: 1,
    Done: 2,
    Finished: 3,
};

export type DomInteractions = {
    [key: string]: Function;
};

export default function Dialogue(props: DialogueProps) {
    const [text, setText] = useState(props.text);
    const [index, setIndex] = useState(0);
    const indexRef = useRef(index);
    useEffect(() => {
        indexRef.current = index;
    }, [index]);
    const [currentLine, setCurrentLine] = useState('');
    const [lineIndex, setLineIndex] = useState(0);
    const [state, setState] = useState(DialogueState.Printing);
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);
    const [printTimeout, setPrintTimeout] = useState<any>(null);
    const [active, setActive] = useState(false);
    const activeRef = useRef(active);
    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    const primaryDomInteractions: DomInteractions = {
        alert: (val: string) => alert(val),
        log: (val: string) => console.log(val),
        closeWindow: () => window.close(),
    };

    const addCharacter = (ind: number) => {
        const val = text[ind];
        setLineIndex((lineInd) => {
            if (!props.typeSpeed) return lineInd;
            if (typeof val !== 'string') return lineInd;
            if (lineInd + 1 >= val.length) {
                finishPrinting(ind);
                return lineInd;
            }

            const letter = val.substring(lineInd, lineInd + 1);
            let delay = props.typeSpeed;
            if (
                props.delayMap &&
                props.delayMap[letter] &&
                ind < val.length - 1
            )
                delay += props.delayMap[letter];
            setCurrentLine((line: string) => line + letter);
            setPrintTimeout(setTimeout(() => addCharacter(ind), delay));
            return lineInd + 1;
        });
    };

    const startDialogueLine = (ind: number) => {
        while (ind < text.length) {
            const val = text[ind];
            if (typeof val === 'function') {
                val();
            } else if (typeof val === 'number') {
                setActive(false);
                setTimeout(() => {
                    startDialogueLine(ind + 1);
                }, val);
                return;
            } else if (
                !props.commandDelimiter ||
                val.charAt(0) === props.commandDelimiter
            ) {
                let spaceInd = val.indexOf(' ');
                if (spaceInd === -1) spaceInd = val.length;
                const parts = [
                    val.slice(props.commandDelimiter?.length || 0, spaceInd),
                    val.slice(spaceInd + 1),
                ];
                const command = parts[0];

                if (primaryDomInteractions[command]) {
                    primaryDomInteractions[command](parts[1]);
                    ind++;
                } else if (props.commandHandler) {
                    const result = props.commandHandler(command, parts[1], ind);
                    if (result === ind) break;
                    ind = result;
                }
            } else break;
        }
        setActive(true);

        if (ind >= text.length) {
            if (state !== DialogueState.Finished) {
                setState(DialogueState.Finished);
                if (props.onComplete) props.onComplete();
                else setCurrentLine('Done!');
            }
            return;
        }

        if (props.typeSpeed === 0) {
            finishPrinting(ind);
            return;
        }

        setIndex(ind);
        setLineIndex(0);
        setCurrentLine('');
        setState(DialogueState.Printing);

        addCharacter(ind);
    };

    const finishPrinting = (ind: number) => {
        const val = text[ind];
        if (typeof val !== 'string') return;
        setCurrentLine(val);
        setLineIndex(val.length);
        setState(DialogueState.Done);
        setPrintTimeout((timeout: any) => {
            clearTimeout(timeout);
            return null;
        });
    };

    const receivedInput = (choice: string = '') => {
        if (!activeRef.current) return;
        if (stateRef.current === DialogueState.Printing)
            finishPrinting(indexRef.current + 1);
        else if (stateRef.current === DialogueState.Done) {
            setIndex((index) => index + 1);
            startDialogueLine(indexRef.current + 1);
        }
    };

    useEffect(() => {
        startDialogueLine(0);
    }, [text]);

    const wrapperRef = useRef<any>(null);
    const handleClickOutside = (event: any) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            receivedInput();
        }
    };
    useEffect(() => {
        if (!props.globalInput) return;
        document.addEventListener('mousedown', (event: any) =>
            handleClickOutside(event)
        );
        return () => {
            document.removeEventListener('mousedown', (event: any) =>
                handleClickOutside(event)
            );
        };
    }, [wrapperRef]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!props.confirmKeys) return;
        const code: number = event.which || event.keyCode;
        if (!code) return;
        if (props.confirmKeys[code]) {
            receivedInput(props.confirmKeys[code]);
            return;
        }

        const name =
            KEY_NAMES[code.toString()] ||
            String.fromCharCode(code).toLowerCase();
        if (!name) return;
        if (name in props.confirmKeys) {
            receivedInput(props.confirmKeys[name]);
        }
    };

    useEffect(() => {
        if (!props.confirmKeys) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    });

    return (
        <div
            style={{
                width: props.width || 'fit-content',
                height: props.height || 'fit-content',
            }}
            className={
                'dialogue-outer-container ' + (!active && 'dialogue-inactive')
            }
            ref={wrapperRef}
            onClick={() => receivedInput()}
        >
            <div className="dialogue-inner-container">
                <div className="dialogue-text">
                    {currentLine}
                    {state === DialogueState.Printing &&
                        props.cursor !== undefined &&
                        props.cursor}
                </div>
            </div>
        </div>
    );
}

Dialogue.defaultProps = DialoguePropsDefault;
