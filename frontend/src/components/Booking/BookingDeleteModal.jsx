import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteExisingBooking } from "../../store/bookings";
import { useModal } from "../../context/Modal";
import "../Spot/SpotDeleteModal.css"

const DeleteBookingModal = ({bookingId}) => {
    const dispatch = useDispatch();
    const {closeModal} = useModal();
    const [message, setMessage] = useState("");


    const handleDelete = async () => {
        const result = await dispatch(deleteExisingBooking(bookingId));

        if (result){
            setMessage("Booking Successfully Deleted.");

            setTimeout(() => {
                closeModal();
            }, 2000);
        }
    };


    return (
        <div>
            {!message? (
                <>
                    <h2>Confirm Delete</h2>
                    <p>Are you sure you want to delete this booking?</p>
                    <div className="button-container">
                        <button className="modal-yes-button" onClick={handleDelete}>Yes (Delete Booking)</button>
                        <button className="modal-no-button" onClick={closeModal}>No (Keep Booking)</button>
                    </div>
                </>
            ):(
                <h2>{message}</h2>
            )}
        </div>
    );
}

export default DeleteBookingModal;
