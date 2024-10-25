import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSpots } from "../../store/spot";
import { FaStar } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./SpotList.css";

const SpotList = () => {
    const dispatch = useDispatch();

    const spots = useSelector(state => state.spot.allSpots);
    const spotList = Object.values(spots);

    useEffect(() => {
        dispatch(getAllSpots());
    }, [dispatch]);

    if (!spots) {
        return <p>Loading...</p>
    }


    return (
        <div className="spot-list">
            <div className="spot-grid">
                {spotList.map(spot =>  (
                    <NavLink key={spot.id+spot.name} to={`/spots/${spot.id}`} >
                        <div key={spot.id} className="spot-item">
                            <div className="spot-tooltip">{spot.name}</div>
                            <img src={spot.previewImage} alt={spot.city} className="spot-image"/>
                            <div className="spot-info">
                                <div className="spot-location">
                                    <span> {spot.city}, {spot.state}</span>
                                    <span className="star-and-rating"><FaStar className="star-icon"/>{(spot.avgRating === 0)?("New"):(spot.avgRating)}</span>
                                </div>
                                <span className="spot-price">${spot.price}</span><span>/night</span>
                            </div>
                        </div>
                    </NavLink>
                ))}
            </div>
        </div>
    )

}

export default SpotList;
