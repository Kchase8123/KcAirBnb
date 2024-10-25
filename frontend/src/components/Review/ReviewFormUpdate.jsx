import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserReviews } from "../../store/review";
import { updateExistingReview } from "../../store/review";
import { FaStar } from "react-icons/fa";
import { useModal } from "../../context/Modal";
import "./ReviewForm.css"

const UpdateReviewFormModal = ({reviewId, spotId}) => {
    const dispatch = useDispatch();
    const {closeModal} = useModal();
    
    const reviews = useSelector(state => state.review.userReviews);
    
    const reviewDetails = reviews[reviewId];


    useEffect (() => {
        dispatch(getUserReviews())
    }, [dispatch]);
    


    const [review, setReview] = useState("");
    const [stars, setStars] = useState("")
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (reviewDetails) {
            setReview(reviewDetails.review);
            setStars(reviewDetails.stars);
        }
    },[reviewDetails]);

    useEffect(() => {
        const newErrors = {};

        if (review.length === 0) {
            newErrors.review = "Review is required";
        } else if (review.length < 10) {
            newErrors.review = "Review must be atleast 10 characters";
        }

        if (stars === "" || stars === null){
            newErrors.stars = "Rating is required";
        } else if (stars < 1 || stars > 5) {
            newErrors.stars = "Rating must be in the range of 1 to 5 stars";
        }

        setErrors(newErrors);

    }, [review, stars]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (Object.keys(errors).length === 0){
            const reviewFormValues = {
                review,
                stars
            }
        
            const updatedReview = await dispatch(updateExistingReview(reviewId, reviewFormValues, spotId));
            
            if (updatedReview){
                setMessage("Review Successfully Updated.");

                await dispatch(getUserReviews());
                
                setTimeout(() => {
                    closeModal();
                }, 3000);
            } 
            
            //Clear form inputs after successful submission
            setReview("");
            setStars("");

            }

        }

    return (
        <form
            className="review-form"
            onSubmit={handleSubmit}
        >
            <div>
                {!message? (
                    <>
                        <h1>How was your stay at</h1>
                        <h1>{reviewDetails.Spot.name}?</h1>
                        <textarea 
                            type="text"
                            name="review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Leave your review here..."
                        />
                        <div className="star-rating-container">
                            <div className="star-rating">
                                {[...Array(5)].map((_,index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <label key={ratingValue}>
                                            <input 
                                                type="radio"
                                                name="stars"
                                                value={ratingValue}
                                                onChange={(e) => setStars(parseInt(e.target.value))}
                                            />
                                            
                                            <FaStar 
                                                className={`star ${ratingValue <= stars ? "filled" : ""}`}
                                                size={40}
                                                color={ratingValue <= stars ? "#f5b301" : "#ccc"}
                                            />
                                
                                        </label>
                                    )
                                })}
                            </div>
                            <label className="stars-label">Stars</label>
                        </div>
                        <button
                            type="submit"
                            disabled={Object.keys(errors).length > 0 || review.length < 10 || stars < 1}
                            className={Object.keys(errors).length > 0 || review.length < 10 || stars < 1 ? "disabled-button" : "enabled-button"}
                        >
                            Update Your Review
                        </button>
                    </>

                ):(
                    <h1>{message}</h1>
                )}
            </div>
        </form>
    )
}

export default UpdateReviewFormModal;