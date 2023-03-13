const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const db = {};
const TENANT_NAME = process.env.TENANT_NAME;
async function loadSequelize(database, host) {
  const sequelize = new Sequelize("postgres", "postgres", "postgres", {
    host: `${TENANT_NAME}.cry4cich1xjp.ap-southeast-3.rds.amazonaws.com`,
    dialect: "postgres",
    pool: {
      max: 2,
      min: 0,
      idle: 0,
      acquire: 3000,
      evict: 6,
    },
  });

  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      const model = require(path.join(__dirname, file))(
        sequelize,
        Sequelize.DataTypes
      );
      db[model.name] = model;
    });

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;

  await db.sequelize.sync({ alter: true });
  return db;
}

module.exports = { loadSequelize };
