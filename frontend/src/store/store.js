import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import {thunk} from "redux-thunk";
import sessionReducer from "./session"; // Import session reducer

const rootReducer = combineReducers({
  session: sessionReducer, // Add the session reducer here
  // ADD OTHER REDUCERS HERE IF NEEDED
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
