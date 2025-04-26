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



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });
  
  // Handle 404 routes
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });




// Connect to the database
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/orderDB'; // Default to local DB if not set
const port = process.env.PORT || 7000; // Default to 8000 if not set

mongoose.connect(mongoURI)
.then(() => {
    // Listen for requests
    app.listen(port, () => {
        console.log(`Connected to db & Listening on port ${port}`);
    });
})
.catch((err) => console.log(err));


// connect to the database
// mongoose.connect(process.env.MONGO_URI)
// .then(() => {
//     //listen for requests
//     app.listen(process.env.PORT, ()=> {
//     console.log(`Connected to db & Listening on ${process.env.PORT}`);
// })
// })

// .catch((err) => console.log(err));