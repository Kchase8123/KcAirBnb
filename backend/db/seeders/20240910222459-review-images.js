'use strict';

const { ReviewImage } = require("../models");
const bcrypt = require("bcryptjs");
const reviewimage = require("../models/reviewimages");


let options = {};
options.tableName = "ReviewImages";
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in the options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
        await ReviewImage.bulkCreate([
          {
            url: "https://res.cloudinary.com/dmg8yuivs/image/upload/v1721698721/Review_Image_3_nm4fmi.jpg",
            reviewId: 1
          },
          {
            url: "https://res.cloudinary.com/dmg8yuivs/image/upload/v1721698719/Review_Image_1_nunyk2.jpg",
            reviewId: 2
          },
          {
            url: "https://res.cloudinary.com/dmg8yuivs/image/upload/v1721698720/Review_Image_2_lcojaq.jpg",
            reviewId: 3
          },
        ],{validate:true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
      options.tableName = "ReviewImages";
      const Op = Sequelize.Op;
      await queryInterface.bulkDelete(options, {
        url: { [Op.in]: ["https://res.cloudinary.com/dmg8yuivs/image/upload/v1721698721/Review_Image_3_nm4fmi.jpg",
          "https://res.cloudinary.com/dmg8yuivs/image/upload/v1721698719/Review_Image_1_nunyk2.jpg",
          "https://res.cloudinary.com/dmg8yuivs/image/upload/v1721698720/Review_Image_2_lcojaq.jpg"
        ] }
      },{});
  }
};
