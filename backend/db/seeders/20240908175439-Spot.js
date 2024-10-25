'use strict';

const { Spot } = require("../models");



let options = {};
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

    // add 1 more spot with data points as below
   await Spot.bulkCreate([
    {
      ownerId: 1,
      address: "134 Home Ave",
      city: "Minneapolis",
      state: "Minnesota",
      country: "United States",
      lat: 23.432,
      lng: 124.54,
      name: "Kevin's Home",
      description: "Amazing location!",
      price: 400.00
    },
    {
      ownerId: 2,
      address: "52 Long Ave",
      city: "Salt Lake City",
      state: "Utah",
      country: "United States",
      lat: 50,
      lng: -26.45,
      name: "Snow Paradise",
      description: "Great destination for a ski trip",
      price: 500.10
    },
    {
      ownerId: 3,
      address: "03 Washington Ave",
      city: "Boulder",
      state: "Colorado",
      country: "United States",
      lat: 25,
      lng: 79.23,
      name: "Mountain Cabin",
      description: "Several hiking trails to choose from",
      price: 435.23
    },
    {
      ownerId: 1,
      address: "03 Washington Ave",
      city: "Toledo",
      state: "Ohio",
      country: "United States",
      lat: 36,
      lng: 93.45,
      name: "Restful Rural Retreat",
      description: "Open skies and fresh air",
      price: 198.25
    }
  ],{validate: true});

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Spots";
    await queryInterface.bulkDelete(options,{
      name: { [Op.in]: ["Kevin's Home","Snow Paradise", "Mountain Cabin", "Restful Rural Retreat"] }
    },{});
  }
};
