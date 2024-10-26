'use strict';
const { SpotImage } = require("../models");
const bcrypt = require("bcryptjs");


let options = {};
options.tableName = "SpotImages";
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
        await SpotImage.bulkCreate([
          {
            url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
            preview: true,
            spotId: 2
          },
          {
            url: "https://images.pexels.com/photos/298842/pexels-photo-298842.jpeg",
            preview: false,
            spotId: 2
          },
          {
            url: "https://images.pexels.com/photos/2950003/pexels-photo-2950003.jpeg",
            preview: false,
            spotId: 2
          },
          {
            url: "https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg",
            preview: false,
            spotId: 2
          },
          {
            url: "https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg",
            preview: false,
            spotId: 2
          },
          {
            url: "https://images.pexels.com/photos/731082/pexels-photo-731082.jpeg",
            preview: true,
            spotId: 1
          },
          {
            url: "https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg",
            preview: false,
            spotId: 1
          },
          {
            url: "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg",
            preview: false,
            spotId: 1
          },
          {
            url: "https://images.pexels.com/photos/1129413/pexels-photo-1129413.jpeg",
            preview: false,
            spotId: 1
          },
          {
            url: "https://images.pexels.com/photos/1444424/pexels-photo-1444424.jpeg",
            preview: false,
            spotId: 1
          },
          {
            url: "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg",
            preview: true,
            spotId: 3
          },
          {
            url: "https://images.pexels.com/photos/462235/pexels-photo-462235.jpeg",
            preview: false,
            spotId: 3
          },
          {
            url: "https://images.pexels.com/photos/1125136/pexels-photo-1125136.jpeg",
            preview: false,
            spotId: 3
          },
          {
            url: "https://images.pexels.com/photos/447592/pexels-photo-447592.jpeg",
            preview: false,
            spotId: 3
          },
          {
            url: "https://images.pexels.com/photos/2440471/pexels-photo-2440471.jpeg",
            preview: false,
            spotId: 3
          },
          {
            url: "https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg",
            preview: true,
            spotId: 4
          },
          {
            url: "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg",
            preview: false,
            spotId: 4
          },
          {
            url: "https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg",
            preview: false,
            spotId: 4
          },
          {
            url: "https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg",
            preview: false,
            spotId: 4
          },
          {
            url: "https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg",
            preview: false,
            spotId: 4
          }
        ],{validate:true})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "SpotImages";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options,{
      spotId: { [Op.in]: [1, 2, 3 ,4] }
    },{});
  }
};
