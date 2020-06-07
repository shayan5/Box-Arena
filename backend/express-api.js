const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB connection has been established");
});

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log("Server is listening on port: " + port);
});

app.get('/', function(req, res) {
    res.send('Hello World!!');
});