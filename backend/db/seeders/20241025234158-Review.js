'use strict';

const { Review } = require("../models");
const bcrypt = require("bcryptjs");


let options = {};
options.tableName = "Reviews";
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
      await Review.bulkCreate([
        {
          userId: 2,
          spotId: 2,
          review: "Relaxing stay, lovely place",
          stars: 4
        },
        {
          userId: 3,
          spotId: 3,
          review: "Very clean and modern",
          stars: 5
        },
        {
          userId: 1,
          spotId: 1,
          review: "Definitely worth a visit",
          stars: 4
        },
        {
          userId: 3,
          spotId: 1,
          review: "Not as nice as advertised :(",
          stars: 2,
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
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2 ,3] }
    } ,{});
  }
};
