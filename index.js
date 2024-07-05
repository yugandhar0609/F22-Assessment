import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import Connect from './comman/connection.js' 
import router from './Routes/UserRoutes.js';

const app = express();
app.use(express.json());
app.use(cors())
app.use(router)
Connect();
const port = 8500;

app.listen(port,()=>{
    console.log("server in running on:",port)
})  