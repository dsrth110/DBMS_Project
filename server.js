//importing dependencies
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');

//path for establishing database connection
const db = require('./utility/database');

//declaring express instance
const server = express();

server.use(cors({
  origin: '*',//specific orgin can also be used
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: '*'
}));

server.use(bodyParser.urlencoded({extended:false}));
server.use(bodyParser.json());

const user_ko_secretKey = crypto.randomBytes(32).toString('hex');

//every request arrives here, having a look into it
server.use((rqst, rspn, next)=> {
    console.log('Request has arrived');
    console.log(rqst.body);
    next();
});

//register new user - sign>up
server.post('/api/signup', async(rqst,rspn) => {
    const { Id, Name, Department, Batch, Password} = rqst.body;

    try {
        
        const [existingUser] = await db.execute('SELECT * FROM customer_info WHERE id = ?', [Id]); // ANDing with 'Name' leads to possible duplications
        if (existingUser.length > 0){
            return rspn.status(409).json({success:false, message: 'Duplication: Unable to sign-up'});
        }

        const hashPass = await bcrypt.hash(Password, 10);
        console.log(hashPass);


        await db.execute('INSERT INTO customer_info (id, name, department,batch,available_balance, role) VALUES (?,?,?,?,?,?)', [Id,Name,Department,Batch, 0, 'customer']);
        await db.execute('INSERT INTO users(id, hashed_password) VALUES (?,?)', [Id, hashPass]);
        const [result] = await db.execute('SELECT LAST_INSERT_ID() as id');
        const [Fuser] = result;         

        const token = jwt.sign({Id: Fuser.id, Name: Fuser.name, Role:'customer'}, 'user_ko_secretKey');

        rspn.status(201).json({
            success:true,
            message: 'Signed Up Successfully',
            Id: Fuser.id, Balance: Fuser.available_balance,
            token: token,
            isAdmin: false});
        console.log(result);

    }catch(err){
        console.error('Error registering user: ', err);
        rspn.status(500).json({success:false, message: 'Unable to sign-up'});
    }
});

//existing user - sign>in
server.post('/api/signin', async(rqst, rspn) => {
    const {Id, Password} = rqst.body;
    
    db.execute('SELECT * FROM users WHERE id = ?', [Id])
    .then(result =>{
        const [refresult]= result
        const [Fuser] = refresult;

        if(refresult.length === 0){  //at least an object is returned every time so makes no sense
            return rspn.status(401).json({success: false, error: 'User not found'});
        }
        bcrypt.compare(Password, Fuser.hashed_password, async(err, isMatch) => {
            if (err){
                return rspn.status(500).json({success: false, error: 'Verification failed'});
            }
    
            if(!isMatch){
                return rspn.status(401).json({success: false, error: 'Invalid Credentials'});
            }

            let isAdmin = false;
            let UData;
    
            await db.execute('SELECT * FROM customer_info WHERE id = ?', [Id])
            .then(result =>{
                const [Fcusts] = result;
                if (Fcusts.length === 1) {
                    [UData] = Fcusts;
                }
            })
            .catch(err => {
                console.log(err);
                rspn.status(500).json({success: false, error: 'Error fetching data'});
            });

            await db.execute('SELECT * FROM admin_info WHERE id = ?', [Id])
            .then(result =>{
                const [Fadms] = result;
                if (Fadms.length === 1) {
                   [UData] = Fadms;
                    isAdmin = true;
                }
            })
            .catch(err => {
                console.log(err);
                rspn.status(500).json({success: false, error: 'Error fetching data'});
            });
            
            console.log(UData);
            const token = jwt.sign({Id: Id, Name: UData.name, Role: UData.role}, 'user_ko_secretKey');

            rspn.status(201).json({
                success:true,
                message: 'Signed Up Successfully',
                token: token,
                balance: UData.available_balance,
                isAdmin: isAdmin});
        } );
    })
    .catch(err => {
        console.log(err);
        rspn.status(500).json({success: false, error: 'Error fetching data'});
    });

});

//hosiyari from unauthenticated access
const authenticateToken= (rqst, rspn, next)=>{
    const {token} = rqst.body;

    if (!token){
        return rspn.status(401).json({success: false, error: 'Unauthorized: Token not found'});
    }

    jwt.verify(token, 'user_ko_secretKey', (err, user)=>{
        if (err){
            return rspn.status(403).json({success: false, error: 'Forbidden: Invalid Token'});
        }
        rqst.user = user;
        next();
    });
};

server.post('/api/userdetails',authenticateToken,async(rqst, rspn) => {
    try{        
        const [result] = await db.execute('SELECT * FROM customer_info');
    const [Fuser] = result;         
        rspn.json({success: false, data: result});
      } catch (err) {
        console.error('Error fetching items:', err);
        rspn.status(500).json({ success: false, error: 'Error finding items' });
      }
    });

//Search
server.post('/api/search', async (rqst, rspn) => {
try{
  const { keyword, category } = rqst.body;
    const [items] = await db.execute('SELECT * FROM items WHERE item_name LIKE ? AND category = ?', [`%${keyword}%`, category]);
    rspn.json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching items:', err);
    rspn.status(500).json({ success: false, error: 'Error finding items' });
  }
});

//Fetch an item
server.post('/api/fetch_item', async (rqst, rspn) => {
    try {
      const [items] = await db.execute('SELECT * FROM items');
      rspn.json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching items:', error);
      rspn.status(500).json({ success: false, message: 'Error while fetching items' });
    }
  }); 

//Adding an item
server.post('/api/add_item', async (rqst, rspn) => {
  const { item_id, item_name, image, category, price } = rqst.body;

  try {
    await db.execute('INSERT INTO items (item_id, item_name, image, category, price, quantity) VALUES (?, ?, ?, ?, ?, ?)', [item_id, item_name, image, category, price,0]);
    rspn.json({ success: true, message: 'Item Added Successfully' });
  } catch (error) {
    console.error('Error adding item:', error);
    rspn.status(500).json({ success: false, message: 'Error adding item' });
  }
});

//Update an item
server.put('/api/update_item', async (rqst, rspn) => {
  const { item_id, item_name, image, category, price, quantity} = rqst.body;

  try {
    await db.execute('UPDATE items SET item_name= ?, image= ?, category= ?, price= ?, quantity=? WHERE item_id=?', [item_name, image, category, price, quantity, item_id]);

    rspn.json({ success: true, message: 'Item updated Successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    rspn.status(500).json({ success: false, message: 'Error while updating item' });
  }
});

//Delete an item
server.delete('/api/delete_item', async (rqst, rspn) => {
  const { item_id } = rqst.body;

  try {
    await db.execute('DELETE FROM items WHERE item_id = ?', [item_id]);
    rspn.json({ success: true, message: 'Item deleted Successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    rspn.status(500).json({ success: false, message: 'Error while deleting item' });
  }
});


//Buy item
server.post('/api/buy',authenticateToken, async (rqst, rspn) => {
  const { token, item_id } = rqst.body;

  try {
    let decodedToken;
    try {
        decodedToken = jwt.verify(token,'user_ko_secretKey')
        console.log(decodedToken);
      }catch(err){
        console.error('Error decoding token', err);
        rspn.json({success: false, message: "Error decoding token "});
      }
    const [user] = await db.execute('SELECT * FROM customer_info WHERE id = ?', [decodedToken.Id]);
    const [item] = await db.execute('SELECT * FROM items WHERE item_id = ?', [item_id]);
    const [Fuser]= user;
    const Fitem = item[0]; 
    console.log(Fuser);
    console.log(Fitem);

    //see if the available balance is sufficient
    if (Fuser.available_balance >= Fitem.price) {
      const updated_balance = Fuser.available_balance - Fitem.price;
      db.execute('UPDATE customer_info SET available_balance= ? WHERE id= ?',[updated_balance,Fuser.id])
      .then(result =>{
        rspn.status(200).json({success: true, available_balance: updated_balance});
      })
      .catch(err  => {
        console.log(err);
        rspn.status(500).json({success: false, error: 'Error fetching data'});
    });
    } else {
      rspn.json({ success: false, message: 'Insufficient balance' });
    }
  } catch (err) {
    console.error('Error buying item:', err);
    rspn.status(500).json({ success: false, message: 'Error while buying item' });
  }
});

//Load balance
server.post('/api/load_balance',authenticateToken, async (rqst, rspn) => {
  const { token, amount } = rqst.body;
  try {
    let decodedToken;
    try {
        decodedToken = jwt.verify(token,'user_ko_secretKey')
        console.log(decodedToken);
      }catch(err){
        console.error('Error decoding token', err);
        rspn.json({success: false, message:" Error decoding token"});
      }
      db.execute('UPDATE customer_info SET available_balance= available_balance + ? WHERE id= ?',[amount,decodedToken.Id])
      .then(result =>{
        rspn.status(200).json({success:true});
      })
      .catch(err  => {
        console.log(err);
        rspn.status(500).json({success: false, error: 'Error fetching data'});
    });
  } catch (err) {
    console.error('Error loading balance:', err);
    rspn.status(500).json({ success: false, message: 'Error while buying item' });
  }});

server.use((rqst, rspn, next)=>{
    rspn.status(404).json({success: false, message: 'Page not found'});
});
 
server.listen(5000, ()=>{
    console.log("Server is listening at port no 5000.");
});
