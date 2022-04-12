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
    LOAD_PLAYER: 'load_player',
    LOGOUT: 'logout',
    VISIT_NEXUS: 'visit_nexus',
    OPEN_TOWNSHIP_MENU: 'open_township_menu',
    OPEN_PLAYER_MENU: 'open_player_menu',
    EQUIPMENT_UPDATE: 'equipment_update'

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
        case actions.LOAD_PLAYER: {
            return {...state, player: {...state.player, ...action.payload}};
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
        

    }
};

// omitting outgoingPackage and incomingPackage for this style of build for now
// nevermind, added serverResponse back in as a catch-all object for 'carte blanche' server response possibilities :P
const initialState = {
    name: undefined, // this'll be in player.name, so we can proooobably just phase this out altogether
    player: {
        name: undefined,
        icon: {}, // put the Nobody face in here :P
        playStack: {
            gps: 'Zenithica',
            nickname: 'Zenithica',
            target: null, // playStack.target can be... a whole LOT of things potentially, currently :P ... when in use, probably an object {type: 'button/npc', id: ''}
            chatventure: null, // either null or an id; if null, we'll 'safely' assume we're in chat mode
            mode: '', // chill, battle, choose, trade, watch, etc. ... so we know what menu(s) to put up, and then we can get the data from player.chatventure's obj?
            doing: 'none', // 'doing' might be redundant at this stage
            at: 'none', // this allows us to specify the 'struct' we're at, potentially useful information
            overlay: 'none',
            data: {}
        }
    }, 
    // playStack: {
    //     gps: 'Zenithica', // phasing out root-level playstack in favor of player-depth playstack
    //     doing: 'none',
    //     at: 'none',
    //     overlay: 'none',
    //     data: {}
    // },
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