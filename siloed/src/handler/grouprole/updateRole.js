const { loadSequelize } = require("../../models/index");

let db = null;
let response;
exports.updateRole = async function (event, callback) {
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
    const { GroupRole, RolePolicy } = db.sequelize.models;
    // const body = JSON.parse(event.body);
    const id = event.pathParameters.id;
    // transaction = await db.sequelize.transaction();

    const Group = await GroupRole.findByPk(id, { include: RolePolicy });
    if (!Group) throw { name: `NotFound` };

    const editRole = {
      GroupId: body.GroupId,
      role_name: body.role_name,
      role_level: body.role_level,
    };
    
    // let updateGroupRole = await GroupRole.update(
    //   addRole,
    //   { where: { id } },
    //   { transaction }
    // );
    // const policyBody = {
    //   approval_topup: body.approval_topup,
    //   approval_expense: body.approval_expense,
    //   approval_prebudget: body.approval_prebudget,
    //   manage_budget: body.manage_budget,
    //   GroupRoleId: updateGroupRole.id,
    // };

    // await RolePolicy.update(policy, { transaction });

    // await transaction.commit();

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify(`Success edit GroupRole ${Group}.`),
    };
    return response;
  } catch (err) {
    // await transaction.rollback();
    if (err.name == "NotFound") {
      response = {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT",
        },
        body: JSON.stringify("Group Role Not Found"),
      };
    } else {
      response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT",
        },
        body: JSON.stringify(err.errors[0].message),
      };
    }
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};
