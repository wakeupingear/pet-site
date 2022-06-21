import { useEffect, useState } from 'react';

import Modal from 'react-modal';
import { useAuth } from './Auth';

export default function Tag() {
    const { setPopupEnabled } = useAuth();
    const [open, setOpen] = useState(false);

    const openTag = () => {
        setOpen(true);
    };

    useEffect(() => {
        setPopupEnabled(open);
    }, [open]);

    return (
        <>
            <div className="creatureTag" onMouseUp={openTag}>
                <div />
            </div>
            <Modal
                isOpen={open}
                onRequestClose={() => setOpen(false)}
                contentLabel="Setttings"
                closeTimeoutMS={120}
                shouldCloseOnOverlayClick
                shouldCloseOnEsc
                overlayClassName="modal"
                className="modalPage"
            >
                <h1>Joe</h1>
                <h3>Will Farhat</h3>
            </Modal>
        </>
    );
}
