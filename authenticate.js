const crypto = require("crypto");

const Question = require("./models/Question");
const User = require("./models/User");

const tokenSecret = process.env.JWT_SECRET || "assignment-3-user-authentication";

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  return Buffer.from(base64 + padding, "base64").toString("utf8");
}

function createSignature(unsignedToken) {
  return base64UrlEncode(
    crypto.createHmac("sha256", tokenSecret).update(unsignedToken).digest()
  );
}

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/* payload user
→ encode header
→ encode body
→ ghép header.body
→ ký chữ ký bằng createSignature()
→ trả token dạng header.body.signature
*/
function signToken(payload) {
  const header = base64UrlEncode(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    })
  );
  const body = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${header}.${body}`;

  return `${unsignedToken}.${createSignature(unsignedToken)}`;
}

function verifyToken(token) {
  const parts = String(token || "").split(".");

  if (parts.length !== 3) { //header.body.signature
    throw createError(401, "Invalid token");
  }

  const unsignedToken = `${parts[0]}.${parts[1]}`;
  const expectedSignature = createSignature(unsignedToken);

  if (parts[2] !== expectedSignature) {
    throw createError(401, "Invalid token");
  }

  let payload;

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    throw createError(401, "Invalid token");
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw createError(401, "Token expired");
  }

  return payload;
}

function getToken(user) {
  return signToken({
    _id: user._id.toString(),
    username: user.username,
    admin: user.admin,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
}

async function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const body = req.body || {};
    const query = req.query || {};
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : body.token || query.token;

    if (!token) {
      return next(createError(401, "No token provided"));
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload._id);

    if (!user) {
      return next(createError(401, "User not found"));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function verifyAdmin(req, res, next) {
  if (req.user && req.user.admin) {
    return next();
  }

  return next(
    createError(403, "You are not authorized to perform this operation!")
  );
}

async function verifyAuthor(req, res, next) {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return next(createError(404, "Question not found"));
    }

    if (
      question.author &&
      question.author.toString() === req.user._id.toString()
    ) {
      req.question = question;
      return next();
    }

    return next(createError(403, "You are not the author of this question"));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getToken,
  verifyAdmin,
  verifyAuthor,
  verifyUser,
};
