"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TenantDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TenantDetail.belongsTo(models.Tenant, { onDelete: "CASCADE" });
    }
  }
  TenantDetail.init(
    {
      company_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      industry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TenantDetail",
    }
  );
  return TenantDetail;
};
