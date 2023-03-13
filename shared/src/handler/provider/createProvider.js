const { loadSequelize } = require("../../models/index");

let db = null;
let response;
exports.createProvider = async function (event, callback) {
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
    const { Provider } = db.sequelize.models;
    const body = JSON.parse(event.body);
    let bodyProvider = {
      name: body.name,
      email: body.email,
      password: body.password,
    };

    let newProvider = await Provider.create(bodyProvider);

    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(`Success Added ${newProvider.name} to our System.`),
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
      body: JSON.stringify(err.errors[0].message),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};
