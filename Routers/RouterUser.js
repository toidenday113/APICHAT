const ControllerUser = require('../Controllers/UsersController');
const express = require('express');

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end("ResTful API Chat v1.0");
    });

    // Router Login
    app.post("/login", ControllerUser.login);

    //Router Logout
    app.post("/signup", ControllerUser.create);

    //Router profile
    app.get('/user/profile',isLoggedIn, ControllerUser.me);

    //Router delete
    app.delete('user/delete', isLoggedIn, ControllerUser.delete);

    app.post("/user/update", isLoggedIn, ControllerUser.update);

    //Router Logout
    app.post('/logout',(req, res) =>{
        req.logout();
        res.end('Logged out')
    });
};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
       return next();
    }
    res.end("Not logged in");
}
