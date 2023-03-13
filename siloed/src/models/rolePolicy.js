"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RolePolicy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RolePolicy.belongsTo(models.GroupRole, { onDelete: "CASCADE" });
    }
  }
  RolePolicy.init(
    {
      approval_topup: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      approval_expense: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      approval_prebudget: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      manage_budget: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "RolePolicy",
    }
  );
  return RolePolicy;
};
