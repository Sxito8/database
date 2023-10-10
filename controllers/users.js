const {request,response} = require('express');
const usersModel=require('../models/users');
const pool = require('../db');

const usersList= async (req = request,res=response)=>{
    let  conn;
    try {
        conn = await pool.getConnection();
        const users = await conn.query(usersModel.getAll, (err) => {
            if (err){
                throw new Error(err);
            }
        })
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        
    }finally{
        if (conn) conn.end();
    }
}

module.exports={usersList};