const express = require('express');
const { Review, User, Spot, SpotImage, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

const { check } = require('express-validator');

const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//Get all Reviews of the Current User
router.get("/current", requireAuth, async (req, res) => {
    const {id} = req.user;

    const reviews = await Review.findAll({
        where: {userId: id},
        include: [
            {model: User, attributes: ["id", "firstName", "lastName"]},
            {model: Spot, attributes: [
                "id",
                "ownerId",
                "address",
                "city",
                "state",
                "country",
                "lat",
                "lng",
                "name",
                "price"
            ], include: [{model: SpotImage, attributes: ["url", "preview"]}]},
            {model: ReviewImage, attributes: ["id", "url"]}
        ]
    });

    const reviewsWithPreviewImage = reviews.map(review => {
        //Convert the Spot model instance into a plain object
        const spot = review.Spot.toJSON();

        //Find the preview image URL
        let previewImage = spot.SpotImages.find(image => image.preview);

        if (previewImage){
            previewImage = previewImage.url;
        } else {
            previewImage = "No Preview Image Available";
        }

        //Remove the SpotImages array
        delete spot.SpotImages;

        //Add the previewImage field to the Spot object
        spot.previewImage = previewImage;

        //Convert the Review model instance into a plain object and include the modified Spot object
        return {
            ...review.toJSON(),
            Spot: spot
        };
    });

    res.json({Reviews: reviewsWithPreviewImage});
});

//Add an Image to a Review based on the Review's id
router.post("/:reviewId/images", requireAuth, async (req, res) => {
    const {id} = req.user;
    const {reviewId} = req.params;
    const {url} = req.body;

    const review = await Review.findByPk(reviewId);

    if (review){
        const reviewImageCount = await ReviewImage.count({
            where: {reviewId: reviewId}
        });

        if (review.userId === id){
            if (reviewImageCount < 10){
                const newImage = await ReviewImage.create({
                    reviewId: reviewId,
                    url: url
                });

                res.status(201);
                res.json({
                    id: newImage.id,
                    url: url
                });
            } else {
                res.status(403);
                res.json({
                    "message": "Maximum number of images for this resource was reached"
                });
            }

        } else {
            res.status(403);
            res.json({
                "message": "Forbidden"
            });
        }
    } else {
        res.status(404);
        res.json({
            "message": "Review couldn't be found"
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

//Edit a Review
router.put("/:reviewId", requireAuth, validateReview, async (req, res) => {
    const {id} = req.user;
    const {reviewId} = req.params;
    const {review, stars} = req.body;


    const reviewToUpdate = await Review.findByPk(reviewId);


        if (reviewToUpdate){
            if (id === reviewToUpdate.userId) {
                reviewToUpdate.update({
                    review: review,
                    stars: stars
                });

            res.status(200);
            res.json(reviewToUpdate);

            } else {
                res.status(403);
                res.json({
                    "message": "Forbidden"
                });
            }

        } else {
            res.status(404);
            res.json({
                "message": "Review couldn't be found"
            });
        }
});

//Delete a Review
router.delete("/:reviewId", requireAuth, async (req, res) => {
    const {id} = req.user;
    const {reviewId} = req.params;

    const reviewToDelete = await Review.findByPk(reviewId);

    if (reviewToDelete) {
        if (id === reviewToDelete.userId){
            await reviewToDelete.destroy();
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
            "message": "Review couldn't be found"
        });
    }

});


module.exports = router;
