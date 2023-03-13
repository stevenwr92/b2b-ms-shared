const { loadSequelize } = require("../../models/index");

let db = null;
let response;
exports.createRole = async function (event, callback) {
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
  console.log(event.body);
  try {
    const { GroupRole, RolePolicy } = db.sequelize.models;
    const body = JSON.parse(event.body);
    transaction = await db.sequelize.transaction();

    const addRole = {
      GroupId: body.GroupId,
      role_name: body.role_name,
      role_level: body.role_level,
    };
    console.log(body);
    console.log(addRole);
    let newGroupRole = await GroupRole.create(addRole, { transaction });

    const policy = {
      approval_topup: body.approval_topup,
      approval_expense: body.approval_expense,
      approval_prebudget: body.approval_prebudget,
      manage_budget: body.manage_budget,
      GroupRoleId: newGroupRole.id,
    };

    await RolePolicy.create(policy, { transaction });

    await transaction.commit();

    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(
        `Success create GroupRole ${newGroupRole.role_name}.`
      ),
    };
    return response;
  } catch (err) {
    await transaction.rollback();
    console.log(err);
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
