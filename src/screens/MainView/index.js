import React, { useContext, useState, useEffect, useRef } from 'react';
import { actions, Context, SocketContext } from '../../context';
import { MyIcon, OverlayContentContainer, VocalSpan } from '../../styled';
import tilemap from '../../assets/climetiles.jpg';
import townshipTile from '../../assets/townshiptile.jpg';

export default function MainView() {
    const socket = useContext(SocketContext);
    const [state, dispatch] = useContext(Context);
    const [WPSInfo, setWPSInfo] = useState(``);
    const [chatMessage, setChatMessage] = useState('');
    const [potentialFriendArray, setPotentialFriendArray] = useState([]);
    const [mgmtObj, setMgmtObj] = useState({arr: [], modal: null, incomes: {Wood: 0}, inventory: {}, mode: 'omni', viewTile: null, viewDetails: {}});
    const messageEndRef = useRef(null);
    const chatRef = useRef(null);

    function sendSocketData(dataObj, event) {
        // so we'd use this fxn by attaching an obj with {event: 'socket_event', OTHERSTUFF, and token: token below}
        return socket.emit(event || 'data_from_client', {...dataObj, token: localStorage.getItem('CTJWT')});
    }

    function handleWho() {
        if (!state?.player?.name) {
            return dispatch({type: actions.PROMPT_LOGIN});
        }
        return alert(`You are ${state?.player?.name}.`);
    }

    function logout() {
        // remove JWT, reset state, probably send a 'logout' pulse to server
        localStorage.removeItem('CTJWT');
        dispatch({type: actions.LOGOUT});
        return sendSocketData({}, 'logout');
    }

    function sendChat(e) {
        e.preventDefault();
        if (state?.player?.name == null) return setChatMessage(`(you attempt to speak, but you've forgotten how)`);
        const newChatAction = {
            echo: chatMessage,
            type: 'chat',
            voice: state?.player?.voice || {},
            targetType: 'chatroom', // chatroom vs chatventure vs ???
            target: state?.player?.playStack.gps
        };
        sendSocketData(newChatAction, 'chat_action');
        return setChatMessage('');
    }

    function visitNexus() {
        if (state.player.name == null) return;
        return dispatch({type: actions.VISIT_NEXUS});
    }

    function viewTownshipManagement() {
        // neat. ok, so now we need to do a request for locationData (map included if possible before our dispatch)
        // what if the socket request response is what opened our township menu? HRM
        // so the below would become a socket instead
        if (state?.locationData?.name === 'Zenithica') return;
        return sendSocketData({soul: state.locationData.name}, 'view_township_management');
    }

    function moveCharacter(direction) {
        // eventually the socket will be involved, but for now...
        return dispatch({type: actions.MOVE_ON_MAP, payload: direction});
    }

    function visitTownship(name) {
        // console.log(`Requesting a visit to township: ${name}`);
        return sendSocketData({name: name}, 'request_township_visit');
    }

    function enterTownship() {
        // figure out which township we're referring to by name, turn off our mappy mode, and then call visitTownship(name) above
        const townshipToEnter = state.mapData.townships[`${state.player.playStack.wps[0]},${state.player.playStack.wps[1]}`];
        // console.log(`Oh we want to enter the township belonging to the lovely soul of ${townshipToEnter}`);
        dispatch({type: actions.LEAVE_WORLD_MAP});
        return visitTownship(townshipToEnter);
    }

    function searchPotentialFriends() {
        return sendSocketData({}, 'search_potential_friends');
    }

    function followSoul(soulName) {
        setPotentialFriendArray([]);
        return sendSocketData({soulName: soulName}, 'follow_soul');
    }
    
    function handleStructInteractionRequest(structToInteract, interaction) {
        if (interaction == null) return;
        if (interaction === 'nexus') return visitNexus();
        return sendSocketData({soulTarget: structToInteract.soulRef, interaction: interaction}, 'interact_with_struct');
    }

    function handleInteractionRequest(interaction) {
        if (interaction == null) return;
        if (interaction === 'nexus') return visitNexus();
        return sendSocketData({soulTarget: state?.locationData?.name, interaction: interaction}, 'interact_with_struct');
    }

    function handleKeyInput(e) {
        if (state.player.playStack.mode !== 'worldMap') return;
        // console.log(e.key);
        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                return moveCharacter({y: -1});
            case 'd':
            case 'ArrowRight':
                return moveCharacter({x: 1});
            case 's':
            case 'ArrowDown':
                return moveCharacter({y: 1});
            case 'a':
            case 'ArrowLeft':
                return moveCharacter({x: -1});
            default: return;
        }
    }

    // function toggleMgmtTile(tileObj, index) {
    //     // tileObj is coord: [x,y] and active: bool
        
    //     if (tileObj.coord[0] === state.mgmtData.wps[0] && tileObj.coord[1] === state.mgmtData.wps[1]) return;
        
    //     let totalActiveTiles = 0;
    //     mgmtObj.arr.forEach(tileObject => {
    //         if (tileObject.gathering) totalActiveTiles += 1
    //     });
    //     // right now this is very 'gathering'-heavy, but we have the means now in the mgmtObj to track building and refining
    //     // mgmtObj is 'proposed' actions, while state.mgmtData is 'actual' actions currently implemented
    //     const slotsUsed = 0;
    //     // console.log(`Current number of active tiles BEFORE processing this click is ${totalActiveTiles}`);
    //     if (mgmtObj.arr[index].gathering === false && totalActiveTiles === state.mgmtData.townstats.actionSlots) return alert(`Woop, you're at gathering capacity, unclick some first.`);

    //     let newMgmtArr = [...mgmtObj.arr];
    //     newMgmtArr[index] = {...newMgmtArr[index], gathering: !newMgmtArr[index].gathering};
    //     return setMgmtObj({...mgmtObj, arr: [...newMgmtArr]});
    // }

    function openModal(type) {
        /*
        
            okdok

            so we have TYPE of modal:
            - 'refine'
            - 'struct'
            ... and mmmmmaybe township settings?
        
        */
        return setMgmtObj({...mgmtObj, modal: {type: type}});
    }

    function countCurrentWorkers(type) {
        if (type != null) {
            switch (type) {
                case 'building': {
                    let totalBuilders = 0;
                    state.mgmtData.building.forEach(buildObj => totalBuilders += buildObj.workers);
                    return totalBuilders;
                }
                case 'refining': {
                    let totalRefiners = 0;
                    state.mgmtData.refining.forEach(refineObj => totalRefiners += refineObj.workers);
                    return totalRefiners;
                }
                case 'gathering': {
                    return state.mgmtData.gatheringCoords.length;
                }
                default: return;
            }
        }
        // simply returns the current number of busy workers in the township
        let totalBuildingWorkers = 0;
        let totalRefiningWorkers = 0;
        state.mgmtData.building.forEach(buildObj => totalBuildingWorkers += buildObj.workers);
        state.mgmtData.refining.forEach(refineObj => totalRefiningWorkers += refineObj.workers);
        return state.mgmtData.gatheringCoords.length + totalBuildingWorkers + totalRefiningWorkers;      
    }

    function recallWorkers(which) {
        if (which == null) which = 'all';
        switch (which) {
            case 'builders': {

            }
            case 'refiners': {
                
            }
            case 'gatherers': {

            }
            case 'all':
            default: {
                let gatherArr = [...mgmtObj.arr];
                gatherArr.forEach((tileObject, index) => {
                    if (tileObject.gathering) gatherArr[index].gathering = false;
                });                
                let buildArrCopy = [...state.mgmtData.building];
                buildArrCopy.forEach((buildObj, index) => {
                    buildArrCopy[index].workers = 0;
                });
                let refineArrCopy = [...state.mgmtData.refining];
                refineArrCopy.forEach((refineObj, index) => {
                    refineArrCopy[index].workers = 0;
                });
                let newMgmtObj = {...mgmtObj, building: [...buildArrCopy], refining: [...refineArrCopy], gatherNow: 0, arr: [...gatherArr]};

                setMgmtObj(newMgmtObj);
        
                return saveManagementSettings(newMgmtObj);
            }
        }

    }

    function adjustUpgrading(upgradeObj, amt) {
        /*
        
            So, we may actually just want the INDEX, not the entire obj
            
            receive a +1 or -1, ADD that to the workers for the given index, then send updated info with saveManagementSettings(), ezpz?

            ... nope, don't have the index, but since the project has the unique 'subject' of the struct's id (only one upgrade possible on a struct at once, so it'll be unique), we can use that

        
        */
        // so, copy the upgrading array, pop through it to adjust the target with amt (assuming we have enough workers available), make sure we don't go to -1 somehow also, send to server
        // a little inefficient, but should work just fine
        if (countCurrentWorkers() + amt > state.mgmtData.townstats.actionSlots) return alert(`The township is already fully assigned; clear up some workers first.`);
        let buildArrCopy = [...state.mgmtData.building];
        buildArrCopy.forEach((projObj, index) => {
            if (projObj.subject === upgradeObj.subject) {
                buildArrCopy[index].workers += amt;
                if (buildArrCopy[index].workers < 0) buildArrCopy[index].workers = 0;
            } 
        });

        let newMgmtObj = {...mgmtObj, building: [...buildArrCopy]};
        setMgmtObj(newMgmtObj);

        return saveManagementSettings(newMgmtObj);
    }

    function adjustBuilding(buildIndex, amt) {
        // doopty
        if (countCurrentWorkers() + amt > state.mgmtData.townstats.actionSlots) return alert(`The township is already fully assigned; clear up some workers first.`);
        let buildArrCopy = [...state.mgmtData.building];
        buildArrCopy[buildIndex].workers += amt;
        if (buildArrCopy[buildIndex].workers < 0) buildArrCopy[buildIndex].workers = 0;


        let newMgmtObj = {...mgmtObj, building: [...buildArrCopy]};
        setMgmtObj(newMgmtObj);

        return saveManagementSettings(newMgmtObj);
    }

    function adjustRefining(refineOptObj, amt) {
        /*
        
            OK! REFINING!
            - check for available actionSlots (which we just don't do anywhere anyhow currently, whoops)
            we're concerned with our total in mgmtObj.townstats.actionSlots as our 'limiter'
            I like the idea of auto-unassign eventually but that's not critical right now

            what's it look like in mgmtObj? that's our local ref, so one sec...
            gatherNow is our number of current gatherers, and we just grab the building and refining arrays [...] style
                - so gatherNow, building.length, and refining.length

            assuming we're clear on personnel reqs, what then:

            gotta SOCKETTOME (sendSocketData) with the new management data... hrm, how do we do it for gathering?
            AHA! saveManagementSettings() gets us all set up... sort of.

            right now, it ONLY applies to gatheringCoords. we want the whoooole mgmtObj... well, the current passed stuff plus refining and building

            OK! management saving is improved, I believe, so we just need to update mgmtObj.refining


            NEO REFINING - you move like they do
            ... but with the goal of being able to +/- within availability to ramp up/ramp down refining

            currently refining is an array of strings... proooobably going to have to change it into an array of objects to make this work as easily as possible

            NEO REFINING OBJ
            {name, workers, }...
            akshully, here's a refining recipe: {name: 'Brew Beer', resource: 'water', from: {veg: 2, water: 2}, into: {beer: 2}, time: 60}
            ... so, uh, that, but with workers?

            ok, now we're just receiving a -1 or +1 and the obj, so we can find the recipe in state.mgmtData.refining, add it if it isn't there, subtract it if we went to 0, and add otherwise


        
        */

        if (amt > 0) {
            const maxSlots = state.mgmtData.townstats.actionSlots;
            if (countCurrentWorkers() + amt > maxSlots) return alert(`The township is already fully assigned; clear up some workers first.`);
        }

            
        let currentlyRefiningThis = false;
        let newMgmtObj = {};
        if (state.mgmtData.refining.filter(refineObj => refineObj.name === refineOptObj.name).length > 0) currentlyRefiningThis = true;
        // if (state.mgmtData.refining.indexOf(refineOptObj.name) > -1) currentlyRefiningThis = true;
        if (currentlyRefiningThis === false) {
            if (amt < 0) return alert(`You can't decrease workers below zero. :P`);
            newMgmtObj = {...mgmtObj, refining: [...mgmtObj.refining, {...refineOptObj, workers: 1}]};
        } else {
            // already refining this! have to adjust for +/- cases here
            const targetIndex = mgmtObj.refining.findIndex(refObj => refObj.name === refineOptObj.name);
            // console.log(`Looks like we're goofing around with index ${targetIndex} for adjusting refining`);
            let refiningCopy = JSON.parse(JSON.stringify(mgmtObj.refining));
            if (amt < 0) {
                // subtracting a worker... it looks weird to ADD amt, but amt is -1, sooo
                refiningCopy[targetIndex].workers = refiningCopy[targetIndex].workers + amt;
                if (refiningCopy[targetIndex].workers <= 0) refiningCopy.splice(targetIndex, 1);
            } else {
                // adding a worker
                refiningCopy[targetIndex].workers = refiningCopy[targetIndex].workers + amt;
            }


            newMgmtObj = {...mgmtObj, refining: refiningCopy};
        }

        setMgmtObj(newMgmtObj);

        return saveManagementSettings(newMgmtObj);
    }

    function viewMgmtTile(tileObj, index) {
        // we should probably set the information on the TILEVIEW here, eh?
        // mgmtObj.viewTile and mgmtObj.viewDetails
        // NOTE: now that this is defined within-township on the backend, we could just go ahead and set the infoText according to the actual tile-based incomes we have
        if (tileObj.coord[0] === mgmtObj.viewTile[0] && tileObj.coord[1] === mgmtObj.viewTile[1]) return console.log(`Already viewing that tile!`);
        const newViewTile = [tileObj.coord[0], tileObj.coord[1]];
        let newViewDetails = {type: ``, name: ``, list: []};
        if (tileObj.coord[0] === state.mgmtData.wps[0] && tileObj.coord[1] === state.mgmtData.wps[1]) {
            newViewDetails = {type: 'myTownship', name: `Your Township!`, list: Object.keys(state.locationData.structs).map(structKey => state.locationData.structs[structKey])}
        } else {
            // gotta figure out NAME from the tilecode[0] via map and applicable list from tilecode[not0] stuff
            let contextList = [];
            let infoText = ``;
            switch (state.map[tileObj.coord[0]][tileObj.coord[1]][0]) {
                case 'j': {
                    infoText = `Jungle: +2 wood, +1 game, +1 vegetation`;
                    break;
                }
                case 'w': {
                    infoText = `Wood: +2 wood, +1 game`;
                    break;
                }
                case 't': {
                    infoText = `Taiga: +2 wood, +1 game`;
                    break;
                }
                case 's': {
                    infoText = `Swamp: +1 wood, +1 water, +2 vegetation`;
                    break;
                }
                case 'm': {
                    infoText = `Marsh: +1 water, +2 vegetation`;
                    break;
                }
                case 'b': {
                    infoText = `Bog: +1 water, +2 vegetation`;
                    break;
                }
                case 'v': {
                    infoText = `Savanna: +1 wood, +1 game, +1 vegetation`;
                    break;
                }
                case 'p': {
                    infoText = `Plain: +1 game, +1 vegetation`;
                    break;
                }
                case 'u': {
                    infoText = `Tundra: +1 game`;
                    break;
                }
                case 'n': {
                    infoText = `Dunescape: +1 ore`;
                    break;
                }
                case 'd': {
                    infoText = `Desert: +1 ore, +1 stone`;
                    break;
                }
                case 'a': {
                    infoText = `Arctic: +1 ore`;
                    break;
                }
                case 'c': {
                    infoText = `Cruisewater: +2 water, +1 game`;
                    break;
                }
                case 'l': {
                    infoText = `Lake: +2 water, +1 game`;
                    break;
                }
                case 'f': {
                    infoText = `Frostwater: +1 water`;
                    break;
                }
                case 'g': {
                    infoText = `Greenhill: +1 ore, +1 stone, +1 vegetation`;
                    break;
                }
                case 'h': {
                    infoText = `Hill: +1 ore, +1 stone`;
                    break;
                }
                case 'r': {
                    infoText = `Frostmound: +1 ore, +1 stone`;
                    break;
                }
                case 'M': {
                    infoText = `Mountain: +2 ore, +2 stone`;
                    break;
                }
                default: {
                    infoText = `Ocean: ???`;
                    break;
                }
            }
            newViewDetails = {type: 'tile', name: `Land Tile`, info: infoText, list: [tileObj.gathering ? `Stop Gathering` : `Gather`, ...contextList], index: index};
        }
        setMgmtObj({...mgmtObj, viewTile: newViewTile, viewDetails: {...newViewDetails}});
    }

    function beginUpgrade(structObj) {
        // return console.log(`Receiving upgrade structObj: `, structObj);
        const targetLevel = structObj.level + 1;
        const inventory = state.mgmtData.inventory;
        // return console.log(`So far so good`)
        let constructionCost = JSON.parse(JSON.stringify(state.mgmtData.structUpgradeData[structObj.id].construction));
        
        const { grease, wealth: wealthCost } = constructionCost;
        delete constructionCost.grease;
        delete constructionCost.wealth;
        let buildable = true;
        Object.keys(constructionCost).forEach(reqItemKey => {
            if (inventory[reqItemKey] < constructionCost[reqItemKey]) buildable = false;
        });
        if (state.mgmtData.wealth < wealthCost) buildable = false;
        if (buildable === false) return alert(`You can't even begin to upgrade that with your current means. Gather moar goodies!`);
        return sendSocketData({targetStruct: structObj}, 'begin_struct_upgrade');
    }

    function beginBuild(structPreviewObj) {
        // where in mgmtData do we have buildables hidin'?
        // mgmtData.buildableStructs = {type, displayName, description, construction}
        let constructionCost = {...structPreviewObj.construction};
        const { grease, wealth: wealthCost } = constructionCost;
        delete constructionCost.grease;
        delete constructionCost.wealth;
        let buildable = true;
        const inventory = state.mgmtData.inventory;
        Object.keys(constructionCost).forEach(reqItemKey => {
            if (inventory[reqItemKey] < constructionCost[reqItemKey]) buildable = false;
        });
        if (state.mgmtData.wealth < wealthCost) buildable = false;
        if (buildable === false) return alert(`You can't even begin to build that with your current means. Gather moar goodies!`);
        return sendSocketData({targetStruct: structPreviewObj}, 'begin_struct_build');
    }

    function handleTileAction(listItem) {
        // plenty of DERIVING POWER from mgmtObj.viewTile, mgmtObj.viewDetails, plus the passed listItem itself
        // mostly want to be able to boop and unboop gatherings right now

        // we've lost the ability to 'toggle' gathering on and off 'live,' though it DOES work properly beyond the visual cue
        switch (mgmtObj.viewDetails.type) {
            case 'myTownship': return;
            case 'tile': {
                // aha! now we have INDEX from the fxn above, which is very helpful!
                console.log(`We wish to ${listItem}`)
                if (listItem === 'Gather' || listItem === 'Stop Gathering') {
                    let gatherChange = 0;
                    let newMgmtArr = [...mgmtObj.arr];
                    if (listItem === 'Gather') {
                        const currentSlotsUsed = countCurrentWorkers();
                        const maxSlots = state.mgmtData.townstats.actionSlots;
                        gatherChange = 1;
                        if (currentSlotsUsed >= maxSlots) return alert(`You've already stretched your township's personnel too thin. Clear up some actions first!`);
                    } else gatherChange = -1;
                    newMgmtArr[mgmtObj.viewDetails.index] = {...newMgmtArr[mgmtObj.viewDetails.index], gathering: !newMgmtArr[mgmtObj.viewDetails.index].gathering};
                    const newList = mgmtObj.viewDetails.list.map(listItem => {
                        if (listItem === 'Gather') return 'Stop Gathering';
                        if (listItem === 'Stop Gathering') return 'Gather';
                    });
                    console.log(`GatherChange should be ${gatherChange}`);
                    return saveManagementSettings({...mgmtObj, arr: [...newMgmtArr], viewDetails: {...mgmtObj.viewDetails, list: [...newList]}, gatherNow: mgmtObj.gatherNow + gatherChange});
                    // return setMgmtObj({...mgmtObj, arr: [...newMgmtArr], viewDetails: {...mgmtObj.viewDetails, list: [...newList]}, gatherNow: mgmtObj.gatherNow + gatherChange});
                }

                // HERE: building options, prob'ly

            }
            default: return;
        }
    }

    function saveManagementSettings(optionalServerObj) {

        let newGatheringCoords = [];

        if (optionalServerObj != null && optionalServerObj.type == null) {
            // console.log(`BEHOLD our new REFINING: ${optionalServerObj.refining}`)
            // console.log(`More broadly, our optional server obj: `, optionalServerObj)
            optionalServerObj.arr.forEach(tileObject => {
                if (tileObject.gathering) newGatheringCoords.push(tileObject.coord);
            });
            return sendSocketData({newGatheringCoords: newGatheringCoords, newRefining: [...optionalServerObj.refining], newBuilding: [...optionalServerObj.building]}, 'update_management_data');
        }
        
        mgmtObj.arr.forEach(tileObject => {
            if (tileObject.gathering) newGatheringCoords.push(tileObject.coord);
        });

        return sendSocketData({newGatheringCoords: newGatheringCoords, newRefining: [...mgmtObj.refining], newBuilding: [...mgmtObj.building]}, 'update_management_data');
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyInput);

        return () => window.removeEventListener('keydown', handleKeyInput);
    }, [handleKeyInput]);

    useEffect(() => {

        // automatic login; we'll probably have to trigger a 'manual login' for non-token situations
        socket.emit('login', {token: localStorage.getItem('CTJWT')});

        // BELOW: we'll add socket.on('event', receivedData => {}); for various backend-driven events

        // player_update ... for when the socket insists that we need to update our core player data (hp, mp, effects, ?)
        socket.on('player_update', playerData => {
            // console.log(`RECEIVED NEW PLAYER DATA: `, playerData);
            return dispatch({type: actions.LOAD_PLAYER, payload: playerData});
        });

        socket.on('equipment_update', equipmentData => {
            return dispatch({type: actions.EQUIPMENT_UPDATE, payload: equipmentData});
        });

        socket.on('location_update', locationData => {
            return dispatch({type: actions.UPDATE_LOCATION, payload: locationData});
        });

        socket.on('room_message', newMessage => {
            return dispatch({type: actions.NEW_MESSAGE, payload: newMessage});
        });

        socket.on('chatventure_event', eventObj => {
            console.log(`An event just occurred in your chatventure: `, eventObj);
            // HERE: new dispatch for NEW_CHATVENTURE_EVENT
            // {state?.player?.chatventure?.history?.map((historyEvent, index) => (
            
            return dispatch({type: actions.NEW_CHATVENTURE_EVENT, payload: eventObj});
        });

        socket.on('socket_test', socketDataObj => {
            console.log(`Hi! The socket from the backend has sent this: `, socketDataObj);
        });

        socket.on('reset_token', token => {
            return localStorage.setItem('CTJWT', token);
        })

        socket.on('alert', alertObject => {
            return alert(alertObject.echo);
        });

        socket.on('upon_creation', initialCreationObj => {
            // initialCreationObj.playerData, initialCreationObj.token must be handled
            // and now, with MOAR! let's take in some sweet locationData AND a map!
            localStorage.setItem('CTJWT', initialCreationObj.token);
            dispatch({type: actions.UPDATE_LOCATION, payload: initialCreationObj.locationData})
            return dispatch({type: actions.LOAD_PLAYER, payload: initialCreationObj.playerData});
        });

        socket.on('new_play_map', dasMap => {
            return dispatch({type: actions.LOAD_TEST_MAP, payload: dasMap});
        });

        socket.on('enter_world_map', entryData => {
            return dispatch({type: actions.ENTER_WORLD_MAP, payload: entryData});
        });

        socket.on('potential_friends_list', soulArray => {
            return setPotentialFriendArray(soulArray);
        });

        socket.on('township_management_data', mgmtData => {
            return dispatch({type: actions.LOAD_MANAGEMENT_DATA, payload: mgmtData});
        });
        

    }, [socket]);

    useEffect(() => {
        if (state?.player?.playStack.gps != 'nexus' && state?.player?.chatventureID == null) messageEndRef.current.scrollIntoView();
    }, [state?.locationData?.history]);

    useEffect(() => {
        if (state?.player?.name != null && state?.player?.playStack.mode == null) chatRef.current.focus();
    }, [state?.player?.name]);

    // useEffect(() => {
    //     if (state?.player?.chatventure == null && chatRef != null) chatRef.current.focus();
    // }, [state?.player?.chatventure])

    useEffect(() => {
        let myWalkingGuy;
        if (state?.map != null && state.player.playStack.mode === 'worldMap') {
            // yeah, some hinky shenanigans can occur if we REFRESH and the game 'remembers' us (on loading from backend) as being in worldMap mode :P
            // console.log(`Oh, we're in WORLD MAP MODE, here we goooo!`);
            let canvas = document.getElementById('worldmap');
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,550,550);
            let mapWidth = state?.map[0].length;
            let tileSize = Math.round(550 / state.mapCamera.width);


            // 16px at a time currently
            // tileRef is essentially a proto-atlas
            // jwt smb vpu nda clf ghr M
            let atlasSourceSize = 16;
            const tileRef = {
                forest: 0,
                    j: 0,
                    w: atlasSourceSize * 1,
                    t: atlasSourceSize * 2,
                wetland: 16,
                    s: atlasSourceSize * 3,
                    m: atlasSourceSize * 4,
                    b: atlasSourceSize * 5,
                flatland: 32,
                    v: atlasSourceSize * 6,
                    p: atlasSourceSize * 7,
                    u: atlasSourceSize * 8,
                o: atlasSourceSize * 9,
                dryland: 64,
                    n: atlasSourceSize * 10,
                    d: atlasSourceSize * 11,
                    a: atlasSourceSize * 12,
                freshwater: 80,
                    c: atlasSourceSize * 13,
                    l: atlasSourceSize * 14,
                    f: atlasSourceSize * 15,
                bumpy: 96,
                    g: atlasSourceSize * 16,
                    h: atlasSourceSize * 17,
                    r: atlasSourceSize * 18,
                M: atlasSourceSize * 19,
            }

            const tilemapIMG = new Image();
            tilemapIMG.src = tilemap;
            const townshipIMG = new Image();
            townshipIMG.src = townshipTile;

  
            // console.log(`Let's draw around our character, who is currently at space ${state.mapCamera.x},${state.mapCamera.y}, which is ${state.map[state.mapCamera.x][state.mapCamera.y]}!`);
            // I have some concerns that my x and y axes are flipped here and there? ... worth investigating at some point :P
            for (let y = 0; y < state.mapCamera.width; y++) {
                for (let x = 0; x < state.mapCamera.width; x++) {
                    // HERE: extra spot-inference logic for the coming x and y, rerouting them across the map if necessary
                    let xToDraw = state.player.playStack.wps[0] - Math.floor(state.mapCamera.width / 2) + x;
                    if (xToDraw < 0) xToDraw = mapWidth + xToDraw;
                    if (xToDraw > mapWidth - 1) xToDraw = xToDraw - mapWidth;
                    xToDraw = Math.round(xToDraw);
                    let yToDraw = state.player.playStack.wps[1] - Math.floor(state.mapCamera.width / 2) + y;
                    if (yToDraw < 0) yToDraw = mapWidth + yToDraw;
                    if (yToDraw > mapWidth - 1) yToDraw = yToDraw - mapWidth;
                    yToDraw = Math.round(yToDraw);
                    // drawing 15, 15 from the source helps mitigate visual tiling, at the cost of losing 1/16th of the right and bottom edges of the source tiles
                    // will have to do some SCIENCE to figure out if it's the app I'm using to pixel or just the math in this drawing section
                    ctx.drawImage(tilemapIMG, tileRef[state?.map[xToDraw][yToDraw][0]], 0, 15, 15, Math.round(x * tileSize), Math.round(y * tileSize), tileSize, tileSize);
                    if (state?.map[xToDraw][yToDraw][3] !== '0') {
                        // I think I did x16 sizing, so we'll do 16 * 16 on the source file to see if that draws it well enough
                        ctx.drawImage(townshipIMG, 0, 0, 16 * 16, 16 * 16, Math.round(x * tileSize), Math.round(y * tileSize), tileSize, tileSize);
                    }
                }
            }

            let blue = true;
            let spriteCanvas = document.getElementById('spritemap');
            let spriteCtx = spriteCanvas.getContext('2d');
            spriteCtx.clearRect(0,0,550,550);
            let yTop = tileSize * Math.floor(state.mapCamera.width / 2);
            let yBottom = tileSize * Math.floor(state.mapCamera.width / 2 + 1);
            let xRight = tileSize * Math.floor(state.mapCamera.width / 2 + 1);
            let xLeft = tileSize * Math.floor(state.mapCamera.width / 2);
            let xMiddle = (xRight + xLeft) / 2;
            spriteCtx.fillStyle = blue ? '#0AF' : 'black';
            spriteCtx.beginPath();
            spriteCtx.moveTo(xMiddle, yTop);
            spriteCtx.lineTo(xRight, yBottom);
            spriteCtx.lineTo(xLeft, yBottom);
            
            spriteCtx.fill();

            // works, if standing still; the interval gets nuked otherwise since moving resets the camera :P
            myWalkingGuy = setInterval(() => {
                let spriteCanvas = document.getElementById('spritemap');
                let spriteCtx = spriteCanvas.getContext('2d');
                spriteCtx.clearRect(0,0,550,550);
                let yTop = tileSize * Math.floor(state.mapCamera.width / 2);
                let yBottom = tileSize * Math.floor(state.mapCamera.width / 2 + 1);
                let xRight = tileSize * Math.floor(state.mapCamera.width / 2 + 1);
                let xLeft = tileSize * Math.floor(state.mapCamera.width / 2);
                let xMiddle = (xRight + xLeft) / 2;
                spriteCtx.fillStyle = new Date().getSeconds() % 2 == 0 ? '#0AF' : 'black';
                blue = !blue;
                spriteCtx.beginPath();
                spriteCtx.moveTo(xMiddle, yTop);
                spriteCtx.lineTo(xRight, yBottom);
                spriteCtx.lineTo(xLeft, yBottom);
                
                spriteCtx.fill();
            }, 1000);

            // HERE: wps info
            if (state.map[state.player.playStack.wps[0]][state.player.playStack.wps[1]][3] === 'T') {
                setWPSInfo(`A Township`);
            } else {
                
                switch (state.map[state.player.playStack.wps[0]][state.player.playStack.wps[1]][0]) {
                    case 'j': {
                        setWPSInfo(`Jungle`);
                        break;
                    }
                    case 'w': {
                        setWPSInfo(`Woods`);
                        break;
                    }
                    case 't': {
                        setWPSInfo(`Taiga`);
                        break;
                    }

                    case 's': {
                        setWPSInfo(`Swamp`);
                        break;
                    }
                    case 'm': {
                        setWPSInfo(`Marsh`);
                        break;
                    }
                    case 'b': {
                        setWPSInfo(`Bog`);
                        break;
                    }

                    case 'v': {
                        setWPSInfo(`Savanna`);
                        break;
                    }
                    case 'p': {
                        setWPSInfo(`Plains`);
                        break;
                    }
                    case 'u': {
                        setWPSInfo(`Tundra`);
                        break;
                    }

                    case 'n': {
                        setWPSInfo(`Dunescape Desert`);
                        break;
                    }
                    case 'd': {
                        setWPSInfo(`Rocky Desert`);
                        break;
                    }
                    case 'a': {
                        setWPSInfo(`Arctic Wasteland`);
                        break;
                    }

                    case 'c': {
                        setWPSInfo(`Tropical Lake`);
                        break;
                    }
                    case 'l': {
                        setWPSInfo(`Lake`);
                        break;
                    }
                    case 'f': {
                        setWPSInfo(`Frozen Lake`);
                        break;
                    }

                    case 'g': {
                        setWPSInfo(`Grassy Hill`);
                        break;
                    }
                    case 'h': {
                        setWPSInfo(`Rocky Hill`);
                        break;
                    }
                    case 'r': {
                        setWPSInfo(`Frozen Hill`);
                        break;
                    }

                    case 'M': {
                        setWPSInfo(`Mountain`);
                        break;
                    }


                }
            }
            

        }
        return () => {
            if (myWalkingGuy != null) clearInterval(myWalkingGuy);
        }

        
    }, [state?.player.playStack.wps]);

    // useEffect(() => {
    //     if (state.player.playStack.overlay === 'township_management') {
    //         console.log(`Let's manage it, somehow!`);
    //     }
    // }, [state.player.playStack?.overlay])

    // useEffect(() => {
    //     //!MHRthreat ... eh, we'll handle this separately a bit later, tying it to actual navigation
        
    //     // cribbed rando with 1,100 :P
    //     let threatRoll = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
    //     if (state?.threat > threatRoll) {
    //         console.log(`Oh! A SLIME APPROACHES! Dun dun da dundundun...`);
    //         return dispatch({type: actions.BEGIN_BATTLE});
    //     }
        
    // }, [state?.threat]);

    useEffect(() => {
        // !MHRmgmtmap
        // if (state?.mgmtData != null && state?.map != null && state?.player?.playStack?.mode === 'township_management') {
        if (state?.map != null && state?.mgmtData?.active) {
            let drawing = true;

            // hm, if we're adding 'drawing' to the whole thing then... drawing is always true :P
            // if (mgmtObj.mode === 'gather') drawing = true;
            
            
            // let ctx = canvas.getContext('2d');
            // ctx.clearRect(0,0,550,550);
            let mapWidth = state?.map[0].length;
            // jwt smb vpu nda clf ghr M
            let atlasSourceSize = 16;
            const tileRef = {
                forest: 0,
                    j: 0,
                    w: atlasSourceSize * 1,
                    t: atlasSourceSize * 2,
                wetland: 16,
                    s: atlasSourceSize * 3,
                    m: atlasSourceSize * 4,
                    b: atlasSourceSize * 5,
                flatland: 32,
                    v: atlasSourceSize * 6,
                    p: atlasSourceSize * 7,
                    u: atlasSourceSize * 8,
                o: atlasSourceSize * 9,
                dryland: 64,
                    n: atlasSourceSize * 10,
                    d: atlasSourceSize * 11,
                    a: atlasSourceSize * 12,
                freshwater: 80,
                    c: atlasSourceSize * 13,
                    l: atlasSourceSize * 14,
                    f: atlasSourceSize * 15,
                bumpy: 96,
                    g: atlasSourceSize * 16,
                    h: atlasSourceSize * 17,
                    r: atlasSourceSize * 18,
                M: atlasSourceSize * 19,
            }

            const tilemapIMG = new Image();
            tilemapIMG.src = tilemap;
            const townshipIMG = new Image();
            townshipIMG.src = townshipTile;                
            

            let tileSize = Math.round(550 / 7);
            
            let mgmtObjProto = {arr: []};
            

            // we're in MANAGEMENT MODE! time to define everything we need for display.
            // new mgmtObj exists now, hurrah
            // so we need to redefine our incomes
            let incomes = {};
            const inc = state.mgmtData.townstats;
            incomes.wood = inc.woodIncome;
            incomes.ore = inc.oreIncome;
            incomes.stone = inc.stoneIncome;
            incomes.game = inc.gameIncome;
            incomes.water = inc.waterIncome;
            incomes.veg = inc.vegIncome;
            incomes.commerce = inc.commerce;
            
            mgmtObjProto.incomes = {...incomes};
            
            // eh we can ignore the amps for now, but we'll slot them in here in a bit
            let rates = {};

            let inventory = {...state.mgmtData.inventory};
            

            mgmtObjProto.inventory = {...inventory};

            let storageUsed = 0;
            Object.keys(inventory).forEach(inventoryKey => {
                storageUsed += inventory[inventoryKey];
            });

            mgmtObjProto.storageUsed = storageUsed;
            mgmtObjProto.storageMax = inc.storage;
            
            mgmtObjProto.actionMax = inc.actionSlots;

            mgmtObjProto.building = [...state?.mgmtData?.building];
            mgmtObjProto.refining = [...state?.mgmtData?.refining];

  
            // currently hard-coding the 7x7 that is management window, though we may eventually move to a dynamically defined mapCamera in this case, as well

            let derivedMgmtArr = [];
            // buildingCheckerObj as well? hmm
            let gatheringCheckerObj = {};
            let buildingCheckerObj = {};
            if (state.mgmtData.gatheringCoords.length > 0) {
                state.mgmtData.gatheringCoords.forEach(gathCoord => gatheringCheckerObj[`${gathCoord[0]},${gathCoord[1]}`] = true);
                // state.mgmtData.building.forEach(buildObj => buildingCheckerObj[`${buildObj.coords[0]},${buildObj.coords[1]}`] = true);
            }
            
            let numActiveGathers = 0;
            if (mgmtObj.viewTile == null) {
                mgmtObjProto.viewTile = [...state.mgmtData.wps];
                mgmtObjProto.viewDetails = {
                    type: `myTownship`,
                    name: `Your Township!`,
                    info: ``,
                    index: 24,
                    list: Object.keys(state.locationData.structs).map(structKey => state.locationData.structs[structKey]),
                }
            }

            for (let y = 0; y < 7; y++) {
                for (let x = 0; x < 7; x++) {
                    // HERE: extra spot-inference logic for the coming x and y, rerouting them across the map if necessary
                    let xToDraw = state.mgmtData.wps[0] - Math.floor(7 / 2) + x;
                    if (xToDraw < 0) xToDraw = mapWidth + xToDraw;
                    if (xToDraw > mapWidth - 1) xToDraw = xToDraw - mapWidth;
                    xToDraw = Math.round(xToDraw);
                    let yToDraw = state.mgmtData.wps[1] - Math.floor(7 / 2) + y;
                    if (yToDraw < 0) yToDraw = mapWidth + yToDraw;
                    if (yToDraw > mapWidth - 1) yToDraw = yToDraw - mapWidth;
                    yToDraw = Math.round(yToDraw);
                    let isGathering = false;
                    if (gatheringCheckerObj[`${xToDraw},${yToDraw}`] != null) isGathering = true;
                    if (isGathering) numActiveGathers++;
                    derivedMgmtArr.push({coord: [xToDraw, yToDraw], gathering: isGathering, building: false});
                    if (drawing) {
                        let ctx = document.getElementById('managementmap').getContext('2d');
                        ctx.drawImage(tilemapIMG, tileRef[state?.map[xToDraw][yToDraw][0]], 0, 15, 15, Math.round(x * tileSize), Math.round(y * tileSize), tileSize, tileSize);
                        if (state?.map[xToDraw][yToDraw][3] !== '0') {
                            // I think I did x16 sizing, so we'll do 16 * 16 on the source file to see if that draws it well enough
                            ctx.drawImage(townshipIMG, 0, 0, 16 * 16, 16 * 16, Math.round(x * tileSize), Math.round(y * tileSize), tileSize, tileSize);
                            // hax :P

                        }
                    }
                }
            }

            mgmtObjProto.gatherNow = numActiveGathers;

            // so we have gatherNow, as well as building.length and refining.length to figure out total number of actionSlots being used

            return setMgmtObj({...mgmtObj, ...mgmtObjProto, arr: [...derivedMgmtArr]});
        }
    }, [state?.mgmtData, mgmtObj.mode]);



    return (
        
        <div style={{padding: '1rem', width: '100vw', minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>

            {/* the mildly haxxy way of loading the tilemap beforehand... oh, we should probably do it with township too */}
            <img src={tilemap} id='myTiles' width='112' height='16' style={{height: '0', width: '0', visibility: 'hidden'}} />
            <img src={townshipTile} id='townshippin' width='112' height='16' style={{height: '0', width: '0', visibility: 'hidden'}} />


            <div style={{position: 'fixed', width: '100vw', top: '0', left: '0', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: '8', backgroundColor: 'hsla(240,50%,10%,0.6)', display: (state?.player.playStack.mode === 'worldMap' && state.map != null) ? 'flex' : 'none'}}>
                <button onClick={() => dispatch({type: actions.LOAD_TEST_MAP})} style={{position: 'absolute', top: '0.25rem', left: '0.25rem'}}>X</button>

                <div style={{position: 'absolute', top: '0.25rem', right: '0.25rem', backgroundColor: 'white', height: '2rem', width: '3rem', justifyContent: 'center', alignItems: 'center'}}>
                    {state?.threat}
                </div>
                
                <div style={{position: 'absolute', top: '10%', backgroundColor: 'white', width: '500px', textAlign: 'center', justifyContent: 'center', alignItems: 'center', padding: '0.75rem'}}>
                    {WPSInfo}
                    {WPSInfo === 'A Township' && <button onClick={() => enterTownship()} style={{height: '50px', position: 'absolute', right: '1rem'}}>Enter</button>}
                </div>

                <div style={{position: 'absolute', bottom: '1rem', left: '1rem'}}>
                    <button onClick={() => dispatch({type: actions.ADJUST_MAP_ZOOM, payload: 'world'})}>World</button>
                    <button onClick={() => dispatch({type: actions.ADJUST_MAP_ZOOM, payload: '-'})}>Zoom -</button>
                    <button onClick={() => dispatch({type: actions.ADJUST_MAP_ZOOM, payload: '+'})}>Zoom +</button>
                    <button onClick={() => dispatch({type: actions.ADJUST_MAP_ZOOM, payload: 'walker'})}>Walker</button>
                </div>

                <div style={{position: 'absolute', bottom: '1rem', right: '1rem'}}>
                    <div id='leftbuttoncontainer' style={{alignItems: 'center'}}>
                        <button onClick={() => moveCharacter({x: -1})} style={{height: '50%', marginRight: '0.5rem'}}>LEFT</button>
                    </div>
                    <div id='upanddownbuttoncontainer' style={{flexDirection: 'column'}}>
                        <button onClick={() => moveCharacter({y: -1})} style={{marginBottom: '0.5rem'}}>UP</button>
                        <button onClick={() => moveCharacter({y: 1})}>DOWN</button>
                    </div>
                    <div id='rightbuttoncontainer' style={{alignItems: 'center'}}>
                        <button onClick={() => moveCharacter({x: 1})} style={{height: '50%', marginLeft: '0.5rem'}}>RIGHT</button>
                    </div>
                </div>
                    {/* These canvases should consider living in a div of some sort, right? :P */}
                    <canvas style={{position: 'absolute', zIndex: '11'}} id="worldmap" width='550px' height='550px'></canvas>
                    <canvas style={{position: 'absolute', zIndex: '12'}} id="spritemap" width='550px' height='550px'></canvas>

            </div>

            {/* THIS: Township Management Window */}
            <div style={{position: 'fixed', width: '100vw', top: '0', left: '0', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: '8', backgroundColor: 'hsla(240,50%,10%,0.6)', display: (state?.mgmtData?.active) ? 'flex' : 'none'}}>
                <div style={{width: '90vw', position: 'relative', height: '90vh', overflow: 'scroll', flexDirection: 'column', padding: '1.25rem', alignItems: 'center', backgroundColor: 'white'}}>
                    <button onClick={() => dispatch({type: actions.DISMISS_MANAGE_MODE})} style={{position: 'absolute', top: '0.25rem', left: '0.25rem'}}>X</button>
                    <div>
                        FLUX: {Math.floor(state.mgmtData.flux)} / {state?.mgmtData?.townstats?.fluxMax}
                        <button onClick={() => sendSocketData({soul: state?.player?.name}, 'flux_action_accelerate')}>ACCELERATE</button>
                    </div>

                    <div style={{width: '80%', border: '1px solid hsl(240,80%,80%)', borderRadius: '0.5rem', padding: '1rem', flexWrap: 'wrap', justifyContent: 'space-around'}}>
                        <div style={{height: '100%', marginRight: '1rem', backgroundColor: '#0AF', color: 'white', padding: '1rem', flexDirection: 'column'}}>
                            <div style={{width: '100%'}}>Available Townfolk: {state.mgmtData.townstats.actionSlots - countCurrentWorkers()}</div>
                            <button onClick={recallWorkers} style={{padding: '0.25rem'}}>Recall All Workers</button>
                        </div>
                        <div style={{height: '100%', marginRight: '1rem', backgroundColor: '#0AF', color: 'white', padding: '1rem' }}>Gathering: {countCurrentWorkers('gathering')}</div>
                        <div style={{height: '100%', marginRight: '1rem', backgroundColor: '#0AF', color: 'white', padding: '1rem' }}>Refining: {countCurrentWorkers('refining')}</div>
                        <div style={{height: '100%', marginRight: '1rem', backgroundColor: '#0AF', color: 'white', padding: '1rem' }}>Building: {countCurrentWorkers('building')}</div>
                    </div>
                    {/* <button onClick={saveManagementSettings}>SAVE MANAGEMENT SETTINGS</button> */}

                    {/* The management modal lives here */}
                    {mgmtObj.modal != null &&
                    <div style={{position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'hsla(255,85%,15%,0.7)', zIndex: '15', justifyContent: 'center', alignItems: 'center'}}>
                        <div style={{position: 'absolute', width: '80%', height: '80%', backgroundColor: 'white', zIndex: '16'}}>
                            <button onClick={() => setMgmtObj({...mgmtObj, modal: null})} style={{position: 'absolute', top: '0.5rem', left: '0.5rem'}}>Back</button>

                            {mgmtObj.modal.type === 'refine' &&
                                <div style={{width: '100%', flexDirection: 'column', alignItems: 'center', padding: '1.25rem', overflow: 'scroll'}}>
                                    Let's be refined, shall we? Mmm yes, indubitably.
                                    {state.mgmtData.refineOptions.map((refineOpt, index) =>
                                        <div style={{width: '90%', position: 'relative', flexDirection: 'column', padding: '0.5rem', margin: '0.3rem', borderRadius: '0.25rem', border: '1px solid hsla(240,90%,10%,0.8)'}} key={index}>
                                            <div>{refineOpt.name} {mgmtObj.refining.findIndex(refineObj => refineObj.name === refineOpt.name) > -1 ? ` - Crafting` : ``}</div>
                                            <div style={{margin: '0.25rem'}}>From: [{Object.keys(refineOpt.from).map((sourceMat, index) => <div style={{margin: '0 0.25rem'}} key={index}>{sourceMat} x {refineOpt.from[sourceMat]}</div>)}] </div>
                                            <div style={{margin: '0.25rem'}}>Into: [{Object.keys(refineOpt.into).map((finalMat, index) => <div style={{margin: '0 0.25rem'}} key={index}>{finalMat} x {refineOpt.into[finalMat]}</div>)}]</div>
                                            <div style={{margin: '0.25rem'}}>Time Per: {refineOpt.time} min.</div>
                                            <div style={{position: 'absolute', bottom: '0.25rem', right: '0.25rem'}}>
                                                <button onClick={() => adjustRefining(refineOpt, -1)} style={{width: '40px', height: '40px', padding: '0.5rem', borderRadius: '0.25rem'}}> - </button>
                                                <div style={{width: '40px', height: '40px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0.5rem', borderRadius: '0.25rem', margin: '0 0.25rem'}}>{mgmtObj.refining[mgmtObj.refining.findIndex(refineObj => refineObj.name === refineOpt.name)]?.workers || 0}</div>
                                                <button onClick={() => adjustRefining(refineOpt, 1)} style={{width: '40px', height: '40px', padding: '0.5rem', borderRadius: '0.25rem'}}> + </button>
                                            </div>
                                            
                                        </div>
                                        
                                    )}
                                </div>
                            }

                            {mgmtObj.modal.type === 'build' &&
                                <div style={{width: '100%', flexDirection: 'column', alignItems: 'center', padding: '1.25rem', overflow: 'scroll'}}>
                                    <div>Things you can build:</div>
                                    <div style={{flexDirection: 'column', alignItems: 'center'}}>
                                        {state?.mgmtData?.buildableStructs?.map((structPreviewObject, index) => (
                                            <button onClick={() => beginBuild(structPreviewObject)} key={index} style={{width: '80%', border: '1px solid hsl(240,80%,10%)', marginBottom: '0.5rem'}}>
                                                <div>{structPreviewObject.displayName}</div>
                                                <div>{structPreviewObject.description}</div>
                                                <div>{Object.keys(structPreviewObject.construction).map((buildCostItemKey, index) => {
                                                    return (
                                                        <div key={index} style={{padding: '0.5rem', margin: '0.5rem', border: '1px solid black', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>{structPreviewObject.construction[buildCostItemKey]} {buildCostItemKey} </div>
                                                    )
                                                })}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            }

                            {mgmtObj.modal.type === 'viewStruct' &&
                                <div style={{width: '100%', flexDirection: 'column', alignItems: 'center', padding: '1.25rem', overflow: 'scroll'}}>
                                    <div>{mgmtObj?.modal?.subject?.displayName}</div>
                                    <div style={{margin: '1rem'}}>{mgmtObj.modal.subject.description}</div>
                                    
                                    {state?.mgmtData?.building?.find(buildObj => buildObj?.subject === mgmtObj?.modal?.subject?.id) !== undefined ? (
                                        <div style={{width: '100%', flexDirection: 'column', alignItems: 'center', overflow: 'scroll'}}>
                                            <div>You're currently upgrading this building to Level {mgmtObj?.modal?.subject?.level + 1}!</div>
                                            <div>Should be done around... NEVAH! Mwahaha! I have no easy way to get the info I want right now. Whoops.</div>
                                        </div>
                                    ) : (
                                        <div style={{width: '100%', flexDirection: 'column', alignItems: 'center', overflow: 'scroll'}}>
                                            <div>Struct Specializations:</div>
                                            <div style={{flexWrap: 'wrap', alignItems: 'center', flexDirection: 'column', width: '80%'}}>
                                                {Object.keys(state?.mgmtData?.potentialStructSpecs[mgmtObj.modal.subject.id])?.map((specName, index) => (
                                                    <div style={{width: '100%', padding: '1rem', border: '1px solid black', margin: '1rem 0'}} key={index}>{specName}</div>
                                                ))}
                                            </div>
                                            <div>Costs to upgrade to {state.mgmtData.structUpgradeData[mgmtObj.modal.subject.id].displayName}, Level {state?.mgmtData?.structs[mgmtObj?.modal?.subject?.id].level + 1}:</div>
                                            <div>{Object.keys(state?.mgmtData?.structUpgradeData[mgmtObj.modal.subject.id]?.construction).map((reqItem, index) => {
                                                // eh just do a split return here if we got grease :P
                                                if (reqItem === 'grease') return null;
                                                let currentAmount = Math.floor(state?.mgmtData?.inventory[reqItem]) || 0;
                                                if (reqItem === 'wealth') currentAmount = Math.floor(state?.mgmtData?.wealth) || 0;
                                                return (
                                                    <div style={{margin: '0.5rem', padding: '1rem', border: '1px solid black'}} key={index}>{currentAmount} / {state.mgmtData.structUpgradeData[mgmtObj.modal.subject.id].construction[reqItem]} {reqItem}</div>
                                                )
                                            })}</div>
                                            <div>Upgrade Time: {state.mgmtData.structUpgradeData[mgmtObj.modal.subject.id].construction.grease / 10} hour(s)</div>
                                            
                                            <button style={{marginTop: '1rem'}} onClick={() => beginUpgrade(mgmtObj.modal.subject)}>Upgrade!</button>                                            
                                        </div>
                                    )}

                                </div>
                            }


                        </div>
                    </div>
                    }


                    {/* NOTE: this all works ok because everything is FIXED at 550px for the canvas(es)... at some point we're gonna have to dynamically resize, so this will have to change */}
                    {/* NOTE ALSO: this woooorks, but it's a bit sluggish due to shenanigans :P... we should consider going ahead to speed it back up again */}
                    {/* <div style={{display: mgmtObj.mode === 'gather' ? 'flex' : 'none', position: 'relative', width: '550px', height: '550px', flexDirection: 'row', flexWrap: 'wrap'}}> */}
                        
                    {/* OMNI DIV */}
                    <div style={{position: 'relative', width: '100%', flexDirection: 'row'}}>
                            {/* LEFT COLUMN: overview, income, and REFINE boops */}
                            <div style={{flexDirection: 'column', width: '20%'}}>
                                <div>[ Overview ]</div>
                                <div>Storage: {Math.floor(mgmtObj.storageUsed)} / {mgmtObj.storageMax}</div>
                                <div>Wealth: {Math.floor(state?.mgmtData?.wealth)} (+ {state.mgmtData.townstats.commerce * 5}/hr)</div>
                                <button onClick={() => openModal('refine')}>Refine!</button>
                                {Object.keys(mgmtObj?.inventory).map((invKey, index) =>
                                    <div style={{display: mgmtObj.inventory[invKey] > 0 ? 'flex': 'none', width: '100%', border: '1px solid #AAA', padding: '0.5rem'}} key={index}>{invKey}: {Math.floor(mgmtObj.inventory[invKey])} {mgmtObj.incomes[invKey] > 0 ? `(+ ${mgmtObj.incomes[invKey]}/hr)` : ``}</div>
                                )}
                            </div>

                            {/* MIDDLE COLUMN: mapsicles */}
                            <div style={{position: 'relative', overflow: 'scroll', width: '60%', minHeight: '550px', justifyContent: 'center'}}>
                                <div style={{zIndex: '12', position: 'absolute', flexWrap: 'wrap', width: '550px', height: '550px'}}>
                                    {mgmtObj.arr.map((mgmtTile, index) => (
                                        <div onClick={() => viewMgmtTile(mgmtTile, index)} key={index} style={{width: 'calc(550px / 7)', height: 'calc(550px / 7)', boxSizing: 'border-box', border: (mgmtTile.coord[0] === mgmtObj.viewTile[0] && mgmtTile.coord[1] === mgmtObj.viewTile[1]) ? '2px solid white' : '1px solid black', backgroundColor: mgmtTile.gathering ? 'hsla(120,30%,90%,0.5)' : 'transparent', zIndex: '12'}}></div>
                                    ))}
                                </div>                        
                            

                                <canvas id="managementmap" width='550px' height='550px' style={{zIndex: '11', position: 'absolute'}} ></canvas>
                            </div>

                            {/* RIGHT COLUMN: inspection area - details on what we're lookin' at plus actionables for that tile/context */}
                            <div style={{flexDirection: 'column', width: '20%'}}>
                                <div>[ {mgmtObj?.viewDetails?.name} ]</div>
                                <div>{mgmtObj?.viewDetails?.info}</div>

                                {(mgmtObj?.viewDetails?.type === 'myTownship' && state?.mgmtData != null) &&
                                    <div style={{flexDirection: 'column', width: '100%'}}>
                                        <div>{state?.mgmtData?.townstats?.buildCapacity - state?.mgmtData?.weight - state?.mgmtData?.building?.filter(buildObj => buildObj.type === 'build')?.length} builds left</div>
                                        <button onClick={() => setMgmtObj({...mgmtObj, modal: {type: 'build'}})} style={{border: '1px solid black', marginBottom: '0.5rem'}}>+ Build!</button>
                                        {Object.keys(state?.mgmtData?.structs).map((structKey, index) => 
                                            {
                                                const listItem = state?.mgmtData?.structs[structKey];
                                                const upgradeObj = state?.mgmtData?.building?.filter(buildObj => buildObj?.subject === listItem.id)[0];
                                                const upgrading = upgradeObj != null ? true : false;
                                                return (
                                                    <div key={index} style={{border: '1px solid black', flexDirection: 'column', marginBottom: '0.5rem'}}>
                                                        <button onClick={() => setMgmtObj({...mgmtObj, modal: {type: 'viewStruct', subject: listItem}})}>{listItem?.displayName} (Lv.{listItem?.level})</button>
                                                        <div style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>{upgrading ? ` UPGRADING (${Math.floor(upgradeObj.progress / upgradeObj.goal * 100)}%)` : ''}</div>
                                                        {upgrading &&
                                                            <div style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                                                                <button onClick={() => adjustUpgrading(upgradeObj, -1)} style={{width: '30px', padding: '0.5rem', height: '30px', borderRadius: '0.5rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}> - </button>
                                                                <div style={{width: '30px', padding: '0.5rem', height: '30px', backgroundColor: 'white', color: 'black', borderRadius: '0.5rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>{upgradeObj?.workers}</div>
                                                                <button onClick={() => adjustUpgrading(upgradeObj, 1)} style={{width: '30px', padding: '0.5rem', height: '30px', borderRadius: '0.5rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}> + </button>
                                                            </div>
                                                        }
                                                    </div>
                                                )
                                            }
                                        )}
                                        
                                        {state?.mgmtData?.building?.map((buildProj, index) =>
                                            {
                                                if (buildProj.type === 'build') return (
                                                    <div style={{marginBottom: '0.5rem', flexDirection: 'column', border: '1px solid black'}} key={index}>
                                                        <button>BUILDING: {buildProj.subject[0].toUpperCase()}{buildProj.subject.substring(1)} ({Math.floor(buildProj.progress / buildProj.goal * 100)}%)</button>
                                                        <div style={{width: '100%', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                                                            <button onClick={() => adjustBuilding(index, -1)} style={{width: '30px', padding: '0.5rem', height: '30px', borderRadius: '0.5rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}> - </button>
                                                            <div style={{width: '30px', padding: '0.5rem', height: '30px', backgroundColor: 'white', color: 'black', borderRadius: '0.5rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>{buildProj.workers}</div>
                                                            <button onClick={() => adjustBuilding(index, 1)} style={{width: '30px', padding: '0.5rem', height: '30px', borderRadius: '0.5rem', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}> + </button>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                        )}
                                        
                                    </div>
                                }

                                {mgmtObj?.viewDetails?.type === 'tile' &&
                                    <div style={{flexDirection: 'column', width: '100%'}}>
                                        {mgmtObj?.viewDetails?.list?.map((listItem, index) => 
                                            <button onClick={() => handleTileAction(listItem)} style={{marginBottom: '0.5rem'}} key={index}>{listItem}</button>
                                        )}
                                    </div>
                                }

                            </div>

                    </div>
                    
                    {/* </div> */}
                    

                    {/*
                        THIS: mgmt tile overlay; wrap in a div specific to each scenario below, take it out of the flow along with canvas above, and line 'em up
               
                    */}

                    {state?.mgmtData != null ? (
                        <div>

                            { mgmtObj.mode === 'overview' && 
                            <div style={{flexDirection: 'column'}}>
                                    Hourly Income:
                                    <div style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                        {
                                            Object.keys(mgmtObj.incomes).map((incKey, index) =>
                                                <div style={{width: '50%', padding: '0.5rem', border: '1px solid #AAA'}} key={index}>{incKey}: {Math.floor(mgmtObj.incomes[incKey])}</div>
                                            )
                                        }
                                    </div>
                                    <div>Total Township Actions Available: {state?.mgmtData?.townstats?.actionSlots}</div>
                                    <div>Gathering Slots Used: {mgmtObj.gatherNow}</div>
                                    <div>Building Slots Used: {mgmtObj?.building?.length}</div>
                                    <div>Refining Slots Used: {mgmtObj?.refining?.length}</div>
                                    <div>Inventory: {Math.floor(mgmtObj.storageUsed)} / {mgmtObj.storageMax}</div>
                                    <div style={{flexDirection: 'row', flexWrap: 'wrap', width: '500px'}}>
                                        {Object.keys(mgmtObj?.inventory).map((invKey, index) =>
                                            <div style={{display: mgmtObj.inventory[invKey] > 0 ? 'flex': 'none', width: '50%', border: '1px solid #AAA', padding: '0.5rem'}} key={index}>{invKey}: {Math.floor(mgmtObj.inventory[invKey])}</div>
                                        )}

                                    </div>
                                    <div>Wealth: {Math.floor(state?.mgmtData?.wealth) || 0}</div>
                                    <div>Build Capacity: {state?.mgmtData?.weight} / 5</div>
                            </div>
                            }

                            { mgmtObj.mode === 'gather' && 
                            <div style={{width: '100%', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'}}>

                                Current Incomes: 
                                {
                                    Object.keys(mgmtObj.incomes).map((incKey, index) =>
                                        <div style={{padding: '0.5rem', border: '1px solid #AAA'}} key={index}>{incKey}: {mgmtObj.incomes[incKey]}</div>
                                    )
                                }
                                <br/>
                                Proposed Incomes: ???
                                <br/>
                                <div style={{flexDirection: 'column'}}>
                                    <div>Gathering Slots Used: {mgmtObj.gatherNow}</div>
                                    <div>Storage Used: {Math.floor(mgmtObj.storageUsed)} / {mgmtObj.storageMax}</div>
                                </div>



                            </div>
                            }

                            { mgmtObj.mode === 'refine' && 
                            <div style={{width: '100%', flexWrap: 'wrap', alignItems: 'center'}}>

                                
                                {state?.mgmtData?.refineOptions?.map((refOption, index) => 
                                    <button style={{marginRight: '0.5rem'}} key={index}>{refOption.name}</button>
                                )}



                            </div>
                            }

                            { mgmtObj.mode === 'build' && 
                            <div style={{width: '100%', flexWrap: 'wrap', alignItems: 'center'}}>

                                
                                I AM BUILD MENU. Or am I? Not really, I suppose. STRUCTS!
                                ... ooh. Yeah, we're gonna have to trim all this; we went another way. :P


                            </div>
                            }                            



                        </div>
                    ) : (<></>) }



                    
                </div>

            </div>



            <div style={{position: 'fixed', width: '100vw', top: '0', left: '0', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: '8', backgroundColor: 'hsla(240,50%,10%,0.6)', display: state?.player?.playStack?.chatventure == null ? 'none' : 'flex'}}>
                <ChatventureContent state={state} dispatch={dispatch} sendSocketData={sendSocketData} logout={logout} />
            </div>
            <div style={{position: 'fixed', width: '100vw', top: '0', left: '0', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: '9', backgroundColor: 'hsla(240,50%,10%,0.6)', display: state?.player?.playStack?.overlay === 'none' ? 'none' : 'flex'}}>
                <OverlayContent state={state} dispatch={dispatch} sendSocketData={sendSocketData} logout={logout} />
            </div>

            <div id="toprow" style={{width: '100%', border: '1px solid black', height: '100px', alignItems: 'center', padding: '1rem'}}>
                {/* NEXT: upgrade to some sort of player status HUD situation rather than simple button in both cases */}
                {state?.player?.name == null ? (
                    <button onClick={handleWho} style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>{state?.player?.name || `Who am I...?`}</button>
                ) : (
                    <button onClick={() => dispatch({type: actions.OPEN_PLAYER_MENU})} style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>{state?.player?.name || `Who am I...?`}</button>
                )}
                <button onClick={() => viewTownshipManagement()} style={{height: '100%', justifyContent: 'center', marginLeft: '0.75rem', alignItems: 'center'}}>{state?.locationData?.nickname || 'Zenithica'}</button>
                {/* <button onClick={visitNexus} style={{display: state?.player?.name == null ? 'none' : 'flex', marginLeft: '0.75rem', height: '100%'}}>NEXUS</button> */}
                {/* <button onClick={requestAMap} style={{display: state?.player?.name == null ? 'none' : 'flex', marginLeft: '0.75rem', height: '100%'}}>GIMME MAP</button> */}
            </div>

            {state?.player?.playStack.gps === 'nexus' ? (
                // shenanigans: assigning chatRef to this maaay fix some awkward problems. or make them worse. or make new ones? we'll find out!
                <div ref={chatRef} style={{flexDirection: 'column', width: '100%'}}>
                    VISIT A PLACE, FRIENDO:
                    {state?.player?.following.map((name, index) => 
                        <button onClick={() => visitTownship(name)} key={index} style={{marginTop: '1rem'}}>{name}</button>
                    )}
                    <div style={{width: '100%', marginTop: '1rem', flexDirection: 'column'}}>
                        <button style={{display: potentialFriendArray.length > 0 ? 'none' : 'flex'}} onClick={searchPotentialFriends}>Search for Friends</button>
                        {potentialFriendArray.map((soulName, index) => (
                            <div key={index} style={{width: '100%', border: '1px solid black', borderRadius: '0.75rem', padding: '1rem', flexDirection: 'column'}}>
                                <div style={{width: '100%'}}>{soulName}</div>
                                <div><button onClick={() => followSoul(soulName)}>Follow</button></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div id="midsection" style={{width: '100%', flexDirection: 'column', padding: '1rem', border: '1px solid green', overflow: 'scroll', height: 'calc(100% - 100px)'}}>
                
                    <div style={{width: '100%', padding: '0.75rem', borderBottom: '1px solid hsl(240,90%,10%)', maxHeight: '20vh', flexDirection: 'column', border: '1px solid aqua'}}>
                        <div style={{width: '100%', flexWrap: 'wrap'}}>
                            {/* {Object.keys(state?.locationData?.structs)?.map((structKey, index) => {
                                const thisStruct = state.locationData.structs[structKey];
                                return (
                                    <div onClick={() => handleStructInteractionRequest(thisStruct, thisStruct?.interactions?.default)} style={{marginRight: '0.75rem', height: '100px', width: '100px', border: '1px solid hsl(240,50%,20%)', flexDirection: 'column', alignItems: 'center'}} key={index}>
                                        <div style={{width: '100%', height: '70px', width: '70px', marginTop: '10px', backgroundColor: "#0AF"}}></div>
                                        <div style={{justifyContent: 'center', alignItems: 'center', height: '20px'}}>{state.locationData.structs[structKey].displayName}</div>
                                    </div>
                                )
                            })} */}
                            {/* MHRinteract */}
                            {state?.locationData?.interactions?.map((interaction, index) => 
                                <button style={{marginRight: '0.5rem'}} onClick={() => handleInteractionRequest(interaction)} key={index}>{interaction[0].toUpperCase()}{interaction.substring(1)}</button>
                            )}
                        </div>
                        <div style={{marginTop: '1rem'}}>{state?.locationData?.description || `You're getting your bearings...`}</div>
                    </div>

                    {/* NOTE: adjust the height of the below later, but ensure height is well-defined so that overflow scrolls properly */}
                    <div style={{width: '100%', flexDirection: 'column', border: '2px solid #0AF', height: '55vh', overflow: 'scroll'}}>
                        {state?.locationData?.history.slice(state?.locationData?.history?.length - 21, state?.locationData?.history?.length).map((historyObj, index) => (
                            <ChatEvent key={index} chatEventObject={historyObj} />
                            
                        ))}
                        <div ref={messageEndRef} />
                        
                    </div>

                    <form style={{display: 'flex', width: '100%'}} onSubmit={sendChat}>
                        <input type='text' disabled={state?.player?.name == null} ref={chatRef} autoFocus={state?.player?.name != null} style={{display: 'flex', width: 'calc(100% - 50px)'}} value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder={state?.player?.name == null ? `You've forgotten your voice.` : `Hello, World`} />
                        <button disabled={state?.player?.name == null} style={{width: '50px'}} onClick={sendChat}>{'>'}</button>
                    </form>
                
                </div>
            )}

            

        </div>
    )

}







function ChatventureContent({state, dispatch, sendSocketData, logout}) {
    const [chatventureChat, setChatventureChat] = useState('');
    const chatventureMessageEndRef = useRef(null);
    

    function handleChatventureOptionSelection(chatventureOption) {
        // console.log(`Booped ${chatventureOption.echo} to try to request ${chatventureOption.onSelect}`)
        return sendSocketData({chatventureOption}, 'select_chatventure_option');
        // return alert(`You have chosen to ${chatventureOption.echo}, which on selection should request: ${chatventureOption.onSelect}`);
    }

    function handleMenuSelection(menuItemObj) {
        return sendSocketData(menuItemObj, 'select_chatventure_menu_item');
    }

    function sendChatventureChat(e) {
        e.preventDefault();
        sendSocketData({type: 'chat', echo: chatventureChat}, 'chatventure_action');
        return setChatventureChat('');
    }
    /*
        NOTE: should also 'cap' the display of the chatventure history, as for normal township chats



        CURRENT CHATVENTURE_EVENT MODEL
        const chatventureEvent = {
            echo: chatventureActionObj.echo,
            type: chatventureActionObj.type,
            timestamp: new Date(),
            agent: thisPlayer.name,
            target: null,
            icon: thisPlayer.icon,
            voice: thisPlayer.voice
        };

        class Chatventure {
            constructor(creator, location) {
                this.id = creator != null ? generateRandomID(creator.name) : generateRandomID('chv');
                this.type = 'chill';
                this.creator = creator.name;
                this.players = {};
                this.players[creator.name] = creator;
                this.mobs = {};
                if (creator.party != null) {
                    Object.keys(creator.party).forEach(entityID => {
                        if (creator.party[entityID].entityType === 'player') this.players[entityID] = creator.party[entityID];
                        if (creator.party[entityID].entityType === 'npc') this.mobs[entityID] = creator.party[entityID];
                        if (creator.party[entityID].entityType === 'mob') this.mobs[entityID] = creator.party[entityID];
                    });
                }
                this.joinLimit = 100;
                this.joinRules = {};
                this.events = {};
                this.mode = 'chill';
                this.options = {};
                this.staging = {};
                this.location = location || {gps: `Zenithica`, atMap: `townMap`, struct: `nexus`, area: null};
                this.history = [];
            }
        }


        so it makes sense to map down PLAYERS and MOBS, right? At least that.
        ... man, how to figure out PARTY/GROUP stuff. May as well think about that now.

        
    */
// !MHR
    useEffect(() => {
        // console.log(`state.player has changed, let's look at the chatventure history while we're here: `, state?.player?.chatventure?.history)
        // console.log(`state.player has changed`);
    }, [state.player]);

    useEffect(() => {
        // console.log(`New chatventure event received!`);
        chatventureMessageEndRef.current.scrollIntoView();
    }, [state?.player?.chatventure?.history]);

    // below we have the 'chill' mode enabled... but what of OTHER MODES? let's consider COMBAT! woo!... overlay within an overlay, noice
    if (state?.player?.playStack?.chatventure != null) return (
        <div style={{backgroundColor: 'white', padding: '1rem', width: 'calc(300px + 60vw)', maxWidth: '95vw', minHeight: '90vh', flexDirection: 'column'}}>

            {/* MENU OVERLAY, PROBABLY */}
            <div style={{display: state?.player?.playStack?.mode !== 'chill' ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'hsla(240,10%,10%,0.6)', zIndex: '11'}}>
                
                <div style={{backgroundColor: 'white', width: 'calc(300px + 60vw)', maxWidth: '95vw', height: '80vh', flexDirection: 'column', alignItems: 'center'}}>
                    {state.player.playStack.mode === 'menu' && (
                    <div>
                        <div>{state?.player?.playStack?.menu?.prompt}</div>
                        <div style={{flexDirection: 'column'}}>
                            {state?.player?.playStack?.menu?.menuItems?.map((menuItemObj, index) => (
                                <button onClick={() => handleMenuSelection(menuItemObj)} key={index}>{menuItemObj.echo}</button>
                            ))}
                        </div>
                    </div>
                    )}
                    {state.player.playStack.mode === 'battle' && (
                        <div>
                            OSHIZ A BATTLE IS HAPPENING BRACE YOUR BUTT AND GIRD YO LOINS
                        </div>
                    )}

                </div>
            </div>

            <div style={{width: '100%'}}>[ You Are Here - Wherever This Is ]</div>
            <div style={{width: '100%'}}>{state?.player?.chatventure?.staging?.description}</div>

            <div style={{width: '100%'}}>
                {/* CHATVENTURING OPTIONS */}
                {Object.keys(state?.player?.chatventure?.options).map((chatventureOptionKey, index) => {
                    const thisOption = state?.player?.chatventure?.options[chatventureOptionKey];
                    // console.log(`thisOption looks like this: `, thisOption);
                    const { echo } = thisOption || 'NULLY';
                    return <button key={index} onClick={() => handleChatventureOptionSelection(thisOption)} style={{marginRight: '1rem'}}>{echo}</button>
            })}
            </div>

            <div style={{width: '100%'}}>
                {/* GROUPS? PLAYERS? MOBS? MOB GROUPS??? FACTIONS?!?!? I don't even know, good sirs */}
            </div>

            <div style={{width: '100%', border: '1px solid #0AF', height: '70vh', padding: '0 0.75rem', flexDirection: 'column', overflow: 'scroll'}}>
                {state?.player?.chatventure?.history?.map((historyEvent, index) => (
                    <ChatEvent key={index} chatEventObject={historyEvent} />
                ))}
                <div ref={chatventureMessageEndRef} />
            </div>
            <form style={{display: 'flex', width: '100%'}} onSubmit={sendChatventureChat}>
                <input type='text' autoFocus={true} style={{display: 'flex', width: 'calc(100% - 50px)'}} value={chatventureChat} onChange={e => setChatventureChat(e.target.value)} placeholder={`Hello Smaller World`} />
                <button style={{width: '50px'}} onClick={sendChatventureChat}>{'>'}</button>
            </form>            
            
        </div>
    )

    return <div ref={chatventureMessageEndRef}></div>
}





// this poor component feels soon to be wildly overloaded :P
// changed my mind, going to keep using OverlayContent here, and may refactor out the login-specific stuff instead
function OverlayContent({state, dispatch, sendSocketData, logout}) {
    // hm, getting stale townshipName data? ... investigate further
    const [loginCredentials, setLoginCredentials] = useState({name: '', password: ''});
    const [townshipName, setTownshipName] = useState('');
    const [subMenu, setSubMenu] = useState({
        type: null,
        meta: null
    });

    function dismissMe() {
        setTownshipName(state?.locationData?.nickname || '');
        setLoginCredentials({name: '', password: ''});
        return dispatch({type: actions.DISMISS_OVERLAY});
    }

    function handleLogin(e) {
        e.preventDefault();
        if (loginCredentials.name.length < 5) return enterCharacterCreation();
        

        // ADD: actual login socket boopty
        setLoginCredentials({name: '', password: ''});
        return sendSocketData(loginCredentials, 'login');
        
    }

    function enterCharacterCreation() {
        setLoginCredentials({name: '', password: ''});
        return dispatch({type: actions.PROMPT_CHARACTER_CREATION});
    }

    function openEquipmentMenu(slot) {
        /*
        
            How to Equip your DRAGON
            - clicking on an equipment slot should bring up a new menu to [Remove] or scroll through other stuff to equip, based on an inventory filter
            - [Remove] shouldn't show up if nothing is equipped
            - client knows inventory and equipment, so can 'show' but not 'tell'
            - CLICK to show stat changes upon new equipment, then EQUIP button to equip? or just click-to-equip?
        
        */
       return setSubMenu({type: 'equip', meta: slot});
        // return alert(`You wish to do something with the equipment on ${slot}?`);
    }

    function parseSlotMatch(item) {
        // receives item, including item.slot, and we need to filter if that item.slot is compatible with subMenu.meta, which is equal to the player.equipment.slot
        // this is basically just a way around rightHand and leftHand matching up to item.slot: hand (doublehand will have to be some special flag somewhere under this model)
        // can also be handy later if we implement accessory2, trinket2, etc... quick update to this fxn, done!
        let matchVar;
        if (subMenu.meta === 'rightHand' || subMenu.meta === 'leftHand') matchVar = 'hand'
            else matchVar = subMenu.meta;
        if (item.slot === subMenu.meta) return true
            else return false;
    }

    function serverEquip(item) {
        if (item === null) item = {name: null};
        sendSocketData({slot: subMenu.meta, item: item}, 'equip_item');
        return setSubMenu({type: null, meta: null});
    }

    function handleStructInteractionRequest(structToInteract, interaction) {
        console.log(`Interacting with struct `, structToInteract);
        // return sendSocketData({soulTarget: structToInteract.soulRef, interaction: interaction}, 'interact_with_struct');
    }

    useEffect(() => {
        setTownshipName(state?.locationData?.nickname)
    }, [state]);

    switch (state?.player?.playStack?.overlay) {
        case 'login': {
            return (
                <div style={{width: 'calc(300px + 30%)', maxWidth: '85%', minHeight: '50vh', padding: '1rem', textAlign: 'center', flexDirection: 'column', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{width: '100%', marginBottom: '1rem', justifyContent: 'center'}}>You close your eyes.<br/>A voice in your head gently inquires, "Do you remember who you are?"</div>
                    <form onSubmit={handleLogin} style={{display: 'flex', alignItems: 'center', gap: '1rem', width: '50%', flexDirection: 'column'}}>
                        <input type='text' autoFocus={true} value={loginCredentials.name} onChange={e => setLoginCredentials({...loginCredentials, name: e.target.value})} placeholder='My name is...' />
                        <input type='text' value={loginCredentials.password} onChange={e => setLoginCredentials({...loginCredentials, password: e.target.value})} placeholder='My mnemonic is...' />
                        {/* {loginCredentials.name.length >= 5 && (
                            <>
                                <input type='text' value={loginCredentials.password} onChange={e => setLoginCredentials({...loginCredentials, password: e.target.value})} placeholder='My identity mnemonic is... ' />
                                
                            </>
                        )} */}

                        <button type="submit" onClick={handleLogin}>{loginCredentials.name.length >= 5 ? `Yes. My name is ${loginCredentials.name}.` : `I don't have a name... do I?`}</button>
                        <button type="button" onClick={dismissMe}>(No, it's nothing. Open your eyes.)</button>
                    </form>
                </div>
            )
            break;
        }

        case 'character_creation': {
            return (
                <CharacterCreationComponent dispatch={dispatch} sendSocketData={sendSocketData} />
            )
        }

        case 'player_management': {
            return (
                <OverlayContentContainer>



                    {/* The prototype for equipment/inventory sub-menu container... in this case, we'll do EQUIPMENT SWAP, so we'll use subMenu.meta to filter */}
                    <div style={{display: subMenu.type != null ? 'flex' : 'none', position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: '10', width: '100%', height: '100%', backgroundColor: 'hsla(240,10%,10%,0.5)'}}>
                        <button style={{position: 'absolute', top: '1rem', left: '1rem'}} onClick={() => setSubMenu({type: null, meta: null})}>X</button>
                        <div style={{width: '80%', minHeight: '80%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', flexWrap: 'wrap', gap: '1rem'}}>
                            {(subMenu?.meta != null && state?.player?.equipment[subMenu?.meta] != null) && <button style={{width: '120px', height: '50px'}} onClick={() => serverEquip(null)}>UNEQUIP</button>}
                            {state?.player?.inventory?.filter(parseSlotMatch).map((item, index) => (
                                <button style={{width: '120px', height: '50px'}} onClick={() => serverEquip(item)} key={index}>{item.name}</button>
                            ))}
                        </div>
                    </div>



                    <div>{state?.player?.name}: {state?.player?.currentClass?.main?.toUpperCase()}</div>

                    <div style={{alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center'}}>STATS! Which we should ABSOLUTELY do manually in the near future.</div>
                    <div style={{gap: '1rem', flexWrap: 'wrap', padding: '1rem', alignItems: 'center', justifyContent: 'center'}}>
                        {Object.keys(state?.player?.stats)?.map((stat, index) => (
                            <div key={index}>{stat.toUpperCase()}: {state.player.stats[stat]}</div>
                        ))}
                    </div>

                    


                    {/* This would be a great spot to introduce an EquipmentSlot component */}
                    {/* Also, even on mobile, we could readily structure this as a double-column concept */}
                    <div style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <div style={{width: '100%', padding: '0.75rem'}}>EQUIPMENT</div>
                        <button onClick={() => openEquipmentMenu('rightHand')} style={{justifyContent: 'flex-start', width: '100%', flexDirection: 'row', borderBottom: '1px solid #CCC', alignItems: 'center'}}>
                            <div style={{justifyContent: 'flex-end', width: '120px', paddingRight: '0.5rem'}}>R.HAND</div>
                            <div style={{paddingLeft: '0.5rem'}}>{state?.player?.equipment?.rightHand?.name || `(nothing)`}</div>
                        </button>
                        <button onClick={() => openEquipmentMenu('leftHand')} style={{justifyContent: 'flex-start', width: '100%', flexDirection: 'row', borderBottom: '1px solid #CCC', alignItems: 'center'}}>
                            <div style={{justifyContent: 'flex-end', width: '120px', paddingRight: '0.5rem'}}>L.HAND</div>
                            <div style={{paddingLeft: '0.5rem'}}>{state?.player?.equipment?.leftHand?.name || `(nothing)`}</div>
                        </button>
                        <button onClick={() => openEquipmentMenu('head')} style={{justifyContent: 'flex-start', width: '100%', flexDirection: 'row', borderBottom: '1px solid #CCC', alignItems: 'center'}}>
                            <div style={{justifyContent: 'flex-end', width: '120px', paddingRight: '0.5rem'}}>HEAD</div>
                            <div style={{paddingLeft: '0.5rem'}}>{state?.player?.equipment?.head?.name || `(nothing)`}</div>
                        </button>
                        <button onClick={() => openEquipmentMenu('body')} style={{justifyContent: 'flex-start', width: '100%', flexDirection: 'row', borderBottom: '1px solid #CCC', alignItems: 'center'}}>
                            <div style={{justifyContent: 'flex-end', width: '120px', paddingRight: '0.5rem'}}>BODY</div>
                            <div style={{paddingLeft: '0.5rem'}}>{state?.player?.equipment?.body?.name || `(nothing)`}</div>
                        </button>
                        <button onClick={() => openEquipmentMenu('accessory')} style={{justifyContent: 'flex-start', width: '100%', flexDirection: 'row', borderBottom: '1px solid #CCC', alignItems: 'center'}}>
                            <div style={{justifyContent: 'flex-end', width: '120px', paddingRight: '0.5rem'}}>ACCESSORY</div>
                            <div style={{paddingLeft: '0.5rem'}}>{state?.player?.equipment?.accessory?.name || `(nothing)`}</div>
                        </button>
                        <button onClick={() => openEquipmentMenu('trinket')} style={{justifyContent: 'flex-start', width: '100%', flexDirection: 'row', alignItems: 'center'}}>
                            <div style={{justifyContent: 'flex-end', width: '120px', paddingRight: '0.5rem'}}>TRINKET</div>
                            <div style={{paddingLeft: '0.5rem'}}>{state?.player?.equipment?.trinket?.name || `(nothing)`}</div>
                        </button>
                    </div>


                    <div style={{marginTop: '1rem'}}>
                        INVENTORY
                        {state?.player?.inventory?.map((itemObj, index) => (
                            <button key={index}>{itemObj.name}</button>
                        ))}
                    </div>
                    <button style={{position: 'absolute', top: '1rem', left: '1rem'}} onClick={dismissMe}>X</button>
                    <button style={{marginTop: '1rem'}} onClick={logout}>Logout</button>
                </OverlayContentContainer>          
            )
        }

        case 'township_management': {
            // ok, let's see... when we click this, if NOT Zenithica, we want to see our overworld in a map
            // and boopable boxes for management of resource gathering... two expeditions possible at start
            // thinking 3 in every direction, so width and height of 7
            // I think the simplest solution is to procedurally generate an overlay grid of divs that use township wps data to reference the map and get resources going
            // request to the backend, confirm in the client? 
            // we can't assume a map is present currently; go give that a grab when we load this concept
            
                return (
                    <OverlayContentContainer>
                        {/* !MHRnao - refactor for same display either way, but management options when it's ours */}
                        <div style={{alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center'}}>

                            {state?.locationData?.name === state?.player?.name ? (
                                <div>
                                    <input type='text' value={townshipName} onChange={e => setTownshipName(e.target.value)} />
                                    <button>{townshipName === state?.locationData?.nickname ? '...' : 'Rename!'}</button>
                                </div>
                            ) : (
                                <div>{townshipName}</div>
                            )}
                            {/* <input type='text' value={townshipName} onChange={e => setTownshipName(e.target.value)} /> */}
                            {/* <button>{townshipName === state?.player?.township?.nickname ? '...' : `Rename!`}</button> */}
                        </div>
    
                        <div>Structs Tho</div>
                        
                        <div style={{flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                            <div>Your STRUCTS, sir or madam!</div>

                                {Object.keys(state?.locationData?.structs)?.map((structID, index) => {
                                    let thisStruct = state.locationData.structs[structID];
                                    return (
                                        <div key={index} style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: '#0AF', color: 'white', padding: '0.85rem', width: '500px', maxWidth: '80%', marginBottom: '0.75rem'}}>
                                            <div style={{width: '100%', alignItems: 'center'}}><div style={{marginLeft: '0.75rem'}}>{thisStruct.nickname}</div></div>
                                            <div style={{width: '100%', flexWrap: 'wrap', marginTop: '1rem'}}>
                                                {Object.keys(thisStruct.interactions).map((interactionKey, index) => (
                                                    <button key={index} onClick={() => handleStructInteractionRequest(thisStruct, interactionKey)} style={{marginRight: '0.75rem', backgroundColor: 'gray'}}>{interactionKey.toUpperCase()}</button>
                                                ))}
                                            </div>

                                        </div>
                                    )

                            })}
                        </div>
    
                        <div>Township Summary!</div>
                        {/* 
                            Population, NPCs, income, age
                        
                        
                        */}
                        
                        <div>TownShip Management Concepts!</div>
                        {/* 
                            So, township management! What do we want to see here?
                        
                        */}
                        
                        <button style={{position: 'absolute', top: '1rem', left: '1rem'}} onClick={dismissMe}>X</button>
                    </OverlayContentContainer>
                )
   
        }

        default: {
            return (
                <div>
                    ... if you're seeing me, something wildly wacky has happened. Hi? Hi.
                    <button onClick={dismissMe}>DISMISS</button>
                </div>
            )
        }
    }
}





const ChatEvent = ({ chatEventObject }) => {
    // known chat event types... chat, ambient


    return (
        <div style={{width: '100%', padding: '1rem', margin: '0.5rem 0', height: 'auto', borderTop: '1px solid hsl(240,20%,90%)', display: 'block'}}>
            <div style={{display: 'flex'}}>
                <div style={{width: 'calc(100% - 50px)', minHeight: '50px', height: '100%', paddingLeft: '0.5rem'}}>
                    {chatEventObject.agent != null && `${chatEventObject.agent.toUpperCase()}: `} 
                    <VocalSpan style={{marginLeft: '0.5rem'}} voice={chatEventObject.voice}> {chatEventObject.echo}</VocalSpan>
                </div>
            </div>
            
        </div>
    )
    /*
        an example, in this case for a chat message:
        const newChatMessage = {
            agent: decodedPlayerName,
            echo: chatMessageData.echo,
            timestamp: new Date(),
            origin: chatMessageData.target,
            type: 'chat',
            icon: allSouls[decodedPlayerName].icon,
            voice: chatMessageData.voice
        }    
    */
}





const CharacterCreationComponent = ({ dispatch, sendSocketData }) => {
    const [selectedClass, setSelectedClass] = useState('none');
    const [statSpread, setStatSpread] = useState({
        strength: 10,
        agility: 10,
        vitality: 10,
        willpower: 10,
        intelligence: 10,
        wisdom: 10
    });
    const [creationPage, setCreationPage] = useState(0);
    const [icon, setIcon] = useState({
        eyeColor: 1
    });
    const [playerName, setPlayerName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    // should set it up as player.voice = {}, ultimately
    const [voice, setVoice] = useState({
        font: 'Arial',
        spacing: 0,
        weight: 400,
        size: 0.8
    });
    const [voicefont, setVoicefont] = useState(3);
    const [wrappingUp, setWrappingUp] = useState(0); // trying it out as a 'level' of wrapping up rather than a binary... 1 is reached final page, 2 is passwords a-ok?

    // let spendableStatPoints = Object.keys(statSpread).map(statKey => statSpread[statKey]).reduce((total, next) => total + next, 2);


    // Set up in an array for now, but once we have the value we can pass it directly when it's attached to player variables
    const fontOptions = ['Courier', 'Lucida Console', 'Monaco', 'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Times New Roman', 'Didot', 'Georgia', 'Luminari']

// removed initial 'class' page in favor of having class determined in-game; leaving it here for reference
//     (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
//     <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>A voice in your head quietly prompts, "Don't worry. You do have a name. Let me help you remember."<br/>"What sort of adventurer are you?"</div>
//     <div style={{flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
//         <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('rogue')}>Rogue</button>
//         <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('fighter')}>Fighter</button>
//         <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('sympath')}>Sympath</button>
//         <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('sorcerer')}>Sorcerer</button>
//     </div>
//     <button disabled={selectedClass === 'none'} onClick={() => wrappingUp > 0 ? setCreationPage(3) : setCreationPage(creationPage + 1)}>{selectedClass === 'none' ? `...` : `${classDescriptions[selectedClass]}`}</button>
    
//      </div>),

    const creationPages = [
        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>The voice in your head continues, "Focus on the feeling of your body, the flow of thoughts in your mind."<br/>"What do you sense about the state of your Self?"</div>
            <div>Unspent Points: {Object.keys(statSpread).map(statKey => statSpread[statKey]).reduce((total, next) => total - next, 70)}</div>
            <div style={{width: '100%', flexDirection: 'column'}}>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>STRENGTH: {statSpread.strength}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='5' max='15' value={statSpread.strength} onChange={e => adjustStat('strength', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>AGILITY: {statSpread.agility}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='5' max='15' value={statSpread.agility} onChange={e => adjustStat('agility', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>VITALITY: {statSpread.vitality}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='5' max='15' value={statSpread.vitality} onChange={e => adjustStat('vitality', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>WILLPOWER: {statSpread.willpower}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='5' max='15' value={statSpread.willpower} onChange={e => adjustStat('willpower', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>INTELLIGENCE: {statSpread.intelligence}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='5' max='15' value={statSpread.intelligence} onChange={e => adjustStat('intelligence', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>WISDOM: {statSpread.wisdom}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='5' max='15' value={statSpread.wisdom} onChange={e => adjustStat('wisdom', e.target.value)} /> </div>
                
            </div>
            <button onClick={() => wrappingUp > 0 ? setCreationPage(3) : setCreationPage(creationPage + 1)}>That's me.</button>
        </div>),

        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>The voice instructs, "Now, speak up. Tell me your name."</div>
            <input type='text' autoFocus={true} placeholder={'My name is...'} value={playerName} maxLength={10} onChange={e => setPlayerName(e.target.value)} />

            <div style={{flexDirection: 'column', width: '100%', alignItems: 'center'}}>
                <div style={{position: 'relative', top: '0.75rem'}}>Voice Value #1 - font is {voice.font}</div>
                <input type='range' value={voicefont} min='0' max={`${fontOptions.length - 1}`} onChange={(e) => handleVoiceChange(e.target.value)} />
                <div style={{position: 'relative', top: '0.75rem'}}>Voice Value #2 - spacing</div>
                <input type='range' value={voice.spacing} min='0' max='2' step='0.5' onChange={e => setVoice({...voice, spacing: e.target.value})} />
                <div style={{position: 'relative', top: '0.75rem'}}>Voice Value #3 - weight of {voice.weight}</div>
                <input type='range' value={voice.weight} min='400' max='700' step='300' onChange={e => setVoice({...voice, weight: e.target.value})} />
                <div style={{position: 'relative', top: '0.75rem'}}>Voice Value #4 - size of {voice.size}</div>
                <input type='range' value={voice.size} min='0.7' max='0.9' step='0.1' onChange={e => setVoice({...voice, size: e.target.value})} />
            </div>

            <button disabled={playerName.length < 5 || playerName.length > 10} style={{boxSizing: 'border-box', fontFamily: voice.font, letterSpacing: `${voice.spacing}px`, fontWeight: `${voice.weight}`, fontSize: `calc(${voice.size}rem + 0.3vw)`}} onClick={() => wrappingUp > 0 ? setCreationPage(3) : setCreationPage(creationPage + 1)}>{(playerName.length >= 5 && playerName.length <= 10) ? `I am ${playerName}.` : `...`}</button>
        </div>),        

        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}><VocalSpan voice={voice}>You realize the voice in your head is yours.</VocalSpan></div>
            

            <div style={{flexDirection: 'column', flexWrap: 'wrap'}}>
                <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem'}} onClick={() => setCreationPage(1)}><VocalSpan voice={voice}>I am {playerName}.</VocalSpan></button>
                {/* <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem'}} onClick={() => setCreationPage(0)}><VocalSpan voice={voice}>I am a {selectedClass.substring(0,1).toUpperCase()}{selectedClass.substring(1)}.</VocalSpan></button> */}
                <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem', display: 'flex', flexWrap: 'wrap'}} onClick={() => setCreationPage(0)}>{Object.keys(statSpread).map((stat, index) => (<div key={index} style={{margin: '0.5rem'}}>{stat.substring(0,3).toUpperCase()}: {statSpread[stat]}</div>))}</button>
                <div style={{width: '100%', flexDirection: 'row'}}>
                    
                </div>

            </div>

            <div style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}><VocalSpan voice={voice}>"Think of a word or phrase to repeat to yourself, so you can always remember."</VocalSpan></div>
            <input type='text' placeholder='(password)' value={password} onChange={e => setPassword(e.target.value)} />
            <input type='text' placeholder='(confirm password)' value={confirmedPassword} onChange={e => setConfirmedPassword(e.target.value)} />
            <button disabled={wrappingUp < 2} onClick={createCharacter}>{wrappingUp < 2 ? `(Chant your mnemonic.)` : `(Open your eyes.)`}</button>
        </div>),

    ];

    function adjustStat(stat, value) {
        let statCopy = {...statSpread};
        statCopy[stat] = value;
        if (statCopy[stat] > 15 || statCopy[stat] < 5 || Object.keys(statCopy).map(statKey => statCopy[statKey]).reduce((total, next) => total - next, 70) < 0) return;
        return setStatSpread({...statCopy});        
    }

    function createCharacter() {
        let creationObject = {
            name: playerName,
            class: selectedClass,
            stats: {...statSpread},
            icon: {...icon},
            voice: {...voice},
            password: confirmedPassword
        }
        sendSocketData(creationObject, 'player_creation');
        // we can create a 'special' socket event in the client to CONFIRM character creation, gracefully receiving the token and transitioning to a First Chatventure
    }

    function handleVoiceChange(fontValue) {
        setVoice({...voice, font: fontOptions[fontValue]});
        setVoicefont(fontValue);
    }

    useEffect(() => {
        if (creationPage === 4 && wrappingUp < 2) return setWrappingUp(1);
    }, [creationPage]);

    useEffect(() => {
        if (password.length > 5 && confirmedPassword.length > 5 && password === confirmedPassword) return setWrappingUp(2);
        if (!playerName) return setWrappingUp(0);
        return setWrappingUp(1);
    }, [password, confirmedPassword]);

    return (
        <div style={{width: 'calc(300px + 40vw)', maxWidth: '85%', padding: '1rem', minHeight: '50vh', flexDirection: 'column', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}>
            
            {creationPages[creationPage]}

                {/* <button onClick={() => dispatch({type: actions.DISMISS_OVERLAY})}>Take me back.</button> */}
            
        </div>
    )
    /*

    When we get to the final confirmation page, can set a new state variable that changes all buttons to "return to confirmation" rather than scrolling page-by-page again
    
    Oh, we can add 'voice' ... font-weight, letter-spacing, etc. for now, different fonts later (we CAN do serif vs sans-serif at minimum for now, though)

    */
}





const Icon = ({ size, icon }) => {
    switch (icon.type) {
        case 'human': {
            return (
                <div style={{width: size || '100%', height: size || '100%', border: '1px solid black', position: 'relative', flexDirection: 'column', alignItems: 'center'}}>
                    {/* TOP HEAD */}
                    <div style={{position: 'absolute', backgroundColor: 'tan', height: '50%', width: '80%', borderRadius: '100%', transform: `scale(${icon.xScale},${icon.yScale})`}}></div>
        
                    {/* MID HEAD/FACE */}
                    <div style={{position: 'absolute', backgroundColor: 'tan', height: '35%', top: '25%', width: '80%', transform: `scale(${icon.xScale},${icon.yScale})`}}></div>
        
                    {/* BOTTOM HEAD/JAW */}
                    <div style={{position: 'absolute', backgroundColor: 'tan', bottom: '0', height: '80%', width: '80%', borderRadius: '100%', transform: `scale(${icon.xScale},${icon.yScale})`}}></div>
        
                    {/* EYE1 */}
                    <div style={{position: 'absolute', left: '25%', top: '40%', width: '10%', height: '10%', transform: 'scaleY(90%)'}}>
                        <div style={{position: 'relative', width: '150%', height: '100%', borderRadius: '50%', backgroundColor: 'white'}}>
                            <div style={{position: 'relative', width: '150%', left: '25%', height: '100%', borderRadius: '100%', backgroundColor: 'blue'}}></div>
                        </div>
                    </div>
        
                    {/* EYE2 ... for now we can just have it be the first eye 'mirrored,' and can get 'fancy' with it later */}
                    <div style={{position: 'absolute', right: '25%', top: '40%', width: '10%', height: '10%', transform: 'scaleY(90%)'}}>
                        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'white'}}>
                            <div style={{position: 'relative', width: '150%', right: '25%', height: '100%', borderRadius: '100%', backgroundColor: 'blue'}}></div>
                        </div>
                    </div>
        
                    {/* NOSE? */}
                    <div style={{position: 'absolute', width: '15%', bottom: '35%', height: '1%', border: '1px solid hsl(40,60%,30%)', borderColor: 'transparent transparent hsl(40,60%,30%) transparent', borderRadius: '0 0 50% 50%'}}></div>
        
                    {/* MOUTH maybe? */}
                    <div style={{position: 'absolute', width: '20%', bottom: '20%', height: '1%', backgroundColor: 'black'}}></div>
        
                </div>
            )            
        }

        case 'x':
        default: {
            return (
                <div style={{width: size || '100%', height: size || '100%', border: '1px solid black', position: 'relative', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    X
                </div>
            )
        }
    }
}




const CharacterIcon = ({ size, iconSettings }) => {


    // crafting the 'default' icon for now
    let iconStuff = {
        xScale: '100%',
        yScale: '100%'
    }

    // define arrays of possible values below
    const faceValue = {
        eyeColor: ['blue', 'brown', 'green'],
        faceWidth: ['80%', '85%', '90%', '95%', '100%', '105%', '110%', '115%', '120%']
    }

    return (
        <div style={{width: size || '100%', height: size || '100%', border: '1px solid black', position: 'relative', flexDirection: 'column', alignItems: 'center'}}>
            {/* TOP HEAD */}
            <div style={{position: 'absolute', backgroundColor: 'tan', height: '50%', width: '80%', borderRadius: '100%', transform: `scale(${iconStuff.xScale},${iconStuff.yScale})`}}></div>

            {/* MID HEAD/FACE */}
            <div style={{position: 'absolute', backgroundColor: 'tan', height: '35%', top: '25%', width: '80%', transform: `scale(${iconStuff.xScale},${iconStuff.yScale})`}}></div>

            {/* BOTTOM HEAD/JAW */}
            <div style={{position: 'absolute', backgroundColor: 'tan', bottom: '0', height: '80%', width: '80%', borderRadius: '100%', transform: `scale(${iconStuff.xScale},${iconStuff.yScale})`}}></div>

            {/* EYE1 */}
            <div style={{position: 'absolute', left: '25%', top: '40%', width: '10%', height: '10%', transform: 'scaleY(90%)'}}>
                <div style={{position: 'relative', width: '150%', height: '100%', borderRadius: '50%', backgroundColor: 'white'}}>
                    <div style={{position: 'relative', width: '150%', left: '25%', height: '100%', borderRadius: '100%', backgroundColor: faceValue.eyeColor[iconSettings?.eyeColor || 0]}}></div>
                </div>
            </div>

            {/* EYE2 ... for now we can just have it be the first eye 'mirrored,' and can get 'fancy' with it later */}
            <div style={{position: 'absolute', right: '25%', top: '40%', width: '10%', height: '10%', transform: 'scaleY(90%)'}}>
                <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'white'}}>
                    <div style={{position: 'relative', width: '150%', right: '25%', height: '100%', borderRadius: '100%', backgroundColor: faceValue.eyeColor[iconSettings?.eyeColor || 0]}}></div>
                </div>
            </div>

            {/* NOSE? */}
            <div style={{position: 'absolute', width: '15%', bottom: '35%', height: '1%', border: '1px solid hsl(40,60%,30%)', borderColor: 'transparent transparent hsl(40,60%,30%) transparent', borderRadius: '0 0 50% 50%'}}></div>

            {/* MOUTH maybe? */}
            <div style={{position: 'absolute', width: '20%', bottom: '20%', height: '1%', backgroundColor: 'black'}}></div>

        </div>
    )
}





const HUDBox = ({ icon, voice, stats, clickFxn }) => {
    // takes in icon, uses CharacterIcon to render iconSettings={icon} within
    // clickFxn is any special 'thing' you want to happen upon clicking the whole component, like login, logout, whatever else
    return (
        <div>

        </div>
    )
}