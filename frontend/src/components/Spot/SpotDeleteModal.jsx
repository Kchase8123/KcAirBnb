import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteExistingSpot } from "../../store/spot";
import { useModal } from "../../context/Modal";
import "./SpotDeleteModal.css"

const DeleteSpotModal = ({spotId}) => {
    const dispatch = useDispatch();
    const {closeModal} = useModal();
    const [message, setMessage] = useState("");


    const handleDelete = async () => {
        const result = await dispatch(deleteExistingSpot(spotId));

        if (result){
            setMessage("Spot Successfully Deleted.");

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
                    <p>Are you sure you want to remove this spot from the listings?</p>
                    <div className="button-container">
                        <button className="modal-yes-button" onClick={handleDelete}>Yes (Delete Spot)</button>
                        <button className="modal-no-button" onClick={closeModal}>No (Keep Spot)</button>
                    </div>
                </>
            ):(
                <h2>{message}</h2>
            )}
        </div>
    );
}

export default DeleteSpotModal;