const express = require('express');
const { Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//Delete a Spot Image
router.delete("/:imageId", requireAuth, async (req, res) => {
    const {id} = req.user;
    const {imageId} = req.params;

    const imageWithSpot = await SpotImage.findOne({
        where: {id: imageId},
        include: {model: Spot}
    });

    const imageToDelete = await SpotImage.findByPk(imageId);

    if (imageToDelete){
        if (id === imageWithSpot.Spot.ownerId){

            await imageToDelete.destroy();

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
            "message": "Spot Image couldn't be found"
        });
    }

});






module.exports = router;
