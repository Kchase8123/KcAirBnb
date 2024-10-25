import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { getSpotBookings } from "../../store/bookings";
import { createSpotBooking } from "../../store/bookings";
import "./BookingModal.css"


function BookingModal({ spotId }) {
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
        if (bookings) {
            //Update bookedDates when bookings change
            const bookingsArray = Object.values(bookings);

            const dates = bookingsArray.flatMap(booking => {
                const start = new Date(booking.startDate);
                const end = new Date(booking.endDate);
                const rangeDates = [];

                let currentDate = new Date(start);

                currentDate.setDate(currentDate.getDate() + 1); // Start range from the day after the start date
                while (currentDate <= end) {
                    rangeDates.push({
                        date: new Date(currentDate)
                    });

                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Adding end date + 1 to include the last day in the booking range
                const dayAfterEnd = new Date(end);
                dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
                rangeDates.push({ date: dayAfterEnd });

                return rangeDates;

            });
            setBookedDates(dates);
        }
    }, [dispatch, bookings])

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const extractDate = (date) => {
        const dateObject = new Date(date);

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
            dispatch(createSpotBooking(spotId, bookingDates));

            setMessage("Booking Successfully Created.");

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
                            Book Now
                        </button>
                    </form>
                </>

            ) : (
                <h2>{message}</h2>
            )}
        </div>

    );
}

export default BookingModal;
