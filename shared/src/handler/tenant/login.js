const { loadSequelize } = require("../../models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = process.env.SECRET_KEY;

let db = null;
let response;

exports.login = async function (event, callback) {
  // re-use the sequelize instance across invocations to improve performance
  if (!db) {
    db = await loadSequelize();
  } else {
    // restart connection pool to ensure connections are not re-used across invocations
    db.sequelize.connectionManager.initPools();

    // restore `getConnection()` if it has been overwritten by `close()`
    if (db.sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete db.sequelize.connectionManager.getConnection;
    }
  }

  try {
    console.log(key);
    const { Tenant } = db.sequelize.models;
    const { email, password } = JSON.parse(event.body);

    const tenant = await Tenant.findOne({ where: { email } });
    if (!tenant) {
      throw { message: "Invalid email/password" };
    }
    const comparePassword = (password, hashedPassword) =>
      bcrypt.compareSync(password, hashedPassword);

    const passwordValidation = comparePassword(password, tenant.password);

    if (!passwordValidation) {
      throw { message: "invalid email/password" };
    }
    const payload = {
      id: tenant.id,
      name: tenant.tenant_name,
    };
    const token = jwt.sign(payload, key);

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify({ token }),
    };

    return response;
  } catch (err) {
    response = {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(err),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};
