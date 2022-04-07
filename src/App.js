import React from 'react';
import { Store, SocketContext, socket } from './context';
import MainView from './screens/MainView';

export default function App() {
  return (
    <Store>
      <SocketContext.Provider value={socket}>
        <MainView />
      </SocketContext.Provider>
    </Store>
  );
}

/*

NOTE: while we haven't decided on a First Chatventure, we can wipe everything during dev, so build the fundamentals aggressively
  - 'wake up' in Zenithica, and be led to create township afer a series of wacky events, including first battle @ husks?
  - 'wake up' in your own township, and get back to Zenithica to learn more after a series of wacky events?

Fiddlesticks
[x] We've gained the ability to LOAD GAMESTATE! So let's start doing that. (And set up/prepare the init scenario again, so when we do the pre-release DB wipe we'll be good)
[x] Let's then successfully CREATE a Player for real life, with a dead-basic township (basically just a chat), slipping them into the DB and saving GameState
[x] token login
[x] logout
[x] credentials login
[x] Once logged in, Zenithica chat enabled! Test it out, including building prototype Message or ChatMessage (with type, echo, etc.)
[x] Township search - NEXUS page
[x] Set autosave frequency plus upon player creation
[_] Figure out how we want to structure playStack all around so we can derive all proper screens and logistics at any given moment
[_] Git me gud


HIGHER DEV
[_] HUDBox for more visually descriptive states of characters, including face
[_] Set up a viable actual-play township situation (growing, interaction, interest, some life)
[_] Set up the Initial Chatventure (character creation -> play tutorial)
[_] Chatventure setup -- types, conditions, relationship with origin (area it's in) - ref email Chatventure hangouts
[_] Going on Chatventures -- solo (Chatventure Spawn - flux?), some basic adventures
[_] Going on Chatventures -- with FRIENDS!
[_] Figure out the basics of Classes, Starting Classes, how they're set up to easily calcStats(), easily level up, easily peruse for purchasing new abilites/etc.
[_] Attach ICON and VOICE to all relevant Chat Events
[_] More advanced chat scroll behavior (jumping to bottom upon request, not necessarily every single new message; jump-to-bottom button)
  - should probably also cap the length of the history array in one or more ways, as eventually that'll get a little overwhelming
[_] Consider refactoring to canvas or image for Icon -- rendering a whole mess of divs for every single message might get a little much after awhile


BROKEN?
[_] This, twice so far: "We encountered an error saving the user: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://docs.atlas.mongodb.com/security-whitelist/."
[_] Refresh sometimes hangs and doesn't give us anything... in SAFARI. God damn you, Safari.
[_] on.connection is now colliding with automatic login (which is the same as page refreshing right now). 
  - move all locationData init from connection to login, and allow for the possibility of fresh logless login
..
[x] Hm. Loading from DB is getting a little odd. It seems to be reverting somehow? I had two ambient chat messages earlier, but now only one. Hi, Taran.
[x] Height of chat screen pulls top of page a little
[x] Long chat messages break the world in Safari, words spilling out everywhere, the horror!


CONSIDERATIONS
[_] When in combat, or other such situations, where should the live combat info live? state.playStack.data? state.contextData (currently nonexistent)?
[_] I'm using OVERLAY for character creation, but it's meant to be the 'primary overlay' for things like stats, inventory, etc. Mutually exclusive stuff.
  - ChatVenture should likely be its own component. Probably not the only scenario like this.
[_] Dig deeper on playStack, its uses, its execution
[_] Without console, text appears huge. Consider adjusting to calc +vmin, rather than +vw





playStack shenanigans
Therefore the playStack can become an object rather than an array, since it can only be so 'deep'
playStack: {
  gps: 'Zenithica',
  doing: 'shopping',
  at: 'shopID',
  overlay: 'none'
}
- or -
playStack: {
  gps: 'Dekar',
  doing: 'chatventure',
  at: 'chatventureID',
  overlay: 'inventory'
}
... it's probably important to have playStack reflected accurately on both sides to enforce proper clarity

*/