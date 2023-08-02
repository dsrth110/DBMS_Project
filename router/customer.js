const express = require('express');

const custrouter= express.Router();

custrouter.use('/home/customer',()=>{
    console.log('In customer\'s portal');
});

module.exports = custrouter;