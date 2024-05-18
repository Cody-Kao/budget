import React, { useEffect } from 'react';
import './index.css'; // Import CSS for styling

type FlashMsgProps = {
    show: boolean;
    handleClose:() => void
    type: string;
    message: string;
};

export default function FlashMsg({ show, handleClose, type, message }: FlashMsgProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                handleClose()
            }, 5000); // Hide the flash message after 5 seconds

            return () => clearTimeout(timer); // Cleanup function to clear the timer
        }
    }, [show]);

    return (
        <>
            {show && (
                <div className={`flash-message ${type}`}>
                    <span className="icon">{type === 'success' ? '✅' : '❌'}</span>
                    <span className="text">{message}</span>
                </div>
            )}
        </>
    );
}
