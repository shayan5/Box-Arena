const express = require('express');
const WebSocket = require('ws');

require('dotenv').config();

const app = express();
const port = process.env.GAME_PORT || 4001;

const dimensions = 15;
const interval = 1000; // time in ms it takes for world to update
let world = Array(dimensions).fill().map(() => Array(dimensions).fill(null));
//let numMonsters = 0;
let monsters = [];
let changes = [];


generateWorld();
setInterval(() => {
    updateMonsters();
    broadcastChanges();
}, interval);
//console.log({ world: world});

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

//**************** Sockets ***********
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
	ws.send(JSON.stringify({ world: world }));
	ws.on('message', (clientMessage) => {
		console.log("recieved message");
	});
});