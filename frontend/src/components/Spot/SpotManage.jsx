import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserSpots } from "../../store/spot";
import { FaStar } from "react-icons/fa";
import { useNavigate, NavLink } from "react-router-dom";
import { useModal } from "../../context/Modal";

import DeleteSpotModal from "./SpotDeleteModal";
import "./SpotManage.css";

const SpotManage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setModalContent } = useModal();


    const spots = useSelector(state => state.spot.userSpots);
    const spotList = Object.values(spots);

    useEffect(() => {
        dispatch(getUserSpots());
    }, [dispatch]);

    if (!spots) {
        return <p>Loading...</p>
    }


    return (
        <div className="spot-manage">
            <h1>Manage Your Spots</h1>
            <button className="create-spot-button" onClick={() => navigate("/spots/new")}>Create a New Spot</button>
            <div className="spot-grid">
                {spotList.map(spot =>  (
                        <div key={spot.id} className="spot-item-container">
                            <NavLink to={`/spots/${spot.id}`}>
                                <div className="spot-item">
                                    <div className="spot-tooltip">{spot.name}</div>
                                    <img src={spot.previewImage} alt={spot.city} className="spot-image"/>
                                    <div className="spot-info">
                                        <div className="spot-location">
                                            <span> {spot.city}, {spot.state}</span>
                                            <span className="spot-rating"><FaStar className="star-icon"/>{(spot.avgRating === 0)?("New"):(spot.avgRating)}</span>
                                        </div>
                                        <span className="spot-price">${spot.price}</span><span>/night</span>
                                    </div>
                                </div>
                            </NavLink>
                            <div className="spot-actions">
                                <span><button onClick={() => navigate(`/spots/${spot.id}/edit`)}>Update</button></span>
                                <span><button onClick={() => setModalContent(<DeleteSpotModal spotId={spot.id} />)}>Delete</button></span>
                            </div>
                        </div>

                ))}
            </div>
        </div>
    )

}

export default SpotManage;