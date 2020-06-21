const WebSocket = require('ws');
require('dotenv').config();

const port = process.env.GAME_PORT || 4001
const wss = new WebSocket.Server({
    port: port
});

let world={};
let monsterArray=[];
const interval = 1000;
let changes={};
const tiles = 21;
let clients = [];
let numMonsters = 0;
	
generateWorld();
setInterval(function(){
    for(let i=0;i<monsterArray.length;i++){
        if (isTrapped(monsterArray[i])){
            killMonster(monsterArray[i]);
        }
        moveMonster(monsterArray[i]);
    }
    broadcastChanges();
}, interval);
	
function killMonster(monster){
	world[monster.x+"-"+monster.y]="blank";
	changes[monster.x+"-"+monster.y]="blank";
	broadcastChanges();
	numMonsters--;
}
	
function isTrapped(monster){
	let trapped = true;
	let lst=[];
	lst.push(getMoveCoord(monster.x,monster.y,"N"));
	lst.push(getMoveCoord(monster.x,monster.y,"S"));
	lst.push(getMoveCoord(monster.x,monster.y,"E"));
	lst.push(getMoveCoord(monster.x,monster.y,"W"));
	lst.push(getMoveCoord(monster.x,monster.y,"NE"));
	lst.push(getMoveCoord(monster.x,monster.y,"NW"));
	lst.push(getMoveCoord(monster.x,monster.y,"SE"));
	lst.push(getMoveCoord(monster.x,monster.y,"SW"));
	for (let i =0;i<lst.length;i++){
		const actor = world[lst[i][0]+"-"+lst[i][1]];
		if (actor != "wall" && actor != "box"){
			trapped=false;
			break;
		}
	}
	return trapped;
}

function broadcastChanges(){
	wss.broadcast(JSON.stringify(changes));
	changes={};
}

function generateWorld(){
	for (let i = 1; i < tiles; i++){
		for (let j = 1; j < tiles; j++){
			const num = Math.random();
			if (j == 1 || j == 20 || i == 1 || i == 20){
				world[i+"-"+j]="wall";
			} else if (num < 0.35){
				world[i+"-"+j]="box";
			} else if (num < 0.38) {
				monsterArray.push(new Monster(i, j, getRandDir()));
				numMonsters++;
				world[i+"-"+j]="monster";
			} else {
				world[i+"-"+j]="blank";
			}
		}
	}
}

function getRandDir(){
	const num = Math.random();
	if (num < 0.125){
		return "N";
	} else if (num >= 0.125 && num < 0.25){
		return "S";
	} else if (num >= 0.25 && num < 0.375){
		return "E";
	} else if (num >= 0.375 && num < 0.50){
		return "W";
	} else if (num >= 0.5 && num < 0.625){
		return "NE";
	} else if (num >= 0.625 && num < 0.75){
		return "NW";
	} else if (num >= 0.75 && num < 0.875){
		return "SW";
	} else {
		return "SE";
	}
}

function moveMonster(monster){
	const lst = getMoveCoord(monster.x, monster.y, monster.direction);
	const actor = world[lst[0]+"-"+lst[1]];
	if (actor=="blank"){
		world[monster.x+"-"+monster.y]="blank";
		changes[monster.x+"-"+monster.y]="blank";
		monster.x=lst[0];
		monster.y=lst[1];
		world[lst[0]+"-"+lst[1]]="monster";
		changes[lst[0]+"-"+lst[1]]="monster";
	} else {
		monster.direction=getRandDir();
	}
}

function getMoveCoord(x, y, direction){
	let retVal = [];
	switch(direction){
		case "N":
			y-=1;
			break;
		case "S":
			y+=1;
			break;
		case "E":
			x+=1;
			break;
		case "W":
			x-=1;
			break;
		case "NE":
			y-=1;
			x+=1;
			break;
		case "NW":
			y-=1;
			x-=1;
			break;
		case "SE":
			y+=1;
			x+=1;
			break;
		case "SW":
			y+=1;
			x-=1;
			break;
		default:
			break;
	}
	retVal.push(x);
	retVal.push(y);
	return retVal;
}

function getOppositeDirection(direction){
	let retVal = "";
	switch(direction){
		case "N":
			retVal += "S";
			break;
		case "S":
			retVal +=  "N";
			break;
		case "E":
			retVal +=  "W";
			break;
		case "W":
			retVal +=  "E";
			break;
		case "NE":
			retVal +=  "SW";
			break;
		case "NW":
			retVal +=  "SE";
			break;
		case "SE":
			retVal +=  "NW";
			break;
		case "SW":
			retVal +=  "NE";
			break;
		default:
			break;
	}
	return retVal;
}


function Player(name, x, y){
	this.name=name;
	this.x=x;
	this.y=y;
}

function Monster(x, y, direction){
	this.x=x;
	this.y=y;
	this.direction=direction;
}

function placePlayer(player){
	for (let i = 1; i < tiles; i++){
		for (let j = 1; j <tiles; j++){
			if (world[i+"-"+j]=="blank"){
				world[i+"-"+j]=player;
				changes[i+"-"+j]=player;
				broadcastChanges();
				return;
			}
		}
	}
}

function removePlayer(player){
	for (let i = 1; i < tiles; i++){
		for (let j = 1; j <tiles; j++){
			if (world[i+"-"+j]==player){
				world[i+"-"+j]="blank";
				changes[i+"-"+j]="blank";
				broadcastChanges();
				return;
			}
		}
	}
}

function movePlayer(direction, name, location){
	const coord = location.split("-");
	const x=parseInt(coord[0]);
	const y=parseInt(coord[1]);
	const result = getMoveCoord(x, y, direction);
	const newSquare = result[0]+"-"+result[1];
	if (world[newSquare]=="blank"){
		world[location]="blank";
		changes[location]="blank";
		world[newSquare]=name;
		changes[newSquare]=name;
		broadcastChanges();
	} else if (world[newSquare]=="box"){
		if (canMoveBox(newSquare, direction)){
			moveBox(newSquare, direction);
			movePlayer(direction, name, location);
		}
	}
}

function moveBox(box, direction){
	const coord = box.split("-");
	const x=parseInt(coord[0]);
	const y=parseInt(coord[1]);	
	const lst = getMoveCoord(x, y, direction);
	const nextActor=world[lst[0]+"-"+lst[1]];
	if (nextActor=="blank"){
		world[box]="blank";
		world[lst[0]+"-"+lst[1]]="box";
		changes[box]="blank";
		changes[lst[0]+"-"+lst[1]]="box";
	} else if (nextActor=="box"){
		moveBox(lst[0]+"-"+lst[1], direction);
	}
}

function canMoveBox(box, direction){
	const coord = box.split("-");
	const x=parseInt(coord[0]);
    const y=parseInt(coord[1]);
	const lst = getMoveCoord(x, y, direction);
	const nextSquare = world[lst[0]+"-"+lst[1]];
	if (nextSquare=="blank"){
		return true;
	} else if (nextSquare=="box"){
		return canMoveBox(lst[0]+"-"+lst[1], direction);
	} else {
		return false;
	}
}

function parseRequest(request){
	//request, name, location
	if (request[0]=="new"){
		placePlayer(request[1]);
	} else if (request[0]=="logout"){
		removePlayer(request[1]);
	} else if (request[0]=="N" || request[0]=="S" || request[0]=="E" || request[0]=="W"){
		movePlayer(request[0], request[1], request[2]);
	}
}

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
 	for(let ws of this.clients){ 
		ws.send(message, function(error){}); 
	} 

	// Alternatively
/* 	this.clients.forEach(function (ws){ 
		ws.send(message);
	}); */
}

wss.on('connection', function(ws) {
	ws.send(JSON.stringify(world));
	ws.on('message', function(clientMessage) {
		const message = JSON.parse(clientMessage);
		parseRequest(message);
	});
});