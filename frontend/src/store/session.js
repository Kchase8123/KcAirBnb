import { csrfFetch } from "./csrf";

// Action Types
const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

// Action Creators
const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

// Thunk Action for Signing Up
export const signup =
  ({ username, firstName, lastName, email, password }) =>
  async (dispatch) => {
    const response = await csrfFetch("/api/users", {
      method: "POST",
      body: { username, firstName, lastName, email, password }, // Directly use the object without stringifying
    });

    const data = await response.json();
    dispatch(setUser(data.user)); // Make sure `setUser` is defined in the same way as for `login`
    return response;
  };


// Thunk to Log In User
export const login = (user) => async (dispatch) => {
  const { credential, password } = user;

  console.log("Logging in with:", { credential, password });
  const response = await csrfFetch("/api/session", {
    method: "POST",
    // headers: {
    //   'Content-Type': 'application/json',  // Important! Set the content type to JSON
    // },
    body: JSON.stringify({ credential, password }),
  });
  const data = await response.json();
  dispatch(setUser(data.user)); // Add the user to the Redux store
  return response;
};

// Thunk Action for Restoring Session User
export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session"); // Fetch the current session user
  const data = await response.json();
  dispatch(setUser(data.user)); // Set the session user in the store
  return response;
};
// Thunk action Log Out
export const logout = () => async (dispatch) => {
  const response = await csrfFetch("/api/session", { method: "DELETE" });
  dispatch(removeUser());
  return response;
};

// Reducer
const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

// Export the reducer as default
export default sessionReducer;
