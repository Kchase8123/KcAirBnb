'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SpotImage.belongsTo(models.Spot,{
        foreignKey: "spotId"
      })
    }
  }
  SpotImage.init({
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spots',
        key: 'id',
      },
      onDelete: 'CASCADE',
    }
  }, {
    sequelize,
    modelName: 'SpotImage',
    // defaultScope: {
    //   attributes: {
    //     exclude: ["spotId", "createdAt", "updatedAt"]
    //   }
    // }
  });
  return SpotImage;
};
