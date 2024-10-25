import { csrfFetch } from "./csrf";
import { getSpotDetails } from "./spot";

const LOAD_SPOTREVIEWS = "/spots/LOAD_SPOTREVIEWS";
const CREATE_REVIEW = "/reviews/CREATE_REVIEW";
const UPDATE_REVIEW = "/reviews/UPDATE_REVIEW";
const LOAD_USER_REVIEWS = "/reviews/LOAD_USER_REVIEWS";
const DELETE_REVIEW = "/reviews/DELETE_REVIEW";


//Actions
const loadSpotReviews = (spotReviews) => {
    return {
        type: LOAD_SPOTREVIEWS,
        payload: spotReviews
    }
}

const createReview = (review) => {
    return {
        type: CREATE_REVIEW,
        payload: review
    }
};

const updateReview = (review) => {
    return {
        type: UPDATE_REVIEW,
        payload: review
    }
};

const loadUserReviews = (userReviews) => {
    return {
        type: LOAD_USER_REVIEWS,
        payload: userReviews
    }
};

const deleteReview = (reviewId) => {
    return {
        type: DELETE_REVIEW,
        payload: reviewId
    }
};


//Thunks
export const getSpotReviews = (spotId) => async (dispatch) => {
        const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
        if (response.ok) {
            const spotReviews = await response.json();
            dispatch(loadSpotReviews(spotReviews));
            dispatch(getSpotDetails(spotId));
        }

};

export const createNewReview = (spotId, reviewBody) => async(dispatch) => {
        const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
            method: "POST",
            body: JSON.stringify(reviewBody)
        });

        if (response.ok){
            const newReview = await response.json();

            //User Promise.all to fetch spot and user details concurrently
            const [spotResponse, userResponse] = await Promise.all([
                csrfFetch(`/api/spots/${spotId}`),
                csrfFetch(`/api/session/`)
            ]);


            if (spotResponse.ok && userResponse.ok){
                //Parse JSON responses
                const [spotDetails, userDetails] = await Promise.all([
                    spotResponse.json(),
                    userResponse.json()
                ]);

                //Combine review with user and spot details
                const combinedReview = {
                    ...newReview,
                    User: userDetails,
                    Spot: spotDetails
                };

                //Dispatch the action to store the combined review
                dispatch(createReview(combinedReview));
                dispatch(getSpotDetails(combinedReview.spotId));
                return combinedReview;
            }
        }
    }

export const updateExistingReview = (reviewId, reviewBody, spotId) => async(dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`,{
        method: "PUT",
        body: JSON.stringify(reviewBody)
    });

    if (response.ok) {
        const updatedReview = await response.json();
        dispatch(updateReview(updatedReview));
        dispatch(getSpotDetails(spotId));
        return updatedReview;
    }
}

export const getUserReviews = () => async (dispatch) => {
    const response = await csrfFetch("/api/reviews/current");

    if (response.ok) {
        const userReviews = await response.json();
        dispatch(loadUserReviews(userReviews));
        return userReviews;
    }
};

export const deleteExistingReview = (reviewId, spotId) => async(dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`,{
        method: "DELETE"
    });

    if (response.ok){
        const deleteConfirmation = await response.json();
        if (deleteConfirmation.message === "Successfully deleted"){
            dispatch(deleteReview(reviewId));
            dispatch(getSpotDetails(spotId))
            return deleteConfirmation;
        }
    }
};

const initialState = {
    spotReviews:{},
    userReviews:{}
};

//Reducer
const reviewReducer = (state = initialState, action) => {
    switch(action.type){
        case LOAD_SPOTREVIEWS: {
            const newState = {...state, spotReviews:{}};
            action.payload.Reviews.forEach(review => newState.spotReviews[review.id] = review);
            return newState;
        }
        case CREATE_REVIEW: {
            const newState = {...state};

            newState.spotReviews[action.payload.id] = action.payload;
            newState.userReviews[action.payload.id] = action.payload;
            return newState;
        }
        case UPDATE_REVIEW: {
            const newState = {...state};
            const updatedSpotReview = {
                ...newState.spotReviews[action.payload.id],
                id: action.payload.id,
                userId: action.payload.userId,
                review: action.payload.review,
                stars: action.payload.stars,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt
            }
            const updatedUserReview = {
                ...newState.userReviews[action.payload.id],
                id: action.payload.id,
                userId: action.payload.userId,
                review: action.payload.review,
                stars: action.payload.stars,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt
            }
            newState.spotReviews[action.payload.id] = updatedSpotReview;
            newState.userReviews[action.payload.id] = updatedUserReview;
            return newState;
        }
        case LOAD_USER_REVIEWS: {
            const newState = {...state, userReviews:{}};
            action.payload.Reviews.forEach(review => newState.userReviews[review.id] = review);
            return newState;
        }
        case DELETE_REVIEW: {
            const newState = {...state};
            delete newState.spotReviews[action.payload];
            delete newState.userReviews[action.payload];
            return newState;
        }
        default:
            return state;
    }
}

export default reviewReducer;

