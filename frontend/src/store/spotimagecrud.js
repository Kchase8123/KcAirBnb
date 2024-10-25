import { csrfFetch } from "./csrf";

const ADD_SPOTIMAGE = "/spots/ADD_SPOTIMAGE";
const DELETE_SPOTIMAGE = "/spots/DELETE_SPOT_IMAGE";


//Actions
const addSpotImage = (image) => {
    return {
        type: ADD_SPOTIMAGE,
        payload: image
    }
};

const deleteSpotImage = (imageId) => {
    return {
        type: DELETE_SPOTIMAGE,
        payload: imageId
    }
};


//Thunks
export const addNewSpotImage = (payload, spotId) => async(dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/images`, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        const newImage = await response.json();
        dispatch(addSpotImage(newImage));
    }
};

export const deleteExistingSpotImage = (imageId) => async(dispatch) => {
    const response = await csrfFetch(`/api/spot-images/${imageId}`,{
        method: "DELETE"
    });

    if (response.ok) {
        const deleteConfirmation = await response.json();
        if (deleteConfirmation.message === "Successfully deleted"){
            dispatch(deleteSpotImage(imageId));
        }
    }
}


const initialState = {};
//Reducer
const spotImageReducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_SPOTIMAGE: {
            const newState = {...state};
            newState[action.payload.id] = action.payload;
            return newState;
        }
        case DELETE_SPOTIMAGE: {
            const newState = {...state};
            delete newState[action.payload];
            return newState;
        }
        default:
            return state;
    }
}

export default spotImageReducer;
