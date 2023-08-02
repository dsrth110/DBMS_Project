const express = require('express');
const adminrouter = express.Router();

adminrouter.get('/home/administrator',()=>{
    console.log('In admin\'s portal, signing up');
});

  module.exports = adminrouter;