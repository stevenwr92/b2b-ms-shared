const jwt = require("jsonwebtoken");
const key = process.env.SECRET_KEY;

exports.auth = async (event) => {
  try {
    const token = event.authorizationToken;
    if (!token) throw { name: "Unauthrorized" };
    const payload = jwt.verify(token, key);
    if (!payload) throw { name: "Unauthrorized" };
    const policy = genPolicy("allow", event.methodArn, payload);
    const principalId = `${payload.id}`;
    const response = {
      principalId: principalId,
      policyDocument: policy,
      context: {
        name: payload.name,
      },
    };
    return response;
  } catch (err) {
    if ((err = "JsonWebTokenError")) {
      const policy = genPolicy("deny", event.methodArn);
      const principalId = "aflaf78fd7afalnv";
      const context = {
        simpleAuth: true,
      };
      const response = {
        principalId: principalId,
        policyDocument: policy,
        context: context,
      };
      console.log(err);
      return response;
    } else {
      console.log(err);
      return err;
    }
  }
};

function genPolicy(effect, resource, payload) {
  const policy = {};
  policy.Version = "2012-10-17";
  policy.Statement = [];
  const stmt = {};
  stmt.Action = "execute-api:Invoke";
  stmt.Effect = effect;
  stmt.Resource = resource;
  policy.Statement.push(stmt);

  return policy;
}
