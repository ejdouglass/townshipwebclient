import React, { createContext, useReducer } from 'react';
import socketio from 'socket.io-client';
import { SOCKET_URL } from '../config';

// It may make sense to try to set the socket connection up elsewhere. Review after some development testing.
export const socket = socketio.connect(SOCKET_URL);
export const SocketContext = createContext();

export const actions = {
    PROMPT_LOGIN: 'prompt_login',
    PROMPT_CHARACTER_CREATION: 'prompt_character_creation',
    DISMISS_OVERLAY: 'dismiss_overlay',
    UPDATE_LOCATION: 'update_location',
    NEW_MESSAGE: 'new_message',
    NEW_CHATVENTURE_EVENT: 'new_chatventure_event',
    LOAD_PLAYER: 'load_player',
    LOGOUT: 'logout',
    VISIT_NEXUS: 'visit_nexus',
    OPEN_TOWNSHIP_MENU: 'open_township_menu',
    OPEN_PLAYER_MENU: 'open_player_menu',
    EQUIPMENT_UPDATE: 'equipment_update',
    LOAD_TEST_MAP: 'load_test_map',
    MOVE_ON_MAP: 'move_on_map',
    ADJUST_MAP_ZOOM: 'adjust_map_zoom'

};

export const Reducer = (state, action) => {
    switch (action.type) {
        case actions.PROMPT_LOGIN: {
            let stateCopy = {...state};
            stateCopy.player.playStack.overlay = 'login';
            return {...stateCopy};
        }
        case actions.PROMPT_CHARACTER_CREATION: {
            let newState = {...state};
            newState.player.playStack.overlay = 'character_creation';
            return {...newState};
        }
        case actions.DISMISS_OVERLAY: {
            let newState = {...state};
            newState.player.playStack.overlay = 'none';
            return {...newState};
        }
        case actions.UPDATE_LOCATION: {
            let newState = {...state};
            newState.locationData = {...newState.locationData, ...action.payload};
            newState.player.playStack.gps = action.payload.name;
            return {...newState};
        }
        case actions.NEW_MESSAGE: {
            if (action.payload.origin.toLowerCase() !== state.player.playStack.gps.toLowerCase()) return state;
            return {...state, locationData: {...state.locationData, history: [...state.locationData.history, action.payload]}};
        }
        case actions.NEW_CHATVENTURE_EVENT: {
            let newState = {...state};
            if (state?.player?.chatventure == null) return state;
            // newState.player.chatventure.history.push(action.payload);
            newState.player.chatventure.history = [...newState.player.chatventure.history, action.payload];
            return {...newState};
        }
        case actions.LOAD_PLAYER: {
            return {...state, player: {...state.player, ...action.payload}};
            // return {...state, player: {...state.player, ...action.payload}};
        }
        case actions.LOGOUT: {
            return {...initialState};
        }
        case actions.VISIT_NEXUS: {
            let newState = {...state};
            newState.player.playStack.gps = 'nexus';
            return {...newState};
        }
        case actions.OPEN_TOWNSHIP_MENU: {
            let newState = {...state};
            newState.player.playStack.overlay = 'township_management';
            return {...newState};
        }
        case actions.OPEN_PLAYER_MENU: {
            let newState = {...state};
            newState.player.playStack.overlay = 'player_management';
            return {...newState};
        }
        case actions.EQUIPMENT_UPDATE: {
            // we should be receiving action.payload = {equipment: OBJECT, inventory: ARRAY}
            let newState = {...state};
            newState.player.equipment = action.payload.equipment;
            newState.player.inventory = action.payload.inventory;
            newState.player.stats = action.payload.stats;
            return {...newState};
        }
        case actions.LOAD_TEST_MAP: {
            if (action?.payload?.mapData == null) return {...state, mapData: null, mapCamera: null};
            return {...state, mapData: action.payload.mapData, mapCamera: {x: action.payload.spawnPoint[0], y: action.payload.spawnPoint[1], width: 21, height: 21}};
        }
        case actions.MOVE_ON_MAP: {
            // add a check, no more ocean-walking!
            if (state.mapData == null || state.mapCamera == null) return state;
            let currentCoords = {x: state.mapCamera.x, y: state.mapCamera.y};
            Object.keys(action.payload).forEach(coordKey => currentCoords[coordKey] = currentCoords[coordKey] + action.payload[coordKey]);
            if (currentCoords.x < 0) currentCoords.x = state.mapData.length - 1;
            if (currentCoords.y < 0) currentCoords.y = state.mapData.length - 1;
            if (currentCoords.x === state.mapData.length) currentCoords.x = 0;
            if (currentCoords.y === state.mapData.length) currentCoords.y = 0;
            // console.log(`Square moving into is: `, state.mapData[currentCoords.x][[currentCoords.y]])
            if (state.mapData[currentCoords.x][currentCoords.y].biome === 'ocean' || state.mapData[currentCoords.x][currentCoords.y].biomeType === 'freshwater' || state.mapData[currentCoords.x][currentCoords.y].biome === 'mountain') return state;
            return {...state, mapCamera: {...state.mapCamera, ...currentCoords}};
        }
        case actions.ADJUST_MAP_ZOOM: {
            let widthTarget;
            if (action.payload === 'walker') widthTarget = 21;
            if (action.payload === 'world') widthTarget = state.mapData[0].length;
            if (action.payload === '+') widthTarget = state.mapCamera.width - 10;
            if (action.payload === '-') widthTarget = state.mapCamera.width + 10;
            if (widthTarget > state.mapData[0].length) widthTarget = state.mapData[0].length;
            if (widthTarget < 11) widthTarget = 11;
            console.log(`Adjusting to new width target: ${widthTarget}`)
            return {...state, mapCamera: {...state.mapCamera, width: widthTarget, height: widthTarget}};
        }
        
        

    }
};

// mapCamera is currently just a test device, and will be replaced with various 'location information' in the near future
const initialState = {
    name: undefined, // this'll be in player.name, so we can proooobably just phase this out altogether
    map: null,
    mapData: null,
    mapCamera: null,
    player: {
        name: undefined,
        icon: {}, // put the Nobody face in here :P
        playStack: {
            gps: 'Zenithica',
            nickname: 'Zenithica',
            target: null, // playStack.target can be... a whole LOT of things potentially, currently :P ... when in use, probably an object {type: 'button/npc', id: ''}
            chatventure: null, // either null or an id; if null, we'll 'safely' assume we're in chat mode
            mode: '', // chill, battle, choose, trade, watch, etc. ... so we know what menu(s) to put up, and then we can get the data from player.chatventure's obj?
            doing: 'none', // 'doing' is beginning to take shape in the server, will hopefully update here as developments occur
            at: 'none', // this allows us to specify the 'struct' we're at, potentially useful information
            overlay: 'none',
            data: {},
            menu: null,
            battle: null
        }
    }, 
    locationData: {
        name: ``,
        nickname: ``,
        description: ``,
        history: [],
        structs: {}
    },
    alertString: undefined,
    currentTownship: undefined,
    serverResponse: {},
    currentChatventure: undefined // this also lives in the player info, so this state-root-level dupe may not be necessary
};

export const Context = createContext(initialState);

export const Store = ({children}) => {
    const [state, dispatch] = useReducer(Reducer, initialState);

    return (
        <Context.Provider value={[state, dispatch]}>
            {children}
        </Context.Provider>
    )
};