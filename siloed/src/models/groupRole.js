"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupRole.belongsTo(models.Group, { onDelete: "Cascade" });
      GroupRole.hasMany(models.User, { onDelete: "Cascade" });
      GroupRole.hasOne(models.RolePolicy, { onDelete: "Cascade" });
    }
  }
  GroupRole.init(
    {
      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "GroupRole",
    }
  );
  return GroupRole;
};
