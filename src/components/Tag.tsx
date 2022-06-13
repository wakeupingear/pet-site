import { useState } from 'react';

import Modal from 'react-modal';

export default function Tag() {
    const [open, setOpen] = useState(false);

    const openTag = () => {
        setOpen(true);
    };

    return (
        <>
            <div className="creatureTag" onMouseUp={openTag}>
                Click me
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
