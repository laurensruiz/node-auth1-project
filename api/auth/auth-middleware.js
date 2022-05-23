const User = require('../users/users-model')
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  console.log('restricted')
  next()
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  //next()
  try {
    const user = await User.findBy({username: req.body.username}) //returns a promise
    if(user.length){
      next({
        status: 422,
        message: 'Username taken'
      })
    } else {
      next()
    }
  } catch (err){
    next(err)
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  //next()
  try {
    const users = await User.findBy({username: req.body.username}) //returns a promise and an array of that user
    if(!users.length){
      next({
        status: 401,
        message: 'Invalid credentials'
      })
    } else {
      //make a req.user to equal user that we find so we can use that data to matchup later. This is user in first position since there is only one and remember we get an array
      req.user = users[0]
      next()
    }
  } catch (err){
    next(err)
  } 

  //code below could also work with check usernmae free
  // try {
  //   const users = await User.findBy({username: req.body.username})
  //   if(!users.length){
  //     next()
  //   } else {
  //     next({
  //       status: 401,
  //       message: "Invalid credentials"
  //       })
  //   }
  // } catch (err) {
  //   next(err)
  // }

}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  //next()
  const password = req.body.password
  if(!password || password.length <=3) {
    next({
        status: 422,
        message: "Password must be longer than 3 chars",
      })
  } else {
    next()
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree,
}