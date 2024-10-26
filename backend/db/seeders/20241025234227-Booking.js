'use strict';

const { Booking } = require("../models");
const bcrypt = require("bcryptjs");


let options = {};
options.tableName = "Bookings";
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
       await Booking.bulkCreate([
        {
          spotId: 3,
          userId: 1,
          startDate: new Date("2025-01-02"),
          endDate: new Date("2025-07-14")
        },
        {
          spotId: 2,
          userId: 3,
          startDate: new Date("2024-11-15"),
          endDate: new Date("2025-02-09")
        },
        {
          spotId: 1,
          userId: 1,
          startDate: new Date("2025-06-10"),
          endDate: new Date("2025-08-20")
        },
        {
          spotId: 2,
          userId: 2,
          startDate: new Date('2025-09-01'),
          endDate: new Date('2025-09-07'),
        },
       ],{validate: true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Bookings";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3] }
    } ,{});
  }
};
