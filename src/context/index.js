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
    ADJUST_MAP_ZOOM: 'adjust_map_zoom',
    ENTER_WORLD_MAP: 'enter_world_map',
    LEAVE_WORLD_MAP: 'leave_world_map',
    LOAD_MANAGEMENT_DATA: 'load_management_data',
    DISMISS_MANAGE_MODE: 'dismiss_manage_mode',
    BEGIN_BATTLE: 'begin_battle'

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
            if (action?.payload?.mapData == null) return {...state, map: null, player: {...state.player, playStack: {...state.player.playStack, mode: null}}};
            return {...state, mapData: action.payload.mapData, mapCamera: {x: action.payload.spawnPoint[0], y: action.payload.spawnPoint[1], width: 21, height: 21}};
        }
        case actions.MOVE_ON_MAP: {
            // ok, now we have to refactor to move state.player.playStack.wps [x,y] around instead; mapCamera will no longer be the focal point, but will still have w/h?
            // playStack can determine what we're up to... ooh, mode worldMap? so if mode is worldMap, we can skiddly-scoot
            if (state.map == null || state.mapCamera == null) return state;
            if (state.player.playStack.mode !== 'worldMap') return state;
            let currentCoords = {x: state.player.playStack.wps[0], y: state.player.playStack.wps[1]};
            Object.keys(action.payload).forEach(coordKey => currentCoords[coordKey] = currentCoords[coordKey] + action.payload[coordKey]);
            if (currentCoords.x < 0) currentCoords.x = state.map.length - 1;
            if (currentCoords.y < 0) currentCoords.y = state.map.length - 1;
            if (currentCoords.x === state.map.length) currentCoords.x = 0;
            if (currentCoords.y === state.map.length) currentCoords.y = 0;
            // console.log(`Square moving into is: `, state.map[currentCoords.x][[currentCoords.y]]);
            if (state.map[currentCoords.x][currentCoords.y][0] === 'o' || state.map[currentCoords.x][currentCoords.y][0] === 'l' || state.map[currentCoords.x][currentCoords.y][0] === 'M' || state.map[currentCoords.x][currentCoords.y][0] === 'c' || state.map[currentCoords.x][currentCoords.y][0] === 'f') return state;
            return {...state, threat: state?.threat + 1, player: {...state.player, playStack: {...state.player.playStack, wps: [currentCoords.x,currentCoords.y]}}};
        }
        case actions.ADJUST_MAP_ZOOM: {
            // we'll tie this to magic/abilities to modify zoom shortly
            let widthTarget;
            if (action.payload === 'walker') widthTarget = 21;
            if (action.payload === 'world') widthTarget = state.map[0].length;
            if (action.payload === '+') widthTarget = state.mapCamera.width - 10;
            if (action.payload === '-') widthTarget = state.mapCamera.width + 10;
            if (widthTarget > state.map[0].length) widthTarget = state.map[0].length;
            if (widthTarget < 11) widthTarget = 11;
            // console.log(`Adjusting to new width target: ${widthTarget}`);
            return {...state, mapCamera: {...state.mapCamera, width: widthTarget, height: widthTarget}};
        }
        case actions.ENTER_WORLD_MAP: {
            // doopty loopty
            const { mapObj, playStack } = action.payload;
            let unredundantMapObj = {...mapObj};
            delete unredundantMapObj.map;
            return {...state, mapData: unredundantMapObj, map: mapObj.map, mapCamera: {width: 21, height: 21}, player: {...state.player, playStack: playStack}};
        }
        case actions.LEAVE_WORLD_MAP: {
            return {...state, player: {...state.player, playStack: {...state.player.playStack, mode: null}}}
        }
        case actions.LOAD_MANAGEMENT_DATA: {
            /*
            
                We'll want to receive the map and management data?
                ... the locationData could hold that, conceivably... pass it on down when we visit, ey?
                ... if we pass down with locationData, info might be a bit stale, but that's a'ight
                ... alternatively, we grab a new locationData set when we boop management... which is probably best
                ... ok, booping management will attempt to grab a new locationData

                NOTE: this is through playStack.overlay option, rather than mode, so we can hinge the map loading on that

                NOTE REDUX: ... all of the above is an older comment, we're blazing ahead with HAXXY TESTING MODE, enjoy!

            */

            // oh, we can do this now
            // getting a {wealth: 0, weight: 0, townstats: {}} payload

            // oops. yeah, no, we can't just slap it in there wholesale, now we probably have a map here. one sec.
            let chillPlayer = {...state.player, playStack: {...state.player.playStack, mode: 'township_management'}};
            if (state.map == null) {
                // HERE: pop that map into existence
                const { mapObj } = action.payload;
                let unredundantMapObj = {...mapObj};
                delete unredundantMapObj.map;
                let mgmtData = {...action.payload};
                delete mgmtData.mapObj;
                return {...state, player: {...chillPlayer}, mapData: unredundantMapObj, map: mapObj.map, mgmtData: {...action.payload}};
            }
            console.log(`Setting mgmtData: `, action.payload);
            let mgmtData = {...action.payload};
            if (mgmtData.mapObj != null) delete mgmtData.mapObj;
            return {...state, player: {...chillPlayer}, mgmtData: {...mgmtData}};
        }
        case actions.DISMISS_MANAGE_MODE: {
            return {...state, mgmtData: null};
        }
        case actions.BEGIN_BATTLE: {
            // not actually really battle-ready yet :P
            return {...state, threat: 0};
        }
        
        

    }
};

// mapCamera is currently just a test device, and will be replaced with various 'location information' in the near future
const initialState = {
    name: undefined, // this'll be in player.name, so we can proooobably just phase this out altogether
    map: null,
    mapData: null,
    threat: 0,
    mapCamera: {width: 21, height: 21}, // default world map values for now
    player: {
        name: undefined,
        icon: {}, // put the Nobody face in here :P
        playStack: {
            gps: 'Zenithica',
            nickname: 'Zenithica',
            wps: null,
            worldID: null,
            target: null, // playStack.target can be... a whole LOT of things potentially, currently :P ... when in use, probably an object {type: 'button/npc', id: ''}
            chatventure: null, // either null or an id; if null, we'll 'safely' assume we're in chat mode
            mode: '', // chill, battle, choose, trade, watch, etc. ... so we know what menu(s) to put up, and then we can get the data from player.chatventure's obj?
            doing: 'none', // 'doing' is beginning to take shape in the server, will hopefully update here as developments occur
            at: 'none', // this allows us to specify the 'struct' we're at, potentially useful information
            overlay: 'none',
            menu: null,
            battle: null
        }
    }, 
    locationData: {
        name: ``,
        nickname: ``,
        description: ``,
        history: [],
        structs: {},
        interactions: []
    },
    mgmtData: null, // client-specific mgmtData to trigger township management... haxxy for testing purposes :P
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