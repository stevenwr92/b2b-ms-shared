"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
module.exports = (sequelize, DataTypes) => {
  class Tenant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tenant.hasOne(models.TenantDetail, { onDelete: "CASCADE" });
      // Tenant.hasMany(models.TenantUser, { onDelete: "CASCADE" });
    }
  }
  Tenant.init(
    {
      tenant_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      is_activated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: "Tenant",
    }
  );
  Tenant.addHook("beforeCreate", (tenant, options) => {
    tenant.password = bcrypt.hashSync(tenant.password, 8);
  });
  return Tenant;
};
