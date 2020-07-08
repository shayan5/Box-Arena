const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
const port = process.env.API_PORT || 4000;

//app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: ["http://www.test.com:3000", "http://www.test.com:4000"], //TODO in prod both api and main site should be on same port
    credentials: true
}));


// serve static react pages
app.use(express.static(path.join(__dirname, '../build')));

// establish nosql connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB connection has been established");
});

// api for authentication related operations
const authenticationRouter = require('./routes/authentication');
app.use('/authentication', authenticationRouter);

// api for player related operations 
const playersRouter = require('./routes/players');
app.use('/players', playersRouter);

// api for item store operations
const itemsRouter = require('./routes/items');
app.use('/items', itemsRouter);

app.listen(port, () => {
    console.log("Server is listening on port: " + port);
});

app.get('/', function(req, res) {
    res.send('Hello World!!');
});