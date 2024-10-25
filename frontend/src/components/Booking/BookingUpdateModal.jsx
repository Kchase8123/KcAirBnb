import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { getSpotBookings, updateExistingBooking } from "../../store/bookings";
import "./BookingModal.css"


function BookingUpdateModal({ bookingId, spotId }) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [bookedDates, setBookedDates] = useState([]);
    const { closeModal } = useModal();

    const bookings = useSelector(state => state.booking.spotBookings);

    useEffect(() => {
        //Fetch booked dates and update state
        dispatch(getSpotBookings(spotId));
    }, [dispatch, spotId]);

    useEffect(() => {
        if (bookings && bookingId) {
            const booking = bookings[bookingId];

            if (booking) {
                // Set the initial start and end dates based on the booking data
                const start = new Date(booking.startDate);
                const end = new Date(booking.endDate);

                setStartDate(new Date(start.setDate(start.getDate() + 1)));
                setEndDate(new Date(end.setDate(end.getDate() + 1)));
            }
        }
    }, [bookings, bookingId])

    useEffect(() => {
        if (bookings) {
            //Update bookedDates when bookings change
            const bookingsCopy = { ...bookings };
            delete bookingsCopy[bookingId];
            const bookingsArray = Object.values(bookingsCopy).filter(booking => booking.spotId === spotId);


            const dates = bookingsArray.flatMap(booking => {
                const start = new Date(booking.startDate);
                const end = new Date(booking.endDate);

                const rangeDates = [];

                let currentDate = new Date(start);

                // Start from the day after the start date
                currentDate.setDate(currentDate.getDate() + 1);

                // Add the date range to the array
                while (currentDate <= end) {
                    rangeDates.push({
                        date: new Date(currentDate)
                    });

                    currentDate.setDate(currentDate.getDate() + 1);
                }

                //Include the day after the end date
                const dayAfterEnd = new Date(end);
                dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
                rangeDates.push({ date: dayAfterEnd });

                return rangeDates;

            });

            setBookedDates(dates);
        }
    }, [dispatch, bookingId, bookings, spotId]);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const extractDate = (date) => {
        const dateObject = new Date(date);
        dateObject.setHours(0, 0, 0, 0); // Ensure the date is set to midnight

        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, "0"); //getMonth() is zero-based
        const day = String(dateObject.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        if (startDate && endDate) {
            const bookingDates = {
                startDate: extractDate(startDate),
                endDate: extractDate(endDate)
            };
            dispatch(updateExistingBooking(bookingId, bookingDates));
            setMessage("Booking Successfully Updated.");
            setTimeout(() => {
                closeModal();
            }, 2000);
        } else {
            setErrors({ date: "Please select both start and end dates." })
        }
    };

    // // Function to check if a date is within any booked range
    // const isBooked = (date) => {
    //     const dateObject = new Date(date);
    //     return bookedDates.some(({start, end}) => {
    //         const startDate = new Date(start);
    //         const endDate = new Date(end);

    //         return dateObject >= startDate && dateObject <= endDate;
    //     });
    // };

    // Create an array of booked dates for highlighting
    const highlightDates = [
        {
            "react-datepicker__day--highlighted-booked": bookedDates.map(({ date }) => new Date(date))
        }
    ];

    const isBooked = (date) => {
        const dateObject = new Date(date);
        return bookedDates.some(({ date }) => {
            const bookedDate = new Date(date);
            return dateObject.toDateString() === bookedDate.toDateString();
        });
    };

    return (
        <div>
            {!message ? (
                <>
                    <h1>Book Your Stay</h1>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Select Dates
                            <div className="datepicker-container">
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleDateChange}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    shouldCloseOnSelect={false} //Keep calendar open until both dates are selected
                                    popperPlacement="top-start"
                                    minDate={new Date()} //Prevent past dates from being selected
                                    highlightDates={highlightDates}
                                    filterDate={date => !isBooked(date)} //Disable clicking on booked dates

                                />
                            </div>
                        </label>
                        {errors.date && <p>{errors.date}</p>}
                        <button
                            type="submit"
                            className="enabled-button"
                        >
                            Update Booking
                        </button>
                    </form>
                </>
            ) : (
                <h2>{message}</h2>
            )}


        </div>
    );
}

export default BookingUpdateModal;
