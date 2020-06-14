const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// serve static react pages
app.use(express.static(path.join(__dirname, '../build')));

// establish nosql connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB connection has been established");
});

// api for player operations 
const playersRouter = require('./routes/players');
app.use('/players', playersRouter);

app.listen(port, () => {
    console.log("Server is listening on port: " + port);
});

app.get('/', function(req, res) {
    res.send('Hello World!!');
});