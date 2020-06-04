const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.port || 4000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log("Server is listening on port: " + port);
});

app.get('/', function(req, res) {
    res.send('Hello World!!');
});