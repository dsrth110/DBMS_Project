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

//register new customer - sign>up
server.post('/api/signup', async(rqst,rspn) => {
    const { Id, Name, Department, Batch, Password} = rqst.body;

    try {
        
        let [existingUser] = await db.execute('SELECT * FROM customer_info WHERE id = ?', [Id]); // ANDing with 'Name' leads to possible duplications
        if (existingUser.length > 0){
            return rspn.json({success:false, message: 'Duplication: Unable to sign-up'});
        }
        [existingUser] = await db.execute('SELECT * FROM users WHERE id = ?', [Id]); 
                if (existingUser.length > 0){
            return rspn.json({success:false, message: 'Duplication: Unable to sign-up'});
        }


        const hashPass = await bcrypt.hash(Password, 10);
        console.log(hashPass);


        await db.execute('INSERT INTO customer_info (id, name, department,batch,available_balance) VALUES (?,?,?,?,?)', [Id,Name,Department,Batch, 0]);
        const [result] = await db.execute('SELECT * FROM customer_info ORDER BY update_time DESC LIMIT 1');
        await db.execute('INSERT INTO users(id, hashed_password, role) VALUES (?,?,?)', [Id, hashPass, 'customer']);
        const [Fuser] = result;         

        const token = jwt.sign({Id: Fuser.id, Name: Fuser.name, Role:'customer'}, 'user_ko_secretKey');

        rspn.json({
            success:true,
            message: 'Customer Signed Up Successfully',
            Id: Fuser.id,
            Id: Fuser.name,
            Balance: Fuser.available_balance,
            token: token,
            isAdmin: false});
        console.log(result);

    }catch(err){
        console.error('Error registering user: ', err);
        rspn.json({success:false, message: 'Unable to sign-up'});
    }
});

//register new admin - sign>up
server.post('/api/admin/register',authenticateToken ,async(rqst,rspn) => {
  const { Id, Name, Address, Phone, Password} = rqst.body;

  try {
      
      let [existingUser] = await db.execute('SELECT * FROM admin_info WHERE id = ?', [Id]); // ANDing with 'Name' leads to possible duplications
      if (existingUser.length > 0){
          return rspn.json({success:false, message: 'Duplication: Unable to sign-up'});
      }

      [existingUser] = await db.execute('SELECT * FROM users WHERE id = ?', [Id]); 
      if (existingUser.length > 0){
        return rspn.json({success:false, message: 'Duplication: Unable to sign-up'});
      }


      const hashPass = await bcrypt.hash(Password, 10);
      console.log(hashPass);


      await db.execute('INSERT INTO admin_info (id, name, address,phone) VALUES (?,?,?,?)', [Id,Name,Address,Phone]);
      const [result] = await db.execute('SELECT * FROM admin_info ORDER BY update_time DESC LIMIT 1');
      await db.execute('INSERT INTO users(id, hashed_password, role) VALUES (?,?,?)', [Id, hashPass, 'admin']);
      const [Fuser] = result;   
      console.log(Fuser);      

      const token = jwt.sign({Id: Fuser.id, Name: Fuser.name, Role:'admin'}, 'user_ko_secretKey');

      rspn.json({
          success:true,
          message: 'Admin Signed Up Successfully',
          Id: Fuser.id,
          Name: Fuser.name,
          Address: Fuser.address,
          Phone: Fuser.phone,
          isAdmin: true});

  }catch(err){
      console.error('Error registering user: ', err);
      rspn.json({success:false, message: 'Unable to sign-up'});
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
            return rspn.json({success: false, error: 'User not found'});
        }
        bcrypt.compare(Password, Fuser.hashed_password, async(err, isMatch) => {
            if (err){
                return rspn.json({success: false, error: 'Verification failed'});
            }
    
            if(!isMatch){
                return rspn.json({success: false, error: 'Invalid Credentials'});
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
                rspn.json({success: false, error: 'Error fetching data'});
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
                rspn.json({success: false, error: 'Error fetching data'});
            });
            
            console.log(UData);
            const token = jwt.sign({Id: Id, Name: UData.name, Role: UData.role}, 'user_ko_secretKey');

            rspn.json({
                success:true,
                message: 'Signed In Successfully',
                token: token,
                balance: UData.available_balance,
                isAdmin: isAdmin});
        } );
    })
    .catch(err => {
        console.log(err);
        rspn.json({success: false, error: 'Error fetching data'});
    });

});

//hosiyari from unauthenticated access
const authenticateToken= (rqst, rspn, next)=>{
    const {token} = rqst.body;

    if (!token){
        return rspn.json({success: false, error: 'Unauthorized: Token not found'});
    }

    jwt.verify(token, 'user_ko_secretKey', (err, user)=>{
        if (err){
            return rspn.json({success: false, error: 'Forbidden: Invalid Token'});
        }
        rqst.user = user;
        next();
    });
};

server.put('/api/userdetails',authenticateToken,async(rqst, rspn) => {
    try{        
        const [result] = await db.execute('SELECT * FROM customer_info');
    const [Fuser] = result;         
        rspn.json({success: false, data: result});
      } catch (err) {
        console.error('Error fetching items:', err);
        rspn.json({ success: false, error: 'Error finding items' });
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
    rspn.json({ success: false, error: 'Error finding items' });
  }
});

//Fetch an item
server.put('/api/fetch_item', async (rqst, rspn) => {
    try {
      const [items] = await db.execute('SELECT * FROM items');
      rspn.json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching items:', error);
      rspn.json({ success: false, message: 'Error while fetching items' });
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
    rspn.json({ success: false, message: 'Error adding item' });
  }
});

//Update an item
server.post('/api/update_item', async (rqst, rspn) => {
  const { item_id, item_name, image, category, price, quantity} = rqst.body;

  try {
    await db.execute('UPDATE items SET item_name= ?, image= ?, category= ?, price= ?, quantity=? WHERE item_id=?', [item_name, image, category, price, quantity, item_id]);

    rspn.json({ success: true, message: 'Item updated Successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    rspn.json({ success: false, message: 'Error while updating item' });
  }
});


//Delete an item
server.post('/api/delete_item', async (rqst, rspn) => {
  const { item_id } = rqst.body;

  try {
    await db.execute('DELETE FROM items WHERE item_id = ?', [item_id]);
    rspn.json({ success: true, message: 'Item deleted Successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    rspn.json({ success: false, message: 'Error while deleting item' });
  }
});

//Placing an order
server.post('/api/place_order', async (rqst, rspn) => {
  const { UserId, ItemId, Quantity } = rqst.body;

  try {
    let [result] = await db.execute('SELECT price FROM items WHERE item_id = ?', [ItemId]);
    [Fitem] = result;
    const TotalPrice = Quantity* Fitem.price;
    await db.execute('INSERT INTO order_details (id, item_id, quantity, total_price) VALUES (?, ?, ?, ?)', [UserId,ItemId, Quantity, TotalPrice]);
    [result] = await db.execute('SELECT * FROM order_details ORDER BY update_time DESC LIMIT 1');
    [Fitem] = result;
    rspn.json({ success: true, message: 'Order placed Successfully', order_id: Fitem.order_id, TotalPrice: Fitem.total_price});
  } catch (error) {
    console.error('Error adding item:', error);
    rspn.json({ success: false, message: 'Error placing order' });
  }
});

//Update an order
server.post('/api/update_order', async (rqst, rspn) => {
  const {order_id, Quantity} = rqst.body;

  try {
    let [result] = await db.execute('SELECT item_id FROM order_details WHERE order_id = ?', [order_id]);
    [result] = await db.execute('SELECT price FROM items WHERE item_id = ?', [result[0].item_id]);

    [Fitem] = result;
    const TotalPrice = Quantity* Fitem.price;
    await db.execute('UPDATE order_details SET quantity= ?,total_price = ? WHERE order_id=?', [Quantity, TotalPrice, order_id]);
    [result] = await db.execute('SELECT * FROM order_details ORDER BY update_time DESC LIMIT 1');
    [Fitem] = result;
    rspn.json({ success: true, message: 'Order updated Successfully', TotalPrice: Fitem.total_price});
  } catch (error) {
    console.error('Error updating item:', error);
    rspn.json({ success: false, message: 'Error updating order' });
  }
});

//Cancel an order
server.post('/api/cancel_order', async (rqst, rspn) => {
  const { order_id } = rqst.body;

  try {
    await db.execute('DELETE FROM order_details WHERE order_id = ?', [order_id]);
    rspn.json({ success: true, message: 'Order Cancelled Successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    rspn.json({ success: false, message: 'Error cancelling order' });
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
        rspn.json({success: true, available_balance: updated_balance});
      })
      .catch(err  => {
        console.log(err);
        rspn.json({success: false, error: 'Error fetching data'});
    });
    } else {
      rspn.json({ success: false, message: 'Insufficient balance' });
    }
  } catch (err) {
    console.error('Error buying item:', err);
    rspn.json({ success: false, message: 'Error while buying item' });
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
        rspn.json({success:true});
      })
      .catch(err  => {
        console.log(err);
        rspn.json({success: false, error: 'Error fetching data'});
    });
  } catch (err) {
    console.error('Error loading balance:', err);
    rspn.json({ success: false, message: 'Error while buying item' });
  }});

server.use((rqst, rspn, next)=>{
    rspn.json({success: false, message: 'Page not found'});
});
 
server.listen(5000, ()=>{
    console.log("Server is listening at port no 5000.");
});
