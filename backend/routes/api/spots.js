const express = require('express');
const {Op} = require("sequelize");
const { Booking, Spot, SpotImage, User, Review, ReviewImage, sequelize } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const validateQuery = [
    check("maxLat")
        .optional()
        .isFloat({max: 90})
        .withMessage("Maximum latitude is invalid"),
    check("minLat")
        .optional()
        .isFloat({min: -90})
        .withMessage("Minimum latitude is invalid"),
    check("maxLng")
        .optional()
        .isFloat({max: 180})
        .withMessage("Maximum longitude is invalid"),
    check("minLng")
        .optional()
        .isFloat({min: -180})
        .withMessage("Minimum longitude is invalid"),
    check("minPrice")
        .optional()
        .isFloat({min: 0})
        .withMessage("Minimum price must be greater than or equal to 0"),
    check("maxPrice")
        .optional()
        .isFloat({min: 0})
        .withMessage("Maximum price must be greater than or equal to 0"),
    handleValidationErrors
]

//Get all Spots (Including filter queries)
router.get("/", validateQuery, async (req, res) => {
    let {page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice} = req.query;
    const where = {};

    if (page === undefined || page < 1) {
        page = 1
    }

    if (size === undefined || size < 1 || size > 20){
        size = 20
    }

    const errors = {};

    if (page && isNaN(page)){
        errors.page = "Page must be greater than or equal to 1";
    };

    if (size && isNaN(size)){
        errors.size = "Size must be between 1 and 20";
    }

    if (page && isNaN(page) || size && isNaN(size)){
        const err = Error("Bad Request");
        err.errors = errors;
        err.status = 400;
        throw err;
    }


    page = parseInt(page);
    size = parseInt(size);

    if (minLat !== undefined) {
        where.lat = {...where.lat, [Op.gte]: parseFloat(minLat)};
    }

    if (maxLat !== undefined){
        where.lat = {...where.lat, [Op.lte]: parseFloat(maxLat)};
    }

    if (minLng !== undefined){
        where.lng = {...where.lng, [Op.gte]: parseFloat(minLng)};
    }

    if (maxLng !== undefined){
        where.lng = {...where.lng, [Op.lte]: parseFloat(maxLng)};
    }

    if (minPrice !== undefined){
        where.price = {...where.price, [Op.gte]: parseFloat(minPrice)};
    }

    if (maxPrice !== undefined){
        where.price = {...where.price, [Op.lte]: parseFloat(maxPrice)};
    }


    const spots = await Spot.findAll({
        where,
        limit: size,
        offset: (page - 1) * size,
        include: [
            {
                model: SpotImage,
                where: {preview: true},
                required: false
            },
            {
                model: Review
            },
            {
                model : User,
                as : "Owner",
                attributes: ["firstName"]

            }
        ]
    });


    const spotsWithDetails = spots.map(spot => {
        //Extract preview image URL
        let previewImage = spot.SpotImages.length > 0 ? spot.SpotImages[0].url: "No Preview Image Available";



        //Calculate average rating
        let totalStars = 0;
        let avgRating = 0;

        if (spot.Reviews.length > 0){
            totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
            avgRating = totalStars / spot.Reviews.length;
        }

        return {
            id: spot.id,
            ownerId: spot.ownerId,
            ownerFirstName: spot.Owner.firstName,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
            avgRating: Number((avgRating).toFixed(1)),
            previewImage: previewImage
        };
    });

    return res.json({
        Spots: spotsWithDetails,
        page: page,
        size: size
    });
});

  //Get all Spots owned by the Current User
  router.get("/current", requireAuth, async (req, res) => {
    const {id} = req.user;

    const spots = await Spot.findAll({
        where: {ownerId: id},
        include: [
            {model: SpotImage},
            {model: Review}
        ]
    });

    if (spots.length > 0){
        const spotsWithDetails = spots.map(spot => {
            //Extract preview image URL
            let previewImage = spot.SpotImages.find(image => image.preview);

            if (previewImage) {
                previewImage = previewImage.url;
            } else {
                previewImage = "No Preview Image Available";
            }

            //Calculate average rating
            let totalStars = 0;
            let avgRating = 0;

            if (spot.Reviews.length > 0) {
                totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
                avgRating = totalStars / spot.Reviews.length;
            }

            return {
                id: spot.id,
                ownerId: spot.ownerId,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: spot.lat,
                lng: spot.lng,
                name: spot.name,
                description: spot.description,
                price: spot.price,
                createdAt: spot.createdAt,
                updatedAt: spot.updatedAt,
                avgRating: Number((avgRating).toFixed(1)),
                previewImage: previewImage
            };
        });

        return res.json({Spots: spotsWithDetails});
    } else {
        return res.json({
            "message": "The current user does not own a place"
        });
    }

});


//Get details of a Spot from an id
router.get("/:spotId", async (req, res) => {
    const {spotId} = req.params;

    const spot = await Spot.findOne({
        where: {id: spotId},
        include: [
            {model: SpotImage},
            {model: User, as: "Owner", attributes: ["id", "firstName", "lastName"]},
        ]
    });


    if (spot){

        const reviews = await Review.findAll({
            where:{spotId: spotId}
        });

        let numReviews = 0;
        let totalStars = 0;

        reviews.forEach(review => {
            numReviews = numReviews + 1;
            totalStars = totalStars + review.stars;
        });

        if (numReviews > 0){
            avgStarRating = Number((totalStars / numReviews).toFixed(1));
        } else {
            avgStarRating = 0;
        }

        const spotWithCountAndAve = spot.toJSON();

        const response = {
            id: spotWithCountAndAve.id,
            ownerId: spotWithCountAndAve.ownerId,
            address: spotWithCountAndAve.address,
            city: spotWithCountAndAve.city,
            state: spotWithCountAndAve.state,
            country: spotWithCountAndAve.country,
            lat: spotWithCountAndAve.lat,
            lng: spotWithCountAndAve.lng,
            name: spotWithCountAndAve.name,
            description: spotWithCountAndAve.description,
            price: spotWithCountAndAve.price,
            createdAt: spotWithCountAndAve.createdAt,
            updatedAt: spotWithCountAndAve.updatedAt,
            numReviews: numReviews,
            avgStarRating: avgStarRating,
            SpotImages: spotWithCountAndAve.SpotImages,
            Owner: spotWithCountAndAve.Owner
        }
        res.json(response)
    } else {
        res.status(404);
        res.json({
            "message": "Spot couldn't be found"
        });
    }
});

const validateSpot = [
    check("address")
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check("city")
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check("state")
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check("country")
        .exists({ checkFalsy: true })
        .withMessage("Country is required"),
    check("lat")
        .isFloat({min: -90, max: 90})
        .withMessage("Latitude must be within -90 and 90"),
    check("lng")
        .isFloat({min: -180, max: 180})
        .withMessage("Longitude must be within -180 and 180"),
    check("name")
        .exists({ checkFalsy: true })
        .withMessage("Name is required")
        .isLength({max: 50})
        .withMessage("Name must be less than 50 characters"),
    check("description")
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check("price")
        .isFloat({gt: 0})
        .withMessage("Price per day must be a positive number"),
    handleValidationErrors
]
//Create a Spot
router.post("/", requireAuth, validateSpot, async (req, res) => {
    const {address, city, state, country, lat, lng, name, description, price} = req.body;
    const {id} = req.user;

    const newSpot = await Spot.create({
        ownerId: id,
        address: address,
        city: city,
        state: state,
        country: country,
        lat: lat,
        lng: lng,
        name: name,
        description: description,
        price: price
    });

    res.status(201);
    return res.json(newSpot);
});

//Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, async (req, res) => {
    const {spotId} = req.params;
    const {url, preview} = req.body;
    const {id} = req.user;

    const spot = await Spot.findByPk(spotId);

    if (spot){
        if (spot.ownerId === id){
            const newImage = await SpotImage.create({
                url,
                preview,
                spotId
            });

            const newImageRecord = await SpotImage.findByPk(newImage.id);
            res.status(201);
            return res.json(newImageRecord);

        } else {
            res.status(403);
            res.json({
                "message": "Forbidden"
              })
        }
    } else {
        res.status(404);
        return res.json({
            "message": "Spot couldn't be found"
          })
    }

});

//Edit a Spot
router.put("/:spotId", requireAuth, validateSpot, async (req, res) =>{
    const {spotId} = req.params;
    const {address, city, state, country, lat, lng, name, description, price} = req.body;
    const {id} = req.user;

    const updateSpot = await Spot.findByPk(spotId);

    if (updateSpot){

        if (id === updateSpot.ownerId){
            updateSpot.set({
                ownerId: id,
                address: address,
                city: city,
                state: state,
                country: country,
                lat: lat,
                lng: lng,
                name: name,
                description: description,
                price: price
            });

            await updateSpot.save();

            return res.json(updateSpot);
        } else {
            res.status(403);
            res.json({
                "message": "Forbidden"
              })
        }

    } else {
        res.status(404);
        return res.json({
            "message": "Spot couldn't be found"
          })
    }
});

//Delete a Spot
router.delete("/:spotId", requireAuth, async(req, res) => {
    const {spotId} = req.params;
    const {id} = req.user;

    const deleteSpot = await Spot.findByPk(spotId);

    if (deleteSpot){
        if (id === deleteSpot.ownerId){
            await deleteSpot.destroy();
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
            "message": "Spot couldn't be found"
          });
    }
});


//Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res) => {
    const {spotId} = req.params;

    const reviews = await Review.findAll({
        where: {spotId: spotId},
        include: [
            {model: User, attributes: ["id", "firstName", "lastName"]},
            {model: ReviewImage, attributes: ["id", "url"]}
        ]
    });

    if (reviews && reviews.length > 0){
        res.json({Reviews:reviews});
    } else {
        res.status(404);
        res.json({
            "message": "Spot couldn't be found"
        });
    }
});

const validateReview = [
    check("review")
        .exists({ checkFalsy: true})
        .withMessage("Review text is required"),
    check("stars")
        .isInt({min: 1, max: 5})
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
]


//Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
    const {spotId} = req.params;
    const {id} = req.user;

    const bookings = await Booking.findAll({
        where: {spotId: spotId},
        include: [
            {
                model: Spot,
                attributes:["price", "city"],
                include: [{
                    model: SpotImage,
                    where: {preview: true},
                    attributes: ["url"],
                    required: false
                }]
            },
            {model: User}
        ]
    });

    if (bookings && bookings.length > 0){
        const formattedBookings = bookings.map(booking => {
            // const spot = booking.Spot;
            const user = booking.User;
            const spot = booking.Spot;
            const previewImage = spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null;

            // if (id === spot.ownerId) {
                return {
                    User: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    id: booking.id,
                    spotId: booking.spotId,
                    userId: booking.userId,
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt,
                    previewImage: previewImage,
                    price: spot.price,
                    city: spot.city
                }
            // } else {
            //     return {
            //         id: booking.id,
            //         spotId: booking.spotId,
            //         startDate: booking.startDate,
            //         endDate: booking.endDate
            //     }
            // }
        });
        res.json({Bookings: formattedBookings});
    } else {
        res.status(404);
        res.json({
            "message": "Spot couldn't be found"
        });
    }
});


//Create a Review for a Spot based on the Spot's id
router.post("/:spotId/reviews", requireAuth, validateReview, async (req, res) => {
    const {id} = req.user;
    const {spotId} = req.params;
    const {review, stars} = req.body;

    const spot = await Spot.findByPk(spotId);

    if (spot) {
        const checkUserReviewExist = await Review.findOne({
            where: {
                spotId: spotId,
                userId: id
            }
        });

        if (!checkUserReviewExist){
            const newReview = await Review.create({
                userId: id,
                spotId: spotId,
                review: review,
                stars: stars
            });

            res.status(201);
            res.json(newReview);
        } else {
            res.status(500);
            res.json({
                "message": "User already has a review for this spot"
            });
        }
    } else {
        res.status(404);
        res.json({
            "message": "Spot couldn't be found"
        });
    }
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
    const {spotId} = req.params;
    const {startDate, endDate} = req.body;

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
    next();
}


//Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, validateBooking, checkBookingConflict, async (req, res) => {
    const {id} = req.user;
    const {spotId} = req.params;
    const {startDate, endDate} = req.body;


    const spot = await Spot.findByPk(spotId);

    if (spot) {
        if (spot.ownerId !== id){
            const newBooking = await Booking.create({
                spotId: spotId,
                userId: id,
                startDate: startDate,
                endDate: endDate
            });

            res.status(201);
            res.json(newBooking)

        } else {
            res.status(403);
            res.json({
                "message": "Forbidden"
            });
        }
    } else {
        res.status(404);
        res.json({
            "message": "Spot couldn't be found"
        });
    }

});



module.exports = router;
