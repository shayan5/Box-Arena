const express = require('express');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const axios = require('axios');

require('dotenv').config();

const app = express();
const port = process.env.GAME_PORT || 4001;

/************* Tile Classes ******/
class Tile {
    constructor(type) {
        this.type = type;
    }
}

class PlayerTile extends Tile {
    constructor(username, armour) {
        super("player");
        this.username = username;
        this.armour = armour;
    }
}


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
    if (changes.length > 0) {
        wss.broadcast(JSON.stringify({ changes: changes }));
        changes = [];
    }
}

function updateMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        if (isTrapped(monsters[i])) {
            killMonster(i);
        } else {
            const newCoordinates = moveMonster(monsters[i]);
            //update monster changes
            monsters[i].x = newCoordinates.x;
            monsters[i].y = newCoordinates.y;
        }
    }
}

function isTrapped(monster) {
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) {
                continue;
            }
            if (world[monster.y + i][monster.x + j].type !== "box" && 
            world[monster.y + i][monster.x + j].type !== "wall") {
                return false;
            }
        }
    }
    return true;
}

function killMonster(index) {
    const monster = monsters[index];
    world[monster.y][monster.x] = new Tile("blank");
    monsters.splice(index, 1);
    changes.push({ x: monster.x, y: monster.y, type: "blank" });
    broadcastChanges();
}

function moveMonster(monster) {
    const {x, y} = getRandomDirection();
    if (world[monster.y + y][monster.x + x].type === "blank") {
        world[monster.y][monster.x] = new Tile("blank");
        changes.push({ x: monster.x, y: monster.y, type: "blank"});
        world[monster.y + y][monster.x + x] = new Tile("monster");
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
                world[i][j] = new Tile("wall"); //surround border with walls
            } else if (randomNumber < 0.35) {
                world[i][j] = new Tile("box");
            } else if (randomNumber < 0.39) {
                world[i][j] = new Tile("monster");
                monsters.push({ x: j, y: i });
                //numMonsters++;
            } else {
                world[i][j] = new Tile("blank");
            }
        }
    }
}

function findEmptyTile() {
    for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
            if (world[i][j].type === "blank"){
                return [i, j];
            }
        }
    }
    return null;
}

async function spawnPlayer(username, token) {
    var armour = await getPlayerInfo(token);
    const emptyTile = findEmptyTile();
    if (emptyTile != null) {
        const y = emptyTile[0];
        const x = emptyTile[1];
        world[y][x] = new PlayerTile(username, armour);
        changes.push({ x: x, y: y, type: "player", armour: armour, username: username });
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
            if (players[user.username]) { // user is already logged in so remove the current instance and respawn them
                deletePlayer(user.username);
            }
            if (currentPlayers < maxPlayers) {   
                spawnPlayer(user.username, userToken);
            } else {
                ws.send(JSON.stringify({ error: "Server has reached player capacity. Please try again later." }));
                ws.close(4503);
            }
        }
    });
}

function deletePlayer(username) {
    const player = players[username];
    world[player.y][player.x] = new Tile("blank");
    changes.push({ x: player.x, y: player.y, type: "blank" });
    delete players[username];
    currentPlayers--;
    broadcastChanges();
}

function logoutRequest(ws, userToken) {
    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            ws.send(JSON.stringify({ error: "User is unauthorized to make this request." }));
        } else {
            deletePlayer(user.username);
        }
    });
}

function performMove(currentTile, direction) {
    const nextTile = [currentTile[0] + direction[0], currentTile[1] + direction[1]];
    if (world[nextTile[0]][nextTile[1]].type === "box") {
        performMove(nextTile, direction);
    } 
    if (world[nextTile[0]][nextTile[1]].type === "blank") {
        const temp = world[currentTile[0]][currentTile[1]];
        world[currentTile[0]][currentTile[1]] = new Tile("blank");
        changes.push({ x: currentTile[1], y: currentTile[0], type: "blank"});
        world[nextTile[0]][nextTile[1]] = temp;
        if (temp.type === "player") {
            changes.push({ x: nextTile[1], y: nextTile[0], type: "player", username: temp.username, armour: temp.armour });
            players[temp.username] = { x: nextTile[1], y: nextTile[0], armour: temp.armour };
        } else {
            changes.push({ x: nextTile[1], y: nextTile[0], type: temp.type });
        }
    }
}

function movePlayer(ws, userToken, direction) {
    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            ws.send(JSON.stringify({ error: "User is unauthorized to make this request." }));
        } else {
            // i is vertical, j is horizontal
            const dirMap = {
                "up": [-1, 0],
                "down": [1, 0],
                "left": [0, -1],
                "right": [0, 1]
            };
            if (players[user.username]) {
                const player = players[user.username];
                const playerTile = [player.y, player.x];
                performMove(playerTile, dirMap[direction]);
                broadcastChanges();
            }
        }
    });
}

function parseRequest(ws, clientMessage) {
    if (clientMessage.request) {
        const req = clientMessage.request;
        switch(req) {
            case "new":
                newPlayerRequest(ws, clientMessage.user);
                break;
            case "logout":
                logoutRequest(ws, clientMessage.user);
                break;
            case "up":
                movePlayer(ws, clientMessage.user, "up");
                break;
            case "down":
                movePlayer(ws, clientMessage.user, "down");
                break;
            case "left":
                movePlayer(ws, clientMessage.user, "left");
                break;
            case "right":
                movePlayer(ws, clientMessage.user, "right");
                break;
            default:
                break;
        }
    }
}


/**************** Database/API ******/
function getPlayerInfo(token) {
    const config = { 
        headers: { Authorization: `Bearer ${token}` } 
    };
    return axios.get('http://www.test.com:4000/players/armour', config) //TODO relative path
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
        parseRequest(ws, clientMessage);
	});
});