import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();//connect to mongodb

//express app
const app = express();


//routes
app.get('/', (req, res) => {
    res.send('Server is ready Ashan');
});


// middleware to handle errors this is a global error handler
app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});


// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(bodyParser.json()); // Parses JSON payloads


//routes
app.use('/api', orderRoutes);//this is the route for the order service



//connect to the database
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    //listen for requests
    app.listen(process.env.PORT, ()=> {
    console.log(`Connected to db & Listening on ${process.env.PORT}`);
})
})

.catch((err) => console.log(err));