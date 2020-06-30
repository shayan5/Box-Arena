const express = require('express');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const axios = require('axios');

require('dotenv').config();

const app = express();
const port = process.env.GAME_PORT || 4001;


/************* Game **************/
const dimensions = 15;
const interval = 1000; // time in ms it takes for world to update
const maxPlayers = 5;
let world = Array(dimensions).fill().map(() => Array(dimensions).fill(null));
//let numMonsters = 0;
let monsters = [];
let changes = [];
let players = {};
let currentPlayers = 0;


generateWorld();
setInterval(() => {
    updateMonsters();
    broadcastChanges();
}, interval);

function broadcastChanges() {
    wss.broadcast(JSON.stringify({ changes: changes }));
    changes = [];
}

function updateMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        const newCoordinates = moveMonster(monsters[i]);
        monsters[i].x = newCoordinates.x;
        monsters[i].y = newCoordinates.y;
    }
}

function moveMonster(monster) {
    const {x, y} = getRandomDirection();
    if (world[monster.y + y][monster.x + x] === "blank") {
        world[monster.y][monster.x] = "blank";
        changes.push({ x: monster.x, y: monster.y, type: "blank"});
        world[monster.y + y][monster.x + x] = "monster";
        changes.push({ x: monster.x + x, y: monster.y + y, type: "monster"});
        return { x: monster.x + x, y: monster.y + y };
    }
    return { x: monster.x, y: monster.y };
}

function getRandomDirection() {
    const directions = [-1, 0, 1];
    const x = directions[Math.floor(Math.random() * 3)];
    const y = directions[Math.floor(Math.random() * 3)];
    return { x: x, y: y };
}

function generateWorld() {
    for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
            const randomNumber = Math.random();
            if (i === 0 || j === 0 || i === dimensions - 1 || j === dimensions - 1) {
                world[i][j] = "wall"; //surround border with walls
            } else if (randomNumber < 0.35) {
                world[i][j] = "box";
            } else if (randomNumber < 0.39) {
                world[i][j] = "monster";
                monsters.push({ x: j, y: i });
                //numMonsters++;
            } else {
                world[i][j] = "blank";
            }
        }
    }
}

function findEmptyTile() {
    for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
            if (world[i][j] === "blank"){
                return [i, j];
            }
        }
    }
}

async function spawnPlayer(username, token) {
    var armour = await getPlayerInfo(token);
    const emptyTile = findEmptyTile();
    if (emptyTile) {
        const y = emptyTile[0];
        const x = emptyTile[1];
        world[y][x] = armour;
        changes.push({ x: x, y: y, type: armour });
        players[username] = { 
            x: x,
            y: y,
            armour: armour
        };
        currentPlayers++;
        broadcastChanges();
    }
}

function newPlayerRequest(ws, userToken) {
    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            ws.send(JSON.stringify({ error: "User is unauthorized to access resource." }));
            ws.close(4403);
        } else {
            ws.send(JSON.stringify({ world: world }));
            if (currentPlayers < maxPlayers) {   
                spawnPlayer(user.username, userToken);
            } else {
                ws.send(JSON.stringify({ error: "Server has reached player capacity. Please try again later." }));
                ws.close(4503);
            }
        }
    });
}

function logoutRequest(ws, userToken) {
    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            ws.send(JSON.stringify({ error: "User is unauthorized to make this request." }));
        } else {
            const player = players[user.username];
            world[player.y][player.x] = "blank";
            changes.push({ x: player.x, y: player.y, type: "blank" });
            delete players[user.username];
            currentPlayers--;
            broadcastChanges();
        }
    });
}

/**************** Database/API ******/
function getPlayerInfo(token) {
    const config = { 
        headers: { Authorization: `Bearer ${token}` } 
    };
    return axios.get('http://www.test.com:4000/players/armour', config)
    .then((res) => {
        return res.data;
    }).catch(() => {
        return "default";
    });
}

/**************** Sockets ***********/
const wss = new WebSocket.Server({
    port: port
});

wss.on('close', () => {
    console.log('disconnected');
});

wss.broadcast = function(message) {
    for(let ws of this.clients){ 
       ws.send(message, (error) => {
           if (error) {
               console.log(error);
           }
       }); 
   } 
}

wss.on('connection', (ws) => {
	ws.on('message', (clientMessage) => {
        clientMessage = JSON.parse(clientMessage);
        if (clientMessage.request) {
            const req = clientMessage.request;
            if (req === "new") {
                newPlayerRequest(ws, clientMessage.user);
            } else if (req === "logout") {
                logoutRequest(ws, clientMessage.user);
            }
        }
	});
});