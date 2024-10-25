import { csrfFetch } from "./csrf";

const LOAD_SPOTS = "/spots/LOAD_SPOTS";
const CREATE_SPOT = "/spots/CREATE_SPOT";
const UPDATE_SPOT = "/spots/UPDATE_SPOT";
const DELETE_SPOT = "/spots/DELETE_SPOT";
const LOAD_SPOTDETAILS = "/spots/LOAD_SPOTDETAILS";
const LOAD_USER_SPOTS = "/spots/LOAD_USER_SPOTS";

//Actions
const load = (list) => {
    return {
        type: LOAD_SPOTS,
        payload: list
    }
};

const createSpot = (spot) => {
    return {
        type: CREATE_SPOT,
        payload: spot
    }
};


const updateSpot = (spot) => {
    return {
        type: UPDATE_SPOT,
        payload: spot
    }
};

const deleteSpot = (spotId) => {
    return {
        type: DELETE_SPOT,
        payload: spotId
    }
};

const loadSpotDetails = (spotdetails) => {
    return {
        type: LOAD_SPOTDETAILS,
        payload: spotdetails
    }
};

const loadUserSpots = (list) => {
    return {
        type: LOAD_USER_SPOTS,
        payload: list
    }
};

//Thunks
export const getAllSpots = () => async (dispatch) => {
    const response = await csrfFetch("/api/spots");

    if (response.ok) {
        const list = await response.json();
        dispatch(load(list));
    }
};

export const createNewSpotWithImages = (spotData, imagesData) => async(dispatch) => {
    const spotResponse = await csrfFetch("/api/spots", {
        method: "POST",
        body: JSON.stringify(spotData)
    });

    if (spotResponse.ok) {
        const newSpot = await spotResponse.json();

        // After the spot is created, create the images
        const imagesPromise = imagesData.map(image => {
            return csrfFetch(`/api/spots/${newSpot.id}/images`, {
                method: "POST",
                body: JSON.stringify(image)
            });
        });

        const imageResponses = await Promise.all(imagesPromise);

        const imageResults = await Promise.all(imageResponses.map(res => res.json()));

        const userDetailsResponse = await csrfFetch("/api/session");

        if (imageResults && userDetailsResponse.ok){
            const userDetails = await userDetailsResponse.json();

            const combinedSpot = {
                ...newSpot,
                SpotImages: imagesData,
                Owner: userDetails
            }
            dispatch(createSpot(combinedSpot));
            return combinedSpot;
        }
    }

};

export const updateExistingSpot = (spotId, spotData, imagesToDeleteData, imagesToAddData) => async(dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: "PUT",
        body: JSON.stringify(spotData)
    });

    if (response.ok) {
        const updatedSpot = await response.json();

        // After the spot is created, delete the images in the database
        const deleteImagesPromise = imagesToDeleteData.map(image => {
            return csrfFetch(`/api/spot-images/${image.id}/`, {
                method: "DELETE",
                body: JSON.stringify(image)
            });
        });

        await Promise.all(deleteImagesPromise);

        // After the images are delete, add new images to database
        const addImagesPromise = imagesToAddData.map(image => {
            return csrfFetch(`/api/spots/${spotId}/images`, {
                method: "POST",
                body: JSON.stringify(image)
            });
        });

        await Promise.all(addImagesPromise);

        const userDetailsResponse = await csrfFetch("/api/session");

        if (userDetailsResponse.ok){
            const userDetails = await userDetailsResponse.json();

            const combinedUpdatedSpot = {
                ...updatedSpot,
                SpotImages: imagesToAddData,
                Owner: userDetails
            }

            dispatch(updateSpot(combinedUpdatedSpot));
            return combinedUpdatedSpot;
        }
    }
};

export const deleteExistingSpot = (spotId) => async(dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`,{
        method: "DELETE"
    });

    if (response.ok){
        const deleteConfirmation = await response.json();
        if (deleteConfirmation.message === "Successfully deleted"){
            dispatch(deleteSpot(spotId));
            return deleteConfirmation;
        }
    }
};

export const getSpotDetails = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`);

    if (response.ok) {
        const spotDetails = await response.json();
        dispatch(loadSpotDetails(spotDetails));
        return spotDetails;
    }
};

export const getUserSpots = () => async (dispatch) => {
    const response = await csrfFetch("/api/spots/current");

    if (response.ok) {
        console.log("Thunk is working....")
        const userList = await response.json();
        dispatch(loadUserSpots(userList));
    }
};


const initialState = {
    allSpots:{},
    spotDetails:{},
    userSpots:{}
};
//Reducer
const spotReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOAD_SPOTS: {
            const newState = {...state, allSpots: {}};
            action.payload.Spots.forEach(spot => newState.allSpots[spot.id] = spot);
            return newState;
        }
        case CREATE_SPOT: {
            const newState = {...state};
            newState.allSpots[action.payload.id] = action.payload;
            newState.spotDetails[action.payload.id] = action.payload;
            return newState;
        }
        case UPDATE_SPOT: {
            const newState = {...state};
            const updatedSpot = {
                ...newState.allSpots[action.payload.id],
                id: action.payload.id,
                ownerId: action.payload.ownerId,
                address: action.payload.address,
                city: action.payload.city,
                country: action.payload.country,
                lat: action.payload.lat,
                lng: action.payload.lng,
                name: action.payload.name,
                description: action.payload.description,
                price: action.payload.price,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt,
                numReviews: action.payload.numReviews,
                avgStarRating: action.payload.avgStarRating,
                SpotImages: action.payload.SpotImages
            };
            const updatedSpotDetails = {
                ...newState.spotDetails[action.payload.id],
                id: action.payload.id,
                ownerId: action.payload.ownerId,
                address: action.payload.address,
                city: action.payload.city,
                country: action.payload.country,
                lat: action.payload.lat,
                lng: action.payload.lng,
                name: action.payload.name,
                description: action.payload.description,
                price: action.payload.price,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt,
                numReviews: action.payload.numReviews,
                avgStarRating: action.payload.avgStarRating,
                SpotImages: action.payload.SpotImages
            }
            newState.allSpots[action.payload.id] = updatedSpot;
            newState.spotDetails[action.payload.id] = updatedSpotDetails;
            return newState;
        }
        case DELETE_SPOT: {
            const newState = {...state};
            delete newState.allSpots[action.payload];
            delete newState.spotDetails[action.payload];
            delete newState.userSpots[action.payload];
            return newState;
        }
        case LOAD_SPOTDETAILS: {
            const newState = {...state};
            newState.spotDetails[action.payload.id] = action.payload;
            return newState;
        }
        case LOAD_USER_SPOTS: {
            const newState = {...state, userSpots:{}};
            action.payload.Spots.forEach(spot => newState.userSpots[spot.id] = spot);
            return newState;
        }
        default:
            return state;
    }
}

export default spotReducer;
