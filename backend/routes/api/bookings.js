const express = require('express');
const {Op} = require("sequelize");
const { Booking, Spot, SpotImage, User} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

//Get all of the bookings
router.get("/", async (req, res) => {

    const bookings = await Booking.findAll({
        include: [{
            model: Spot,
            attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "price"],
            include: [
                {
                    model: SpotImage,
                    attributes: ["url", "preview"]
                },
                {
                    model: User,
                    as: "Owner",
                    attributes: ["id","firstName","lastName"]
                }
            ]
        }]
    });

    //Format the output
    const formattedBookings = bookings.map(booking => {
        const spot = booking.Spot;
        let previewImage = spot.SpotImages && spot.SpotImages.find(image => image.preview);

        if (previewImage){
            previewImage = previewImage.url;
        } else {
            previewImage = "No Preview Image Available";
        }

        return {
            id: booking.id,
            spotId: booking.spotId,
            Spot: {
                id: spot.id,
                ownerId: spot.ownerId,
                ownerFirstName: spot.Owner.firstName,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: Number(spot.lat),
                lng: Number(spot.lng),
                name: spot.name,
                price: Number(spot.price),
                previewImage: previewImage
            },
            User: {
                id: spot.Owner.id,
                firstName: spot.Owner.firstName,
                lastName: spot.Owner.lastName
            },
            startDate: booking.startDate,
            endDate: booking.endDate,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        };
    });

    res.json({Bookings: formattedBookings});

});



//Get all of the Current User's Bookings
router.get("/current", requireAuth, async (req, res) => {
    const {id} = req.user;

    const bookings = await Booking.findAll({
        where: {userId: id},
        include: [{
            model: Spot,
            attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "price"],
            include: [
                {
                    model: SpotImage,
                    attributes: ["url", "preview"]
                },
                {
                    model: User,
                    as: "Owner",
                    attributes: ["firstName"]


                }
            ]
        }]
    });

    //Format the output
    const formattedBookings = bookings.map(booking => {
        const spot = booking.Spot;
        let previewImage = spot.SpotImages && spot.SpotImages.find(image => image.preview);

        if (previewImage){
            previewImage = previewImage.url;
        } else {
            previewImage = "No Preview Image Available";
        }

        return {
            id: booking.id,
            spotId: booking.spotId,
            Spot: {
                id: spot.id,
                ownerId: spot.ownerId,
                ownerFirstName: spot.Owner.firstName,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: Number(spot.lat),
                lng: Number(spot.lng),
                name: spot.name,
                price: Number(spot.price),
                previewImage: previewImage
            },
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        };
    });

    res.json({Bookings: formattedBookings});

});

const validateBooking = [
    check("startDate")
        .custom(value => {
            const startDate = new Date(value);
            const currentDate = new Date();

            if (startDate < currentDate){
                throw new Error("startDate cannot be in the past")
            }
            return true;
        })
        .bail(),
    check("endDate")
        .custom((value, {req}) => {
            const endDate = new Date(value);
            const startDate = new Date(req.body.startDate);

            if (endDate <= startDate){
                throw new Error("endDate cannot be on or before startDate");
            }


            return true;
        })
        .bail(),
    handleValidationErrors
]

//Check for booking conflict
const checkForBookingConflict = async (spotId, startDate, endDate) => {
    const conflictingBookings = await Booking.findAll({
        where:{
            spotId: spotId,
            [Op.or]: [
                {startDate: {[Op.between]: [startDate, endDate]}},
                {endDate: {[Op.between]: [startDate, endDate]}},
                {[Op.and]: [
                    {startDate: {[Op.lte]: startDate}},
                    {endDate: {[Op.gte]: endDate}}
                ]}
            ]}
        });

    return conflictingBookings.length > 0;
}

const checkBookingConflict = async (req, res, next) => {
    const {bookingId} = req.params;
    const {startDate, endDate} = req.body;

    const booking = await Booking.findByPk(bookingId);

    if (booking) {
        const spotId = booking.spotId;

        const isConflict = await checkForBookingConflict(spotId, new Date(startDate), new Date(endDate));

        if (isConflict){
            res.status(403);
            return res.json({
                "message": "Sorry, this spot is already booked for the specified dates",
                "errors": {
                    "startDate": "Start date conflicts with an existing booking",
                    "endDate": "End date conflicts with an existing booking"
                }
            });
        }
    } else {
        res.status(404);
        return res.json({
            "message": "Booking couldn't be found"
        });
    }

    next();
}


//Edit a Booking
router.put("/:bookingId", requireAuth, validateBooking, async (req, res) => {
    const {id} = req.user;
    const {bookingId} = req.params;
    const {startDate, endDate} = req.body;
    const currentDate = new Date();

    if (new Date(endDate) < currentDate) {
        res.status(403);
        return res.json({
            "message": "Past bookings can't be modified"
        });
    }


    const bookingToUpdate = await Booking.findByPk(bookingId);

    console.log('bookingToUpdate:', bookingToUpdate);

    if (bookingToUpdate) {
        if (id === bookingToUpdate.userId){
            bookingToUpdate.set({
                startDate: startDate,
                endDate: endDate
            });

        await bookingToUpdate.save();

        return res.json(bookingToUpdate);

        } else {
            res.status(403);
            res.json({
                "message": "Forbidden"
            })
        }

    } else {
        res.status(404);
        return res.json({
            "message": "Booking couldn't be found"
        })
    }

});



//Delete a Booking
router.delete("/:bookingId", requireAuth, async (req, res) => {
    const {id} = req.user;
    const {bookingId} = req.params;
    const currentDate = new Date();

    const booking = await Booking.findOne({
        where: {id: bookingId},
        include: {model :Spot}
    });

    const bookingToDelete = await Booking.findByPk(bookingId);

    if (bookingToDelete){
        if (id === bookingToDelete.userId || id === booking.Spot.ownerId) {

            if (bookingToDelete.startDate < currentDate) {
                res.status(403);
                return res.json({
                    "message": "Bookings that have been started can't be deleted"
                });
            }

            await bookingToDelete.destroy();

            res.json({
                "message": "Successfully deleted"
            });
        } else {
            res.status(403);
            res.json({
                "message": "Forbidden"
            });
        }

    } else {
        res.status(404);
        res.json({
            "message": "Booking couldn't be found"
        });
    }
});


module.exports = router;
