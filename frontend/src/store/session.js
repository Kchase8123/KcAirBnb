import { csrfFetch } from "./csrf";

//Action Types
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

//Action Creators
const setUser = (user) => {
    return {
        type: SET_USER,
        payload: user
    }
};

const removeUser = () => {
    return {
        type: REMOVE_USER
    }
};

//Thunk action for user sign up
export const signup = (user) => async (dispatch) => {
    const { username, firstName, lastName, email, password } = user;
    const response = await csrfFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
            username,
            firstName,
            lastName,
            email,
            password
        })
    });
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
};

//Thunk action for logging in
export const login = ({credential, password}) => async (dispatch) => {
    const response = await csrfFetch("/api/session", {
        method: "POST",
        body: JSON.stringify({credential, password})
    });

    if (response.ok) {
        const data = await response.json();
        dispatch(setUser(data.user));
        return response;
    }
};

//Thunk action for restoring user
export const restoreUser = () => async (dispatch) => {
    const response = await csrfFetch("/api/session");

    if (response.ok) {
        const data = await response.json();
        dispatch(setUser(data.user));
        return response;
    }
};

//Thunk action for logging out
export const logout = () => async (dispatch) => {
    const response = await csrfFetch("/api/session", {
        method: "DELETE"
    });
    dispatch(removeUser());
    return response;
};

//Initial state for the session slice
const initialState = {user: null};

//Session reducer
const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return {...state, user: action.payload};
        case REMOVE_USER:
            return {...state, user:null};
        default:
            return state;
    }
};

export default sessionReducer;

