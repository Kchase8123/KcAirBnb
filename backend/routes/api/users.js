// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User, Spot } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
    check('email')
      .isEmail()
      .withMessage("Invalid email")
      .bail()
      .custom(async (value) => {
        const user = await User.findOne({where: {email: value}});
        if (user){
          throw new Error("User with that email already exists");
        }
      }),
    check('username')
      .exists({ checkFalsy: true })
      .withMessage("Username is required")
      .bail()
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.')
      .bail()
      .custom(async (value) => {
        const user = await User.findOne({where: {username: value}});
        if (user){
          throw new Error("User with that username already exists")
        }
      }),
    check("firstName")
      .exists({ checkFalsy: true })
      .withMessage("First Name is required"),
    check("lastName")
      .exists({ checkFalsy: true})
      .withMessage("Last Name is required"),
    check('password')
      .exists({ checkFalsy: true })
      .withMessage("Password is required")
      .bail()
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];


  // Sign up
router.post('/', validateSignup, async (req, res) => {
      const { email, firstName, lastName, password, username } = req.body;
      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ email, firstName, lastName, username, hashedPassword });

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };

      await setTokenCookie(res, safeUser);

      res.status(201);
      return res.json({
        user: safeUser
      });
    }
  );

  // GET /api/require-auth
// const { requireAuth } = require('../../utils/auth.js');
// router.get('/require-auth',requireAuth,(req, res) => {
//     return res.json(req.user);
//   }
// );





module.exports = router;
