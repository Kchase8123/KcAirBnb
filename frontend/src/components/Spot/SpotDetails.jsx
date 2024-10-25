import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getSpotDetails } from "../../store/spot";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import SpotReviews from "../Review/ReviewList";
import "./SpotDetail.css";
import { getSpotReviews } from "../../store/review";
import { restoreUser } from "../../store/session";
import { useModal } from "../../context/Modal";
import BookingModal from "../Booking/BookingModal";

const SpotDetails = () => {

    const dispatch = useDispatch();
    const { spotId } = useParams();
    const { setModalContent } = useModal()
    
    const spotDetails = useSelector(state => state.spot.spotDetails[spotId]);
    const spotReviews = useSelector(state => state.review.spotReviews);

    
    useEffect (() => {
        dispatch(getSpotDetails(spotId));
        dispatch(getSpotReviews(spotId));
        dispatch(restoreUser());
    }, [dispatch, spotId]);


    if (!spotDetails || !spotReviews){
        return;
    }
    
    const mainImage = spotDetails.SpotImages.find(image => image.preview);
    
    const otherImages = spotDetails.SpotImages.filter(image => !image.preview).slice(0,4);
    

    return (
        <div className="spotDetails-page-layout">
            <div className="spotDetails-container">
                <h1>{spotDetails.name}</h1>
                <h4>{spotDetails.city}, {spotDetails.state}, {spotDetails.country}</h4>
                <div className="spotDetails-content">
                    <div className="spotDetails-main-image-container">
                        <img
                            src={mainImage ? mainImage.url : ""}
                            alt="Main Spot"
                            className="spotDetails-main-image"
                        />
                    </div>
                    <div className="spotDetails-images-grid">
                        {otherImages.map((image, index) => (
                            <div className="grid-item" key={image.id || index}>
                                <img src={image.url} alt={`Spot Image ${image.id}`}/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="spotDetails-text-price-wrapper">

                    <div className="spotDetails-text-content">
                        <h3>Hosted By {spotDetails.Owner.firstName} {spotDetails.Owner.lastName}</h3>
                        <p>{spotDetails.description}</p>
                    </div>
                    <div className="price-container">
                        <div className="price-rating-group">
                            <span className="price">${spotDetails.price}/night</span>
                            <div className="rating-review-group">
                                <span className="star-and-rating"><FaStar className="star-icon"/>{(spotDetails.avgStarRating === 0)?("New"):(spotDetails.avgStarRating)}</span>
                                {spotDetails.numReviews === 1 && <span><LuDot className="dot"/>{spotDetails.numReviews} review</span>}
                                {spotDetails.numReviews > 1 && <span><LuDot className="dot"/>{spotDetails.numReviews} reviews</span>}
                            </div>
                        </div>
                        <button className="reserve-button" onClick={() => setModalContent(<BookingModal spotId={spotId}/>)}>Reserve</button>
                    </div>
                </div>
            </div>
            <div className="divider"></div>
            <div className="spotReviews-container">
                <SpotReviews />
            </div>
        </div>
    )
    
}

export default SpotDetails;
