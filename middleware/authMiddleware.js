const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const protected = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decodedToken._id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Non autorisé, le token a échoué");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Non autorisé, pas de token");
  }

  // try {
  //   const token = req.headers.authorization.split(" ")[1];
  //   const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  //   const userId = decodedToken._id;

  //   if (req.body._id && req.body._id !== userId) {
  //     res.status(401);
  //     throw new Error("Utilisateur non valide");
  //   } else {
  //     next();
  //   }
  // } catch (error) {
  //   res.status(401);
  //   throw new Error("Requête non authentifiée");
  // }
});

module.exports = { protected };
