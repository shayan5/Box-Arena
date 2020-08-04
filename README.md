# Box-Arena
An online coop game built using the MERN stack.

## Description
This project is a small cooperative browser based online multiplayer game. The goal of the game is to work together with other players to eliminate all of the monsters in the arena. Players can tactically push boxes placed throughout the arena in order to trap, and therefore eliminate, the monsters.  

## Features 
- account system - players can sign up for an account to have their progress saved
- chatbox - to help players coordinate with each other
- item shop - players can spend their points to purchase different avatars
- leaderboards - players can compete against each other for the highest scores

## Technology
The frontend uses React, JavaScript, html + css. 

The backend uses: Node.js, Express, WebSockets, MongoDB. 

For the account management system, BCrypt is used to salt and hash passwords so that plaintext passwords are never stored in the database. 

The account operations are exposed via a RESTful api running on an Express server. These operations are secured through short lived JWTs implementing a relatively simple version of OAuth2 authorization (see <a href="https://tools.ietf.org/html/rfc6749">The OAuth 2.0 Authorization Framework
</a> for more info) by using refresh tokens as long as the player is using the website or the token is not invalidated (refresh tokens can be invalidated through expiry, or revoked by the server, or by the user logging out). The access tokens are stored in memory while the refresh tokens are stored in HttpOnly cookies for added security.    

A separate Node.js WebSocket server is used for the game which manages the the state of the game world, match duration, and player actions such as player movement and chat messages. 

## Quick Start
You will need Node.js and npm
1. Clone this repo
2. Run `npm install` in the root and the /backend directories
3. Run the setup.sh script in the root directory (Note: if you cannot run setup.sh, you will have to manually create a .env file in /backend and fill the parameters as shown in /backend/.env.sample. You will also need to manually edit the websocket url in /src/socketConfig.js)
4. Run `npm run build` in the root directory to make a production build
5. Run `node /backend/express-api.js` to start the api server
6. Run `node /backend/game-server.js` to start the game server
7. Navigate to the api server url in your preferred web browser
