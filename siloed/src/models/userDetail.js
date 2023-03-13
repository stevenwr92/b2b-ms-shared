"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserDetail.belongsTo(models.User, { onDelete: "CASCADE" });
    }
  }
  UserDetail.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birth_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      citizen_id_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserDetail",
    }
  );
  return UserDetail;
};
