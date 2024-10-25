import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import sessionReducer from "./session";
import spotReducer from "./spot";
import spotImageReducer from "./spotimagecrud";
import reviewReducer from "./review";
import bookingReducer from "./bookings";


const rootReducer = combineReducers({
    session: sessionReducer,
    spot: spotReducer,
    spotImage: spotImageReducer,
    review: reviewReducer,
    booking: bookingReducer
});

let enhancer;

if (import.meta.env.MODE === "production"){
    enhancer = applyMiddleware(thunk);
} else {
    const logger = (await import("redux-logger")).default;
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
