import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserReviews } from "../../store/review";
import { useModal } from "../../context/Modal";
import DeleteReviewModal from "./ReviewDeleteModal";
import UpdateReviewFormModal from "./ReviewFormUpdate";
import "./ReviewList.css";

const UserReviews = () => {
    const dispatch = useDispatch();
    const { setModalContent } = useModal();

    const userReviews = useSelector(state => state.review.userReviews);
    const userReviewsArray = Object.values(userReviews);
    
    useEffect(() => {
        dispatch(getUserReviews())
    }, [dispatch])


    if (!userReviews) {
        return
    }

    const sortedUserReviewsArray = userReviewsArray.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    
    return (
        <div>
            {sortedUserReviewsArray.map(review => (
                <div key={review.id} className="review-container">
                    <h3>{review.Spot.name}</h3>
                    <h4>{new Date(review.updatedAt).toLocaleDateString("en-US",{month: "long", year: "numeric"})}</h4>
                    <p>{review.review}</p>
                    <span><button onClick={() => setModalContent(<UpdateReviewFormModal reviewId={review.id} spotId ={review.spotId} />)}>Update</button></span>
                    <span><button onClick={() => setModalContent(<DeleteReviewModal reviewId={review.id} />)}>Delete</button></span>
                </div>
            ))}
        </div>

    )
}

export default UserReviews;