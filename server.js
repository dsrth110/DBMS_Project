//importing dependencies
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
//uninstall dotenv

//path for establishing database connection
const db = require('./utility/database');

//paths for routing purposes
const customerRoute = require('./router/customer');
const adminRoute = require('./router/admin');
 
//declaring express instance
const server = express();

//What is the use of these lines?
server.use(bodyParser.urlencoded({extended:false}));
server.use(bodyParser.json());

//session
server.use(session({
    secret : 'userko-secret-key',
    resave : false,
    saveUninitialized : true,
}));

//every request arrives here, have a little look into it
server.use((rqst, rspn, next)=> {
    console.log('Request has arrived');
    console.log(rqst.body);
    next();
});

//register new user - sign>up
server.post('/signup', async(rqst,rspn) => {
    const { Name, Password, PhoneNo, Role} = rqst.body;

    try {
        
        const [existingUser] = await db.execute('SELECT * FROM Users WHERE UserPhoneNo = ? OR UserName = ?', [PhoneNo, Name]); // ANDing with 'Name' leads to possible duplications

        if (existingUser.length > 0){
            return rspn.status(409).json({error: 'Duplication'});
        }

        const hashPass = await bcrypt.hash(Password, 10);
        console.log(hashPass);


        await db.execute('INSERT INTO Users (UserName, UserPhoneNo, UserRole, HashedPassword) VALUES (?,?,?,?)', [Name, PhoneNo, Role, hashPass]);

        const [result] = await db.execute('SELECT LAST_INSERT_ID() as UserId');
        const UserId = result[0].UserId;

        rspn.status(201).json({message: 'Signed Up', ID: UserId});
        console.log(result);

    }catch(err){
        console.error('Error registering user: ', err);
        rspn.status(500).json({error: 'Unable to Sign Up'});
    }
});


//existing user - sign>in
server.post('/signin', async(rqst, rspn) => {
    const {Name, Password} = rqst.body;
    
    db.execute('SELECT * FROM Users WHERE UserName = ?', [Name])
    .then(result =>{
        console.log(result);

        if(result[0].length === 0){  //at least an object is returned every time so makes no sense
            return rspn.status(401).json({error: 'User not found'});
        }

        const [Fuser] = result[0];

        bcrypt.compare(Password, Fuser.HashedPassword, (err, isMatch) => {
            if (err){
                return rspn.status(500).json({error: 'Verification failed'});
            }
    
            if(!isMatch){
                return rspn.status(401).json({error: 'Invalid Credentials'});
            }
    
            const token = jwt.sign({Name: Fuser.UserName, role: Fuser.UserRole}, 'userko-secret-key');
            rqst.session.token = token;
    
            rspn.status(201).json({message: 'Signed In', token: token});
        } );
    })
    .catch(err => {
        console.log(err);
        rspn.status(500).json({error: 'Error fetching data'});
    });

});

//hosiyari from unauthenticated access
const authenticateToken= (rqst, rspn, next)=>{
    const token = rqst.session.token;

    if (!token){
        return rspn.status(401).json({error: 'Unauthorized: Token not found'});
    }

    jwt.verify(token, 'userko-secret-key', (err, user)=>{
        if (err){
            return rspn.status(403).json({error: 'Forbidden: Invalid Token'});
        }
        rqst.user = user;
        next();
    });
};

server.use(customerRoute);
server.use(adminRoute);

server.use((rqst, rspn, next)=>{
    rspn.status(404).json();
});
 
server.listen(5000, ()=>{
    console.log("Server is listening at port no 5000.");
});
