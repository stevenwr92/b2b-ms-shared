const { loadSequelize } = require("../../models/index");

let db = null;
let response;
exports.addMember = async function (event, callback) {
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
    const { User, GroupRole, RolePolicy } = db.sequelize.models;
    transaction = await db.sequelize.transaction();
    const body = JSON.parse(event.body);
    const id = body.id;

    const addRole = {
      GroupId: body.GroupId,
      name: body.role_name,
      UserId: id,
      role_level: body.role_level,
    };
    let newGroupRole = await GroupRole.create(addRole, { transaction });

    const addMember = {
      GroupRoleId: newGroupRole.id,
      GroupId: body.GroupId,
    };

    const policy = {
      approval_topup: body.approval_topup,
      approval_expense: body.approval_expense,
      approval_prebudget: body.approval_prebudget,
      manage_budget: body.manage_budget,
      GroupRoleId: newGroupRole.id,
    };

    await User.update(addMember, { where: { id }, transaction });
    await RolePolicy.create(policy, { transaction });

    await transaction.commit();

    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(`Success add member.`),
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
