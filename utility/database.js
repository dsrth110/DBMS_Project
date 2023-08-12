const mysql= require("mysql2");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'Canteen',
    password: ''
});

//to display the error
pool.getConnection( (err, connection)=> {
    if (err) throw (err)
    console.log ("Database Connection Succesful: " + connection.threadId)
})

module.exports= pool.promise();