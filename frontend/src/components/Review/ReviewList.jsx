import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getSpotReviews } from "../../store/review";
import { getUserReviews } from "../../store/review";
import { getSpotDetails } from "../../store/spot";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { useModal } from "../../context/Modal";
import ReviewFormModal from "../Review/ReviewForm";
import UpdateReviewFormModal from "./ReviewFormUpdate";
import DeleteReviewModal from "./ReviewDeleteModal";

import "./ReviewList.css";

const SpotReviews = () => {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const { setModalContent } = useModal();

    const allSpotReviews = useSelector(state => state.review.spotReviews);
    const allSpotReviewsArray = Object.values(allSpotReviews);
    const spotReviewsArray = allSpotReviewsArray.filter(review => review.spotId === parseInt(spotId));

    const sessionUser = useSelector(state => state.session.user); //Get the logged-in user
    const spotDetails = useSelector(state => state.spot.spotDetails[spotId]);

    const userHasPostedReview = sessionUser && spotReviewsArray.find(review => review.userId === sessionUser.id);

    console.log("All Spot Reviews:", allSpotReviews);
    console.log("Spots Review Array:", allSpotReviewsArray);

    
    useEffect(() => {
        dispatch(getSpotReviews(parseInt(spotId)))
        dispatch(getSpotDetails(spotId))
        dispatch(getUserReviews())
    }, [dispatch, spotId]);


    if (!allSpotReviews) {
        return
    }

    const sortedSpotReviewsArray = spotReviewsArray.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    console.log("sorted Spots Review Array:", sortedSpotReviewsArray)
    return (
        <div>
            <div>
                 {(spotDetails.numReviews >= 1) && (
                    <div>
                         <span className="star-and-rating"><FaStar className="star-icon"/>{(spotDetails.avgStarRating === 0)?("New"):(spotDetails.avgStarRating)}</span>
                            {spotDetails.numReviews === 1 && <span><LuDot className="dot"/>{spotDetails.numReviews} review</span>}
                            {spotDetails.numReviews > 1 && <span><LuDot className="dot"/>{spotDetails.numReviews} reviews</span>}
                    </div>
                )}
            </div>
            <div>
                {sessionUser && (sessionUser.id !== spotDetails.Owner.id) && !userHasPostedReview && (
                    <button onClick={() => setModalContent(<ReviewFormModal spotId={spotDetails.id}/>)}>Post Your Review</button>
                )}
                {sessionUser && (sessionUser.id !== spotDetails.Owner.id) && !userHasPostedReview && (spotDetails.avgStarRating === 0) && (
                        <h4>Be the first to post a review!</h4>
                )}
            </div>    
            {sortedSpotReviewsArray.map(review => (
                <div key={review.id} className="review-container">
                    <h3>{review.User.firstName}</h3>
                    <h4>{new Date(review.updatedAt).toLocaleDateString("en-US",{month: "long", year: "numeric"})}</h4>
                    <p>{review.review}</p>
                    {sessionUser && (sessionUser.id === review.userId) && (sessionUser.id !== spotDetails.Owner.id) && (
                        <>
                            <span><button onClick={() => setModalContent(<UpdateReviewFormModal reviewId={review.id} spotId={review.spotId}/>)}>Update</button></span>
                            <span><button onClick={() => setModalContent(<DeleteReviewModal reviewId={review.id} spotId={review.spotId}/>)}>Delete</button></span>
                        </>
                    )}
                </div>
            ))}
        </div>

    )
}

export default SpotReviews;
