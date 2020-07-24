#!/bin/bash

set -e
trap 'catch $? $LINENO' EXIT

catch() {
        if [ "$1" != "0" ]; then
                echo "Error $1 occurred on $2"
        fi
}

envFileLocation=./backend/.env
socketConfigLocation=./src/socketConfig.js

makeEnvFile() {
        echo "Enter port for api server (e.g. 4000): "
        read API_PORT
        echo "Enter port for game server (e.g. 4001): "
        read GAME_PORT
        echo "Enter mongoDB connection string (e.g. mongodb+srv://...): "
        read MONGO_URI
        echo "Enter the url where the api server will be hosted (e.g. http://localhost:8080): "
        read API_SERVER_BASE_URL
        ACCESS_TOKEN_SECRET=$(cat /dev/urandom | head -c 64 | base64 | od -x -w128 -An | tr -d ' \n')
        REFRESH_TOKEN_SECRET=$(cat /dev/urandom | head -c 64 | base64 | od -x -w128 -An | tr -d ' \n')
        GAME_SERVER_TOKEN_SECRET=$(cat /dev/urandom | head -c 64 | base64 | od -x -w128 -An | tr -d ' \n')
        echo "API_SERVER_BASE_URL=$API_SERVER_BASE_URL" > $envFileLocation
        echo "API_PORT=$API_PORT" >> $envFileLocation
        echo "GAME_PORT=$GAME_PORT" >> $envFileLocation
        echo "MONGO_URI=$MONGO_URI" >> $envFileLocation
        echo "ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET" >> $envFileLocation
        echo "REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET" >> $envFileLocation
        echo "GAME_SERVER_TOKEN_SECRET=$GAME_SERVER_TOKEN_SECRET" >> $envFileLocation
}

editWebsocketConfig() {
        echo "Enter url for websocket game server (e.g. ws://localhost:8080): "
        read WEBSOCKET_URL
        sed -ri "s|socketUrl\s.*;|socketUrl = \"$WEBSOCKET_URL\";|" $socketConfigLocation
}

makeEnvFile
echo "Successfully created .env file"
editWebsocketConfig
echo "Successfully updated websocket url"