import { useRef, useState, useContext, createContext } from "react";
import ReactDOM from "react-dom";
import "./Modal.css"

const ModalContext = createContext();

export function ModalProvider({ children }){
    const modalRef = useRef();
    const [modalContent, setModalContent] = useState(null);
    const [onModalClose, setOnModalClose] = useState(null);

    const closeModal = () => {
        setModalContent(null); //Clear the modal contents

        //If callback function is truthy, call the callback function and reset it to null
        if (typeof onModalClose === "function") {
            setOnModalClose(null);
            onModalClose();
        }
    };


    const contextValue = {
        modalRef, //Reference to modal div
        modalContent, //React component to render inside modal
        setModalContent, //Function to set the React component to render inside modal
        setOnModalClose, //Function to set the callback function to be called when modal is closing
        closeModal //Function to close the modal
    };

    return (
        <>
            <ModalContext.Provider value={contextValue}>
                {children}
            </ModalContext.Provider>
            <div ref={modalRef}/>
        </>
    );
}

export function Modal() {
    const { modalRef, modalContent, closeModal } = useContext(ModalContext);

    //If there is no div referenced by the modalRef or modalContent is not a thruthy value, render nothing:
    if (!modalRef || !modalRef.current || !modalContent) return null;

    //Render the following component to the div referenced by the modalRef
    return ReactDOM.createPortal(
        <div id="modal">
            <div id="modal-background" onClick={closeModal} />
            <div id="modal-content">{modalContent}</div>
        </div>,
        modalRef.current
    );
}

export const useModal = () => useContext(ModalContext);
