const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

//* ======================= CREATE USER =======================

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword, picture } = req.body;
  let sanitizedUsername;
  let errors = {};

  try {
    // If username is already taken
    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) errors.username = "Ce pseudo est déjà pris";

    //* If username has spaces, replace them with "_"
    // We still have to check if username already exist after removing the spaces,
    // if we don't "USER 42" and "USER_42" are going to be different at first
    // and will be added to the db as "USER_42" which will make a conflict
    if (username.includes(" ")) {
      sanitizedUsername = username.split(" ").join("_").toUpperCase();
      const usernameTaken = await User.findOne({
        username: sanitizedUsername,
      });
      if (usernameTaken) errors.username = "Ce pseudo est déjà pris";
    } else sanitizedUsername = username.toUpperCase();

    // If user already has an account with this email
    const emailExists = await User.findOne({ email });
    if (emailExists) errors.email = "Cet utilisateur existe déjà";

    // Email and username empty errors
    if (email.trim() === "") errors.email = "L'email ne doit pas être vide";
    if (username.trim() === "")
      errors.username = "Le pseudo ne doit pas être vide";

    // Password and confirm errors
    if (password !== confirmPassword) {
      errors.password = "Les mots de passe sont différents";
      errors.confirmPassword = "Les mots de passe sont différents";
    }
    if (password.trim().length < 6 && confirmPassword.trim().length < 6) {
      errors.password = "6 caractères minimum";
      errors.confirmPassword = "6 caractères minimum";
    }
    if (password.trim() === "")
      errors.password = "Le mot de passe ne doit pas être vide";
    if (!confirmPassword)
      errors.confirmPassword = "La confirmation ne doit pas être vide";

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (Object.keys(errors).length > 0) throw errors;

    // username will be uppercased and email lowercased to avoid case sensitive
    // issues and make true unique usernames despite some uppercased letters
    const user = await User.create({
      username: sanitizedUsername.toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      picture,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt,
        // the token WON'T CONTAIN THE PICTURE, which is
        // way too heavy and has made some update issues
        // it will be stored in the localstorage instead
        token: jwt.sign(
          {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        ),
      });
    } else res.status(400).json({ errors });
  } catch (error) {
    res.status(400).json({ errors });
  }
});

//* ========================= LOGIN USER =========================

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  let errors = {};

  try {
    // Connection with username OR email
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!user) errors.username = "Compte introuvable";
    if (!user) errors.email = "Compte introuvable";

    // Email and username empty errors
    if (email.trim() === "" && username.trim() === "") {
      errors.email = "L'email ne doit pas être vide";
      errors.username = "Le pseudo ne doit pas être vide";
    }

    // Password errors
    if (password.trim().length < 6) errors.password = "6 caractères minimum";
    if (password.trim() === "")
      errors.password = "Le mot de passe ne doit pas être vide";

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) errors.password = "Mot de passe incorrect";

    if (Object.keys(errors).length > 0) throw errors;

    if (user && validPassword) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt,
        // the token WON'T CONTAIN THE PICTURE, which is
        // way too heavy and has made some update issues
        // it will be stored in the localstorage instead
        token: jwt.sign(
          {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        ),
      });
      // } else throw new Error("Impossible de vous connecter");
    } else res.status(400).json({ errors });
  } catch (error) {
    res.status(400).json({ errors });
  }
});

//* ======================== UPDATE USER ========================

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword, picture } = req.body;
  const userId = req.params.id;
  let errors = {};

  try {
    // If username is already taken
    const usernameTaken = await User.findOne({ username });

    if (usernameTaken && usernameTaken.id !== userId)
      errors.username = "Ce pseudo est déjà pris";

    // Username empty error
    if (username.trim() === "")
      errors.username = "Le pseudo ne doit pas être vide";

    // Password and confirm errors
    if (password !== confirmPassword) {
      errors.password = "Les mots de passe sont différents";
      errors.confirmPassword = "Les mots de passe sont différents";
    }
    if (password.trim().length < 6 && confirmPassword.trim().length < 6) {
      errors.password = "6 caractères minimum";
      errors.confirmPassword = "6 caractères minimum";
    }
    if (password.trim() === "")
      errors.password = "Le mot de passe ne doit pas être vide";
    if (!confirmPassword)
      errors.confirmPassword = "La confirmation ne doit pas être vide";

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (Object.keys(errors).length > 0) throw errors;

    const updateOneUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        username,
        email,
        password: hashedPassword,
        picture,
      },
      { new: true }
    );

    if (updateOneUser) {
      res.status(201).json({
        _id: updateOneUser._id,
        username: updateOneUser.username,
        email: updateOneUser.email,
        picture: updateOneUser.picture,
        createdAt: updateOneUser.createdAt,
        // the token !WON'T CONTAIN THE PICTURE, which is
        // way too heavy and has made some update issues
        // it will be stored in the localstorage instead
        token: jwt.sign(
          {
            _id: updateOneUser._id,
            username: updateOneUser.username,
            email: updateOneUser.email,
            createdAt: updateOneUser.createdAt,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        ),
      });
    } else res.status(400).json({ errors });
  } catch (error) {
    res.status(400).json({ errors });
  }
});

//* ========================= CONFIRM DELETE =========================
//  =============== Check credentials before deleting ================

const confirmDelete = asyncHandler(async (req, res) => {
  const { username, email, password, token } = req.body;
  let errors = {};

  try {
    // Connection with username AND email
    const user = await User.findOne({
      $and: [{ username }, { email }],
    });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!user || decodedToken.username !== user.username)
      errors.username = "Incorrect";
    if (!user || decodedToken.email !== user.email) errors.email = "Incorrect";

    // Email and username empty errors
    if (email.trim() === "" && username.trim() === "") {
      errors.email = "L'email ne doit pas être vide";
      errors.username = "Le pseudo ne doit pas être vide";
    }

    // Password errors
    if (password.trim().length < 6) errors.password = "6 caractères minimum";
    if (password.trim() === "")
      errors.password = "Le mot de passe ne doit pas être vide";

    // Check if password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) errors.password = "Mot de passe incorrect";

    if (Object.keys(errors).length > 0) throw errors;

    if (user && validPassword) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt,
        // the token WON'T CONTAIN THE PICTURE, which is
        // way too heavy and has made some update issues
        // it will be stored in the localstorage instead
        token: jwt.sign(
          {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d",
          }
        ),
      });
      // } else throw new Error("Impossible de vous connecter");
    } else res.status(400).json({ errors });
  } catch (error) {
    res.status(400).json({ errors });
  }
});

//* ======================== DELETE USER ========================
//  ========= Delete account after checking credentials =========

const deleteUser = asyncHandler(async (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: "Utilisateur supprimé!" });
    })
    .catch((error) => res.status(400).json({ error }));
});

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  confirmDelete,
  deleteUser,
};
