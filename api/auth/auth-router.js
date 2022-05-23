// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../users/users-model')
const {
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree
  } = require('./auth-middleware')
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post('/register', checkUsernameFree, checkPasswordLength, (req, res, next)=>{
  //res.json('register')
  const {username, password} = req.body
  //we must hash password so not saved as plain text in database in case of leaks
  const hash = bcrypt.hashSync(password, 8) //2^8
  //now we can store, then if u check user add it returns the id and username
  User.add({username, password: hash})
    .then(saved =>{
      res.status(201).json(saved)
    })
    .catch(next)
})

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post('/login', checkUsernameExists, (req, res, next)=>{
  const {password} = req.body
  //we need to compare the password with the hash to the database to see if it matches bycrypt we are comparing the password typed w/ database password (req.user)
  if(bcrypt.compareSync(password, req.user.password)){
    //make it so cookie is set on client and server stores a session with session id
    req.session.user = req.user
    next({
      status: 200,
      message: `Welcome ${req.user.username}`
    })
  } else{
    //this invalid is refering to password, the middleware refers to username
    next({
      status: 401,
      message: 'Invalid credentials'
    })
  }
})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

router.get('/logout', (req, res, next)=>{
  //res.json('logout')
  if(req.session.user){
    req.session.destroy(err => {
      if(err){
        next(err)
      } else {
        next({
          status: 200, 
          message: "logged out"
        })
      }
    }) 
  } else {
    next({
      status: 200,
      message: "no session",
    })
  }
})
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router