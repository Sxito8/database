const {request, response} = require('express');
const usermodels = require('../models/users');
const pool=require('../db');


const listUsers = async (req = request, res = response) => {
    let conn; 

    try{
        conn = await pool.getConnection();

    const users = await conn.query (usermodels.getAll, (err)=>{
        if(err){
            throw err
        }
    });

    res.json(users);
    } catch (error){
        console.log(error);
        res.status(500).json(error);
    } finally{
        if (conn) conn.end();
    }
    
}

const listUsersByID = async (req = request, res = response) => {
    

    if (isNaN(id)) {
        res.status(400).json({msg: 'Invalid ID'});
        return;
    }

    let conn; 
    try{
        conn = await pool.getConnection();

    const [user] = await conn.query (usermodels.getByID, [id], (err)=>{
        if(err){
            throw err
        }
    });

    if (!user) {
        res.status(404).json({msg: 'User not foud'});
        return;
    }
    
    
    res.json(user);
    } catch (error){
        console.log(error);
        res.status(500).json(error);
    } finally{
        if (conn) conn.end();
    }
}





const addUser =async(req = request, res= response)=>{
    let conn;
    const {
        username,
        email,
        password,
        name,
        lastname,
        phone_num ='',
        role_id,
        id_active =1,
    } = req.body;
    if (!username|| !email|| !password|| !name|| !lastname|| !role_id){
res.status(400).json({msg:'Missing informarion'});
return;
        }
        const user= [username, email, password, name, lastname, phone_num, role_id, id_active ]


    
    try {

        conn = await pool.getConnection();
        
        const [usernameUser] = await conn.query(
            usermodels.getByUsername,
            [username],
            (err) => {if (err) throw err;}
        );
        if (usernameUser){
            res.status(409).json({msg:`User with username ${username} already exists`});
            return;
        }

        const [emailUser] = await conn.query(
            usermodels.getByEmail,
            [email],
            (err) => {if (err) throw err;}
        );
        if (emailUser){
            res.status(409).json({msg:`User with email ${email} already exists`});
            return;
        }

        
        const userAdded = await conn.query(usermodels.addRow,[...user],(err)=>{

        })
        
        if (userAdded.affecteRows === 0) throw new Error ({msg:'Failed to add user'});
        res.json({msg:'User add succesfully'});
    }catch(error){
console.log(error);
res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateUser = async (req, res) => {
    const { id } = req.params;
    const userData = req.body; // Actualizamos los datos
  
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(400).json({ msg: 'No data provided for update' });
    }
  
    let conn;
    try {
      conn = await pool.getConnection();
  
      //Aqui se verifica si el usuario esta verificado
      const [existingUser] = await conn.query(usermodels.getByID, [id]);
      if (!existingUser) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Realiza las validaciones necesarias, por ejemplo, que el correo o el nombre de usuario no estén en uso
      
      if (userData.username) {
        const [existingUserByUsername] = await conn.query(
            usermodels.getByUsername,
          [userData.username]
        );
        if (existingUserByUsername && existingUserByUsername.id !== id) {
          return res.status(409).json({ msg: 'Username already in use' });
        }
      }
      if (userData.email) {
        const [existingUserByEmail] = await conn.query(
            usermodels.getByEmail,
          [userData.email]
        );
        if (existingUserByEmail && existingUserByEmail.id !== id) {
          return res.status(409).json({ msg: 'Email already in use' });
        }
      }
  
      // Realiza la actualización de los campos permitidos
      const allowedFields = ['username', 'email', 'password', 'name', 'lastname', 'phone_num', 'id_active','role_id'];
      const updateData = {};
  
      allowedFields.forEach((field) => {
        if (userData[field] !== undefined) {
          updateData[field] = userData[field];
        }
      });
  
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ msg: 'No valid fields to update' });
      }
  
      // Utiliza la consulta updateUser para realizar la actualización
      const result = await conn.query(
        usermodels.updateUser,
        [
          updateData.username,
          updateData.email,
          updateData.password, // Actualizar contraseña
          updateData.name,
          updateData.lastname,
          updateData.phone_num,
          updateData.role_id,
          updateData.id_active,
          id
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(500).json({ msg: 'Failed to update user' });
      }
  
      return res.json({ msg: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    } finally {
      if (conn) conn.end();
    }
  };




//Actualizamos la informacion 
/*const updateUser = async (req = request, res = response) => {
    const {
        username,
        email,
        password,
        name,
        lastname,
        phome_number = '',
        role_id,
        id_active = 1
    } = req.body;
    
    if (!username || !email || !password || !name || !lastname || !role_id) {
        res.status(400).json({msg: 'Missing information'});
        return
    }

    const user =[
        username, email, password, name, lastname, phome_number, role_id, id_active];

    let conn;

    try {
        conn = await pool.getConnection();

        const [usernameUser] = await conn.query(
            usermodels.getByUsername,
            [username],
            (err) => {if (err) throw err;}
        );
        if (usernameUser) {
            res.status(409).json({msg: `User with username ${username} already exists`});
            return;
        }

        const [emailUser] = await conn.query(
            usermodels.getByEmail,
            [email],
            (err) => {if (err) throw err;}
        );
        if (emailUser) {
            res.status(409).json({msg: `User with email ${email} already exists`});
            return;
        }




        const userModified = await conn.query(
            usermodels.getUpdate,
            [...user], 
            (err) => {if (err) throw err;}
        )

        if (userModified.affectedRows === 0) throw new Error ({msg: 'Failed to modify user'});
        
        res.json({msg:'User modified succesfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.end();
    }
}*/



/*const updateUser = async (req, res) => {
    const {
        id, // Agregar la ID del usuario que deseas modificar
        username,
        email,
        password,
        name,
        lastname,
        phome_number = '',
        role_id,
        id_active = 1
    } = req.body;
    
    if (!id || !username || !email || !password || !name || !lastname || !role_id) {
        res.status(400).json({ msg: 'Missing information' });
        return;
    }

    let conn;

    try {
        conn = await pool.getConnection();

        // Verificar si la ID existe en la base de datos
        const [existingUser] = await conn.query(
            usermodels.getById,
            [id]
        );

        if (existingUser.length === 0) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }

        // Verificar si el nombre de usuario o correo electrónico ya existen para otros usuarios
        const [usernameUser] = await conn.query(
            usermodels.getByUsername,
            [username]
        );

        if (usernameUser.length > 0 && usernameUser[0].id !== id) {
            res.status(409).json({ msg: `User with username ${username} already exists` });
            return;
        }

        const [emailUser] = await conn.query(
            usermodels.getByEmail,
            [email]
        );

        if (emailUser.length > 0 && emailUser[0].id !== id) {
            res.status(409).json({ msg: `User with email ${email} already exists` });
            return;
        }

        // Actualizar el usuario en la base de datos
        const userModified = await conn.query(
            usermodels.getUpdate,
            [username, email, password, name, lastname, phome_number, role_id, id_active, id]
        );

        if (userModified.affectedRows === 0) {
            res.status(500).json({ msg: 'Failed to modify user' });
            return;
        }
        
        res.json({ msg: 'User modified successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    } finally {
        if (conn) conn.release();
    }
}*/


///////////////////////////////////////////////////////////////////////////////////////////
const deleteUser = async (req, res)=>{
    let conn;

    try{
        conn = await pool.getConnection();
        const {id} =req.params;
        const [userExists] =await conn.query(
            usermodels.getByID,
            [id],
            (err) => {if (err) throw err;}
        );
        if(!userExists || userExists.id_active === 0){
            res.status(404).json({msg:'User not Found'});
            return;
        }

        const userDelete = await conn.query(
            usermodels.deleteRow,
            [id],
            (err) => {if(err)throw err;}
        );
        if (userDelete.affecteRows===0){
            throw new Error({msg:'failed to delete user'})
        };
        res.json({msg:'user deleted succesfully'});
    }catch(error){
        console.log(error);
        res.status(500).json(error);

    }finally{
       if(conn) conn.end(); 
    }
}



module.exports={listUsers, listUsersByID, addUser, updateUser, deleteUser};