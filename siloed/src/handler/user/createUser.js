const { loadSequelize } = require("../../models/index");
let db;

let response;
exports.createUser = async function (event, callback) {
  // re-use the sequelize instance across invocations to improve performance
  if (!db) {
    const tenant = event.requestContext.authorizer.name
      .toLowerCase()
      .replace(" ", "-");
    console.log(tenant);
    db = await loadSequelize(tenant);
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
    const { User, UserDetail } = db.sequelize.models;
    transaction = await db.sequelize.transaction();
    const id = +event.requestContext.authorizer.principalId;
    const body = JSON.parse(event.body);
    // let bodyUser = {
    //   username: body.username,
    //   email: body.email,
    //   password: body.password,
    //   phonenumber: body.phonenumber,
    //   access_pin: body.access_pin,
    //   TenantId: id,
    // };
    // let newUser = await Tenant.create(bodyUser);

    let bodyUserSiloed = {
      username: body.username,
      email: body.email,
      password: body.password,
      phonenumber: body.phonenumber,
      access_pin: body.access_pin,
    };

    let newUserSiloed = await User.create(bodyUserSiloed, { transaction });

    let userDetail = {
      first_name: body.first_name,
      last_name: body.last_name,
      birth_date: body.birth_date,
      gender: body.gender,
      citizen_id_number: body.citizen_id_number,
      profile_picture: "",
      UserId: newUserSiloed.id,
    };

    let newUserDetail = await UserDetail.create(userDetail, { transaction });

    await transaction.commit();
    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(
        `Success Added ${newUserSiloed.username} to your System.`
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
