import React, { useContext, useState, useEffect, useRef } from 'react';
import { actions, Context, SocketContext } from '../../context';
import { MyIcon, VocalSpan } from '../../styled';

export default function MainView() {
    const socket = useContext(SocketContext);
    const [state, dispatch] = useContext(Context);
    const [chatMessage, setChatMessage] = useState('');
    const messageEndRef = useRef(null);
    const chatRef = useRef(null);

    function sendSocketData(dataObj, event) {
        // so we'd use this fxn by attaching an obj with {event: 'socket_event', OTHERSTUFF, and token: token below}
        return socket.emit(event || 'data_from_client', {...dataObj, token: localStorage.getItem('CTJWT')});
    }

    function handleWho() {
        if (!state.player.name) {
            return dispatch({type: actions.PROMPT_LOGIN});
        }
        return alert(`You are ${state.player.name}.`);
    }

    function logout() {
        // remove JWT, reset state, probably send a 'logout' pulse to server
        localStorage.removeItem('CTJWT');
        dispatch({type: actions.LOGOUT});
        return sendSocketData({}, 'logout');
    }

    function sendChat(e) {
        e.preventDefault();
        if (state.player.name == null) return;
        const newChatAction = {
            echo: chatMessage,
            type: 'chat',
            voice: state.player.voice || {},
            targetType: 'chatroom', // chatroom vs chatventure vs ???
            target: state.player.playStack.gps
        };
        sendSocketData(newChatAction, 'chat_action');
        return setChatMessage('');
    }

    function visitNexus() {
        return dispatch({type: actions.VISIT_NEXUS});
    }

    function visitTownship(name) {
        console.log(`Requesting a visit to township: ${name}`);
        return sendSocketData({name: name}, 'request_township_visit');
    }

    useEffect(() => {

        // automatic login; we'll probably have to trigger a 'manual login' for non-token situations
        socket.emit('login', {token: localStorage.getItem('CTJWT')});

        // BELOW: we'll add socket.on('event', receivedData => {}); for various backend-driven events

        // player_update ... for when the socket insists that we need to update our core player data (hp, mp, effects, ?)
        socket.on('player_update', playerData => {
            return dispatch({type: actions.LOAD_PLAYER, payload: playerData});
        });

        socket.on('location_update', locationData => {
            return dispatch({type: actions.UPDATE_LOCATION, payload: locationData});
        });

        socket.on('room_message', newMessage => {
            return dispatch({type: actions.NEW_MESSAGE, payload: newMessage});
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
            localStorage.setItem('CTJWT', initialCreationObj.token);
            return dispatch({type: actions.LOAD_PLAYER, payload: initialCreationObj.playerData});
        });
        

    }, [socket]);

    // useEffect(() => {
    //     if (state.player.name == null) console.log(`State has changed, and THE NAME IS GONE!`);
    //     if (state.player.name != null) console.log(`State has changed, but the name exists, we LIVE!`);
    // }, [state]);

    useEffect(() => {
        if (state.player.playStack.gps != 'nexus' && state.player.chatventureID == null) messageEndRef.current.scrollIntoView();
    }, [state?.locationData?.history]);

    useEffect(() => {
        if (state.player.name != null && state.player.playStack.gps !== 'nexus') chatRef.current.focus();
    }, [state.player.name]);

    return (
        <div style={{padding: '1rem', width: '100vw', minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
            
            <div style={{position: 'fixed', width: '100vw', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: '9', backgroundColor: 'hsla(240,50%,10%,0.6)', display: state.player.playStack.overlay === 'none' ? 'none' : 'flex'}}>
                <OverlayContent overlay={state.player.playStack.overlay} dispatch={dispatch} sendSocketData={sendSocketData} />
            </div>

            <div id="toprow" style={{width: '100%', border: '1px solid black', height: '100px', alignItems: 'center', padding: '1rem'}}>
                {/* NEXT: upgrade to some sort of player status HUD situation rather than simple button in both cases */}
                {state.player.name == null ? (
                    <button onClick={handleWho} style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>{state.player.name || `Who am I...?`}</button>
                ) : (
                    <button onClick={logout} style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>{state.player.name || `Who am I...?`}</button>
                )}
                <button onClick={visitNexus} style={{display: state.player.name == null ? 'none' : 'flex', marginLeft: '0.75rem', height: '100%'}}>NEXUS</button>
            </div>

            {state.player.playStack.gps === 'nexus' ? (
                <div style={{flexDirection: 'column', width: '100%'}}>
                    VISIT A PLACE, FRIENDO:
                    {state.player.following.map((name, index) => 
                        <button onClick={() => visitTownship(name)} key={index} style={{marginTop: '1rem'}}>{name}</button>
                    )}
                </div>
            ) : (
                <div id="midsection" style={{width: '100%', flexDirection: 'column', padding: '1rem', border: '1px solid green', overflow: 'scroll', height: 'calc(100% - 100px)'}}>
                
                    <div style={{width: '100%', paddingBottom: '1rem', borderBottom: '1px solid hsl(240,90%,10%)'}}>{state?.locationData?.description || `You're getting your bearings...`}</div>

                    {/* NOTE: adjust the height of the below later, but ensure height is well-defined so that overflow scrolls properly */}
                    <div style={{width: '100%', flexDirection: 'column', border: '2px solid #0AF', height: '70vh', overflow: 'scroll'}}>
                        {state?.locationData?.history.map((historyObj, index) => (
                            <ChatEvent key={index} chatEventObject={historyObj} />
                            // <div key={index} style={{width: '100%', padding: '1rem', margin: '0.5rem 0', border: '1px solid hsl(240,20%,90%)', borderRadius: '0.5rem'}}>{historyObj.icon != null && <CharacterIcon size={'50px'} iconSettings={historyObj.icon}/>}<VocalSpan voice={historyObj.voice}>{historyObj.echo}</VocalSpan></div>
                        ))}
                        <div ref={messageEndRef} />
                        
                    </div>

                    <form style={{display: 'flex', width: '100%'}} onSubmit={sendChat}>
                        <input type='text' ref={chatRef} disabled={state.player.name == null} style={{display: 'flex', width: 'calc(100% - 50px)'}} value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder='Hello, World' />
                        <button disabled={state.player.name == null} style={{width: '50px'}} onClick={sendChat}>{'>'}</button>
                    </form>
                
                </div>
            )}

            

        </div>
    )

}

function OverlayContent({overlay, dispatch, sendSocketData}) {
    const [loginCredentials, setLoginCredentials] = useState({name: '', password: ''});

    function dismissMe() {
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

    switch (overlay) {
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

        default: {
            return (
                <div>
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
                <div style={{width: '50px', height: '50px'}}>
                    {chatEventObject.icon != null && <CharacterIcon size={'50px'} iconSettings={chatEventObject.icon}/>}
                </div>
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
        strength: 12,
        agility: 12,
        vitality: 12,
        willpower: 12,
        intelligence: 12,
        wisdom: 12
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

    const classDescriptions = {
        'none': 'I am a...',
        'warrior': 'I am a Warrior, rawr!',
        'rogue': 'I am a Rogue, whoosh!',
        'healer': 'I am a Healer, relax!',
        'mage': 'I am a Mage, boom!'
    }

    // Set up in an array for now, but once we have the value we can pass it directly when it's attached to player variables
    const fontOptions = ['Courier', 'Lucida Console', 'Monaco', 'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Times New Roman', 'Didot', 'Georgia', 'Luminari']

    const creationPages = [
        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>A voice in your head quietly prompts, "Don't worry. You do have a name. Let me help you remember."<br/>"What sort of adventurer are you?"</div>
            <div style={{flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>
                <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('rogue')}>Rogue</button>
                <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('warrior')}>Warrior</button>
                <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('healer')}>Healer</button>
                <button style={{margin: '0.5rem', width: '100px'}} onClick={() => setSelectedClass('mage')}>Mage</button>
            </div>
            <button disabled={selectedClass === 'none'} onClick={() => wrappingUp > 0 ? setCreationPage(4) : setCreationPage(creationPage + 1)}>{selectedClass === 'none' ? `...` : `${classDescriptions[selectedClass]}`}</button>
            
        </div>),

        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>The voice in your head continues, "Focus on the feeling of your body, the flow of thoughts in your mind."<br/>"What do you sense about the state of your Self?"</div>
            <div>Unspent Points: {Object.keys(statSpread).map(statKey => statSpread[statKey]).reduce((total, next) => total - next, 82)}</div>
            <div style={{width: '100%', flexDirection: 'column'}}>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>STRENGTH: {statSpread.strength}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='4' max='20' value={statSpread.strength} onChange={e => adjustStat('strength', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>AGILITY: {statSpread.agility}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='4' max='20' value={statSpread.agility} onChange={e => adjustStat('agility', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>VITALITY: {statSpread.vitality}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='4' max='20' value={statSpread.vitality} onChange={e => adjustStat('vitality', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>WILLPOWER: {statSpread.willpower}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='4' max='20' value={statSpread.willpower} onChange={e => adjustStat('willpower', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>INTELLIGENCE: {statSpread.intelligence}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='4' max='20' value={statSpread.intelligence} onChange={e => adjustStat('intelligence', e.target.value)} /> </div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative', top: '0.75rem'}}>WISDOM: {statSpread.wisdom}</div>
                <div style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}><input type='range' min='4' max='20' value={statSpread.wisdom} onChange={e => adjustStat('wisdom', e.target.value)} /> </div>
                
            </div>
            <button onClick={() => wrappingUp > 0 ? setCreationPage(4) : setCreationPage(creationPage + 1)}>That's me.</button>
        </div>),

        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>The voice in your head forms the rough shape of a face in your mind and instructs you, "Sculpt this to fit your image of Self in your mind's eye."</div>
            <div style={{margin: '2rem 0', width: 'calc(100px + 5vmin)', height: 'calc(100px + 5vmin)'}}>
                <CharacterIcon iconSettings={icon} />
            </div>
            <div style={{width: '100%', flexDirection: 'column'}}>
                <div style={{position: 'relative', top: '0.75rem'}}>Eye Color</div>
                <input type='range' min='0' max='2' value={icon.eyeColor} onChange={e => setIcon({...icon, eyeColor: e.target.value})} />
            </div>
            <button onClick={() => wrappingUp > 0 ? setCreationPage(4) : setCreationPage(creationPage + 1)}>That looks... good?</button>
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

            <button disabled={playerName.length < 5 || playerName.length > 10} style={{boxSizing: 'border-box', fontFamily: voice.font, letterSpacing: `${voice.spacing}px`, fontWeight: `${voice.weight}`, fontSize: `calc(${voice.size}rem + 0.3vw)`}} onClick={() => wrappingUp > 0 ? setCreationPage(4) : setCreationPage(creationPage + 1)}>{(playerName.length >= 5 && playerName.length <= 10) ? `I am ${playerName}.` : `...`}</button>
        </div>),        

        (<div style={{width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{width: '100%', marginBottom: '1rem', textAlign: 'center', justifyContent: 'center'}}>You realize the voice in your head is yours.</div>
            <VocalSpan voice={voice}>"That's right... I am {playerName}."</VocalSpan>

            <div style={{flexDirection: 'column', flexWrap: 'wrap'}}>
                <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem'}} onClick={() => setCreationPage(0)}><VocalSpan voice={voice}>I am a {selectedClass.substring(0,1).toUpperCase()}{selectedClass.substring(1)}.</VocalSpan></button>
                <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem', display: 'flex', flexWrap: 'wrap'}} onClick={() => setCreationPage(1)}>{Object.keys(statSpread).map((stat, index) => (<div key={index} style={{margin: '0.5rem'}}>{stat.substring(0,3).toUpperCase()}: {statSpread[stat]}</div>))}</button>
                <div style={{width: '100%', flexDirection: 'row'}}>
                    <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem', width: '100px', height: '100px'}} onClick={() => setCreationPage(2)}><CharacterIcon iconSettings={icon} /></button>
                    <button style={{padding: '1rem', border: '1px solid gray', margin: '0.25rem', width: 'calc(100% - 100px)'}} onClick={() => setCreationPage(3)}><VocalSpan voice={voice}>Do re me fa</VocalSpan></button>
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
        if (statCopy[stat] > 20 || statCopy[stat] < 4 || Object.keys(statCopy).map(statKey => statCopy[statKey]).reduce((total, next) => total - next, 82) < 0) return;
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
            <div style={{position: 'absolute', left: '25%', top: '35%', width: '10%', height: '10%', transform: 'scaleY(90%)'}}>
                <div style={{position: 'relative', width: '150%', height: '100%', borderRadius: '50%', backgroundColor: 'white'}}>
                    <div style={{position: 'relative', width: '150%', left: '25%', height: '100%', borderRadius: '100%', backgroundColor: faceValue.eyeColor[iconSettings?.eyeColor || 0]}}></div>
                </div>
            </div>

            {/* EYE2 ... for now we can just have it be the first eye 'mirrored,' and can get 'fancy' with it later */}
            <div style={{position: 'absolute', right: '25%', top: '35%', width: '10%', height: '10%', transform: 'scaleY(90%)'}}>
                <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'white'}}>
                    <div style={{position: 'relative', width: '150%', right: '25%', height: '100%', borderRadius: '100%', backgroundColor: faceValue.eyeColor[iconSettings?.eyeColor || 0]}}></div>
                </div>
            </div>

            {/* NOSE? */}
            <div style={{position: 'absolute', width: '10%', bottom: '40%', height: '1%', backgroundColor: 'hsl(40,60%,70%)'}}></div>

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