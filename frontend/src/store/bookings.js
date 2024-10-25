import { csrfFetch } from "./csrf";

const LOAD_SPOTBOOKINGS = "/bookings/LOAD_SPOTBOOKINGS";
const LOAD_USERBOOKINGS = "/bookings/LOAD_USERBOOKINGS";
const LOAD_ALLBOOKINGS = "/bookings/LOAD_ALLBOOKINGS";
const CREATE_SPOTBOOKING = "/bookings/CREATE_SPOTBOOKING";
const DELETE_BOOKING = "/bookings/DELETE_BOOKING";
const UPDATE_BOOKING = "/bookings/UPDATE_BOOKING";


//Actions
const loadSpotBookings = (spotBookings) => {
    return {
        type: LOAD_SPOTBOOKINGS,
        payload: spotBookings
    }
}

const loadUserBookings = (userBookings) => {
    return {
        type: LOAD_USERBOOKINGS,
        payload: userBookings
    }
}

const loadAllBookings = (bookings) => {
    return {
        type: LOAD_ALLBOOKINGS,
        payload: bookings
    }
}


const addSpotBooking = (spotBooking) => {
    return {
        type: CREATE_SPOTBOOKING,
        payload: spotBooking
    }
}

const deleteBooking = (bookingId) => {
    return {
        type: DELETE_BOOKING,
        payload: bookingId
    }
}

const updateBooking = (booking) => {
    return {
        type: UPDATE_BOOKING,
        payload: booking
    }
}




//Thunks
export const getSpotBookings = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/bookings`);

    if (response.ok) {
        const spotBookings = await response.json();
        dispatch(loadSpotBookings(spotBookings));
        return spotBookings;
    }
}

export const getUserBookings = () => async (dispatch) => {
    const response = await csrfFetch("/api/bookings/current");

    if (response.ok) {
        const userBookings = await response.json()
        dispatch(loadUserBookings(userBookings));
        return userBookings;
    }
}

export const getAllBookings = () => async (dispatch) => {
    const response = await csrfFetch("/api/bookings/");

    if (response.ok) {
        const allBookings = await response.json()
        dispatch(loadAllBookings(allBookings));
        return allBookings;
    }
}

export const createSpotBooking = (spotId, bookingBody) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/bookings`,{
        method: "POST",
        body: JSON.stringify(bookingBody)
    });

    if (response.ok) {
        const newBooking = await response.json();

        //User Promise.all to fetch spot and user details concurrently
        const [spotResponse, userResponse] = await Promise.all([
            csrfFetch(`/api/spots`),
            csrfFetch(`/api/session/`)
        ]);

        if (spotResponse.ok && userResponse.ok){
            //Parse JSON responses
            const [spotDetails, userDetails] = await Promise.all([
                spotResponse.json(),
                userResponse.json()
            ]);

            const spotDetailsFilter = spotDetails.Spots[spotId];
            const userDetailsFilter = userDetails.user;

            //Combine review with user and spot details
            const combinedBooking = {
                ...newBooking,
                User: userDetailsFilter,
                Spot: spotDetailsFilter
            };


        //Dispatch the action to store the combined booking
        dispatch(addSpotBooking(combinedBooking));
        dispatch(getUserBookings());
        return combinedBooking;
        }
    }
}

export const deleteExisingBooking = (bookingId) => async (dispatch) => {
    const response = await csrfFetch(`/api/bookings/${bookingId}`, {
        method: "DELETE"
    });

    if (response.ok){
        const deleteConfirmation = await response.json();
        if (deleteConfirmation.message === "Successfully deleted"){
            dispatch(deleteBooking(bookingId));
            return deleteConfirmation;
        }
    }
}

export const updateExistingBooking = (bookingId, dates) => async(dispatch) => {
    const response = await csrfFetch(`/api/bookings/${bookingId}`,{
        method: "PUT",
        body: JSON.stringify(dates)
    });

    if (response.ok) {
        const updatedBooking = await response.json();
        dispatch(updateBooking(updatedBooking));
        dispatch(getUserBookings());
        return updatedBooking;
    }
}


//Reducer
const initialState = {
    spotBookings:{},
    userBookings:{}
};

const bookingReducer = (state = initialState, action) => {
    switch(action.type) {
        case LOAD_SPOTBOOKINGS: {
            const newState = {...state, spotBookings: {}};
            action.payload.Bookings.forEach(booking => newState.spotBookings[booking.id] = booking)
            return newState;
        }
        case LOAD_USERBOOKINGS: {
            const newState = {...state, userBookings: {}};
            action.payload.Bookings.forEach(booking => newState.userBookings[booking.id] = booking)
            return newState;
        }
        case LOAD_ALLBOOKINGS: {
            const newState = {...state, spotBookings: {}};
            action.payload.Bookings.forEach(booking => newState.spotBookings[booking.id] = booking)
            return newState;
        }
        case CREATE_SPOTBOOKING: {
            const newState = {...state};
            newState.spotBookings[action.payload.id] = action.payload;
            newState.userBookings[action.payload.id] = action.payload;
            return newState;
        }
        case DELETE_BOOKING: {
            const newState = {...state};
            delete newState.spotBookings[action.payload];
            delete newState.userBookings[action.payload];
            return newState;
        }
        case UPDATE_BOOKING: {
            const newState = {...state};
            const updatedSpotBooking = {
                ...newState.spotBookings[action.payload.id],
                id: action.payload.id,
                spotId: action.payload.spotId,
                userId: action.payload.userId,
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt
            }
            const updatedUserBooking = {
                ...newState.userBookings[action.payload.id],
                id: action.payload.id,
                spotId: action.payload.spotId,
                userId: action.payload.userId,
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt
            }
            newState.spotBookings[action.payload.id] = updatedSpotBooking;
            newState.userBookings[action.payload.id] = updatedUserBooking;
            return newState;
        }
        default:
            return state;
    }
}

export default bookingReducer;
