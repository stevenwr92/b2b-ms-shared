const { loadSequelize } = require("../../models/index");
const axios = require("axios");

let db = null;
let response;

let provision = async (name) => {
  try {
    let data = await axios.get(
      `http://ec2-108-136-165-114.ap-southeast-3.compute.amazonaws.com:8080/job/tenant_provisioning/buildWithParameters?token=1234&name=${name}`
    );
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.createTenant = async function (event, callback) {
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
  let transaction;
  try {
    const { Tenant, TenantDetail, Subscription } = db.sequelize.models;
    const body = JSON.parse(event.body);
    transaction = await db.sequelize.transaction();
    let bodyTenant = {
      tenant_name: body.tenant_name,
      is_activated: true,
      email: body.email,
      password: body.password,
    };

    let newTenant = await Tenant.create(bodyTenant, { transaction });
    console.log(process.env);
    let bodyDetail = {
      company_name: body.company_name,
      country: body.country,
      industry: body.industry,
      company_size: body.company_size,
      TenantId: newTenant.id,
    };
    let newTenantDetail = await TenantDetail.create(bodyDetail, {
      transaction,
    });

    await transaction.commit();

    let name = newTenant.tenant_name.toLowerCase().replaceAll(" ", "-");

    // await provision(name);
    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(
        `Success Added ${newTenant.tenant_name} to our System.`
      ),
    };
    return response;
  } catch (err) {
    console.log(err);
    await transaction.rollback();
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
