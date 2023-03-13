const { loadSequelize } = require("../../models/index");

let db = null;
let response;
exports.editStatus = async function (event, callback) {
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
    const { Tenant } = db.sequelize.models;
    const body = JSON.parse(event.body);
    const id = event.pathParameters.id;
    let bodyTenant = {
      is_activated: body.is_activated,
    };
    let tenant = await Tenant.findByPk(id);
    if (!tenant) throw { message: "Tenant not Found" };
    let editTenant = await Tenant.update(bodyTenant, {
      where: { id },
    });

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH",
      },
      body: JSON.stringify(
        `Success Edit ${tenant.tenant_name} in our System to ${body.is_activated}.`
      ),
    };
    return response;
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 400,
      body: JSON.stringify(err),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};
