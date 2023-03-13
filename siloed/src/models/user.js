"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.UserDetail, { onDelete: "CASCADE" });
      User.belongsTo(models.GroupRole, { onDelete: "CASCADE" });
      //   User.belongsTo(models.Group, { onDelete: "cascade" });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Not an email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phonenumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      access_pin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.addHook("beforeCreate", (user, options) => {
    user.password = bcrypt.hashSync(user.password, 8);
  });
  return User;
};
