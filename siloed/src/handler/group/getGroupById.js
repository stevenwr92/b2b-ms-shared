const { loadSequelize } = require("../../models/index");

let db = null;

exports.findOne = async function (event, callback) {
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
    let response;
    const { Group, User, GroupRole, RolePolicy } = db.sequelize.models;
    const id = event.pathParameters.id;
    let data = await Group.findByPk(id, {
      // include: { all: true, nested: true },
      include: {
        model: GroupRole,
        include: [User, RolePolicy],
      },
    });
    console.log(data);
    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify(data),
    };

    return response;
  } catch (err) {
    response = {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
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
