import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { getUserSpots } from "../../store/spot";
import { getUserBookings, getAllBookings} from "../../store/bookings";
import { useModal } from "../../context/Modal";
import BookingUpdateModal from "./BookingUpdateModal";
import DeleteBookingModal from "./BookingDeleteModal";

//LOAD SPOT BOOKINGS IS LOOPING


import "./BookingManage.css";

const BookingManage = () => {
    const dispatch = useDispatch();
    const { setModalContent } = useModal();
    const [currentBatchUT, setCurrentBatchUT] = useState(0); // Upcmoing Trips
    const [currentBatchPT, setCurrentBatchPT] = useState(0); // Past Trips
    const [currentBatchUB, setCurrentBatchUB] = useState(0); // Upcoming Bookings At Your Spot
    const [currentBatchPB, setCurrentBatchPB] = useState(0); // Past Bookings At Your Spot
    const [batchSize, setBatchSize] = useState(5);



    // Select userSpots from state
    const userSpots = useSelector(state => state.spot.userSpots);
    const spotList = Object.values(userSpots);

    //Select spotBookings from state
    const spotBookings = useSelector(state => state.booking.spotBookings);
    const spotBookingsList = Object.values(spotBookings);

    //Select userBookings from state
    const userBookings = useSelector(state => state.booking.userBookings);
    const userBookingsList = Object.values(userBookings);

    const ownerBookingsList = spotList.flatMap(spot => spotBookingsList.filter(spotBooking => spotBooking.spotId === spot.id));

    useEffect(() => {

            dispatch(getAllBookings())
    }, [dispatch,spotBookingsList.length])


    // Function to add 1 day to date
    const addOneDay = (date) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1)
        return newDate;
    }

    //Bookings Made By User
    const upcomingTrip = userBookingsList.filter(booking => new Date(booking.startDate) > new Date());
    const pastTrip = userBookingsList.filter(booking => new Date(booking.startDate) < new Date());

    //Booking Made For Your Spots
    const upcomingBooking = ownerBookingsList.filter(booking => new Date(booking.startDate) > new Date());
    const pastBooking = ownerBookingsList.filter(booking => new Date(booking.startDate) < new Date());

    const upcomingTrips = upcomingTrip.map(booking => ({
        ...booking,
        startDate: addOneDay(booking.startDate),
        endDate: addOneDay(booking.endDate)
    })).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); //Sort upcomingTrips by startDate

    const pastTrips = pastTrip.map(booking => ({
        ...booking,
        startDate: addOneDay(booking.startDate),
        endDate: addOneDay(booking.endDate)
    })).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); //Sort pastTrips by startDate

    const upcomingBookings = upcomingBooking.map(booking => ({
        ...booking,
        startDate: addOneDay(booking.startDate),
        endDate: addOneDay(booking.endDate)
    })).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); //Sort upcomingBookings At Your Spots by startDate

    const pastBookings = pastBooking.map(booking => ({
        ...booking,
        startDate: addOneDay(booking.startDate),
        endDate: addOneDay(booking.endDate)
    })).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); //Sort pastBookings At Your Spots by startDate

    const visibleUpcomingTrips = useMemo(() => {
        return upcomingTrips.slice(currentBatchUT * batchSize, (currentBatchUT + 1) * batchSize);
    }, [upcomingTrips, currentBatchUT, batchSize]);

    const visiblePastTrips = useMemo(() => {
        return pastTrips.slice(currentBatchPT * batchSize, (currentBatchPT + 1) * batchSize);
    }, [pastTrips, currentBatchPT, batchSize]);

    const visibleUpcomingBookings = useMemo(() => {
        return upcomingBookings.slice(currentBatchUB * batchSize, (currentBatchUB + 1) * batchSize);
    }, [upcomingBookings, currentBatchUB, batchSize]);

    const visiblePastBookings = useMemo(() => {
        return pastBookings.slice(currentBatchPB * batchSize, (currentBatchPB + 1) * batchSize);
    }, [pastBookings, currentBatchPB, batchSize]);


    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
            dispatch(getUserSpots());
            dispatch(getUserBookings());

        }

        // Function to calculate and set batch size based on screen width
        const updateBatchSize = () => {
            const screenWidth = window.innerWidth;

            if (screenWidth >= 1200) {
                setBatchSize(5);
            } else if (screenWidth >= 900) {
                setBatchSize(4);
            } else if (screenWidth >= 600) {
                setBatchSize(3);
            } else {
                setBatchSize(2);
            }
        };

        // Set initial batch size and add resize listener
        updateBatchSize();
        window.addEventListener("resize", updateBatchSize);

        // Cleanup listener on component unmount
        return () => {
            isMounted = false;
            window.removeEventListener("resize", updateBatchSize);
        }

    }, [dispatch]);


    const loadNextBatch = (direction) => {
        let newBatch = direction === "right" ? currentBatchUT + 1 : currentBatchUT - 1;
        if (newBatch < 0 || newBatch * batchSize >= upcomingTrips.length) return;

        setCurrentBatchUT(newBatch);
    }

    const loadNextBatchPT = (direction) => {
        let newBatch = direction === "right" ? currentBatchPT + 1 : currentBatchPT - 1;
        if (newBatch < 0 || newBatch * batchSize >= pastTrips.length) return;

        setCurrentBatchPT(newBatch);
    }

    const loadNextBatchUB = (direction) => {
        let newBatch = direction === "right" ? currentBatchUB + 1 : currentBatchUB - 1;
        if (newBatch < 0 || newBatch * batchSize >= upcomingBookings.length) return;

        setCurrentBatchUB(newBatch);
    }

    const loadNextBatchPB = (direction) => {
        let newBatch = direction === "right" ? currentBatchPB + 1 : currentBatchPB - 1;
        if (newBatch < 0 || newBatch * batchSize >= pastBookings.length) return;

        setCurrentBatchPB(newBatch);
    }






    // if (!userSpots) {
    //     return <p>Loading...</p>
    // }

    // console.log("Upcoming Trips:", upcomingTrips)
    // const pastTrips = userBookingsList.filter(booking => new Date(booking.endDate) <= new Date());

    // const upcomingBookings = spotBookingsList.filter(booking => new Date(booking.endDate) > new Date());
    // const pastBookings = spotBookingsList.filter(booking => new Date(booking.endDate) <= new Date());

    // const scrollCarousel = (ref, direction) => {
    //     const scrollAmount = direction === "left" ? -200 : 200;
    //     ref.current.scrollBy({left: scrollAmount, behavior: "smooth"})
    // }

    const formatDateRange = (startDate, endDate) => {
        const options = { month: "short", day: "numeric" };
        const start = new Date(startDate).toLocaleDateString("en-Us", options);
        const end = new Date(endDate).toLocaleDateString("en-US", options);
        return `${start} - ${end}`

    }

    return (
        <div className="booking-manage">
            <div className="booking-section">
                <h2>Your Upcoming Trips</h2>
                {upcomingTrips.length > 0 ? (
                    <div className="carousel-container">
                        <button
                            className="carousel-arrow left"
                            onClick={() => loadNextBatch("left")}
                            disabled={currentBatchUT === 0}
                        >
                            &lt;
                        </button>
                        <div className="booking-carousel">
                            {visibleUpcomingTrips.map(booking => (
                                <div key={booking.id} className="booking-card">
                                    <NavLink to={`/spots/${booking.spotId}`}>
                                        <div className="booking-card-content">
                                            <img src={booking.Spot.previewImage} alt={booking.Spot.city} className="booking-image" />
                                            <div className="booking-info">
                                                <h3>{booking.Spot.city}</h3>
                                                <p>Hosted by {booking.Spot.ownerFirstName}</p>
                                                <p>{formatDateRange(booking.startDate, booking.endDate)}</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                    <div className="booking-actions">
                                        <span><button className="small-button" onClick={() => setModalContent(<BookingUpdateModal bookingId={booking.id} spotId={booking.spotId} />)}>Update</button></span>
                                        <span><button className="small-button" onClick={() => setModalContent(<DeleteBookingModal bookingId={booking.id} />)}>Delete</button></span>
                                    </div>

                                </div>
                            ))}
                        </div>
                        <button
                            className="carousel-arrow right"
                            onClick={() => loadNextBatch("right")}
                            disabled={(currentBatchUT + 1) * batchSize >= upcomingTrips.length}
                        >
                            &gt;
                        </button>
                    </div>
                ) : (<p className="no-trips-bookings">No upcoming trips.</p>)}
            </div>

            <div className="booking-section">
                <h2>Your Past Trips</h2>
                {pastTrips.length > 0 ? (
                    <div className="carousel-container">
                        <button
                            className="carousel-arrow left"
                            onClick={() => loadNextBatchPT("left")}
                            disabled={currentBatchPT === 0}
                        >
                            &lt;
                        </button>
                        <div className="booking-carousel">
                            {visiblePastTrips.map(booking => (
                                <div key={booking.id} className="booking-card">
                                    <NavLink to={`/spots/${booking.spotId}`}>
                                        <div className="booking-card-content">
                                            <img src={booking.Spot.previewImage} alt={booking.Spot.city} className="booking-image" />
                                            <div className="booking-info">
                                                <h3>{booking.Spot.city}</h3>
                                                <p>Hosted by {booking.Spot.ownerFirstName}</p>
                                                <p>{formatDateRange(booking.startDate, booking.endDate)}</p>
                                            </div>
                                        </div>
                                    </NavLink>
                                </div>
                            ))}
                        </div>
                        <button
                            className="carousel-arrow right"
                            onClick={() => loadNextBatchPT("right")}
                            disabled={(currentBatchPT + 1) * batchSize >= upcomingTrips.length}
                        >
                            &gt;
                        </button>
                    </div>
                ) : (<p className="no-trips-bookings">No past trips.</p>)}
            </div>


            {spotBookingsList.length > 0 && (
                <>
                    <div className="booking-section">
                        <h2>Upcoming Bookings At Your Spot</h2>
                        {upcomingBookings.length > 0 ? (
                            <div className="carousel-container">
                                <button
                                    className="carousel-arrow left"
                                    onClick={() => loadNextBatchUB("left")}
                                    disabled={currentBatchUB === 0}
                                >
                                    &lt;
                                </button>
                                <div className="booking-carousel">
                                    {visibleUpcomingBookings.map(booking => (
                                        <div key={booking.id} className="booking-card">
                                            <NavLink to={`/spots/${booking.spotId}`}>
                                                <div className="booking-card-content">
                                                    <img src={booking.Spot.previewImage} alt={booking.Spot.city} className="booking-image" />
                                                    <div className="booking-info">
                                                        <h3>{booking.Spot.name}</h3>
                                                        <p>Booked by {booking.User.firstName}</p>
                                                        <p>{formatDateRange(booking.startDate, booking.endDate)}</p>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="carousel-arrow right"
                                    onClick={() => loadNextBatchUB("right")}
                                    disabled={(currentBatchUB + 1) * batchSize >= upcomingBookings.length}
                                >
                                    &gt;
                                </button>
                            </div>
                        ) : (<p className="no-trips-bookings">No upcoming bookings at your spot</p>)}
                    </div>

                    <div className="booking-section">
                        <h2>Past Bookings At Your Spot</h2>
                        {pastBookings.length > 0 ? (
                            <div className="carousel-container">
                                <button
                                    className="carousel-arrow left"
                                    onClick={() => loadNextBatchPB("left")}
                                    disabled={currentBatchPB === 0}
                                >
                                    &lt;
                                </button>
                                <div className="booking-carousel">
                                    {visiblePastBookings.map(booking => (
                                        <div key={booking.id} className="booking-card">
                                            <NavLink to={`/spots/${booking.spotId}`}>
                                                <div className="booking-card-content">
                                                    <img src={booking.Spot.previewImage} alt={booking.Spot.city} className="booking-image" />
                                                    <div className="booking-info">
                                                        <h3>{booking.Spot.name}</h3>
                                                        <p>Booked by {booking.User.firstName}</p>
                                                        <p>{formatDateRange(booking.startDate, booking.endDate)}</p>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="carousel-arrow right"
                                    onClick={() => loadNextBatchPB("right")}
                                    disabled={(currentBatchPB + 1) * batchSize >= pastBookings.length}
                                >
                                    &gt;
                                </button>
                            </div>
                        ) : (<p className="no-trips-bookings">No past bookings at your spot</p>)}
                    </div>
                </>
            )}


        </div>

    )

}

export default BookingManage;
