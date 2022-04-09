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
[x] HARD throttle behavior on the number of history items for initial load (150) and client-side (20) (can improve this behavior further later)
[x] Township Name boopable to conjure overlay sub-menus: management, structs, stats, ???
[_] Healer -> Sympath
[_] Township sub-menu functionality: basic management - rename (req backend), privacy (same)
[_] Township sub-menu functionality: basic struct interaction (visit, pulling up separate menu for each... maybe using playState.at or somesuch)
[_] Retrofit NAME boopable to conjure overlay sub-menus: inventory, equipment, stats, ???
[x] Make Item creation and equipping possible
[x] Player sub-menu functionality: simple stats/summary
[x] Player sub-menu functionality: unequip
[x] Player sub-menu functionality: equip
[_] Player sub-menu functionaltiy: list inventory
[_] Player sub-menu functionality: view class(es), spend exp
[_] Icon (face) boopables should conjure contextual further options (DM mode?, view player info, etc.)
[_] NEXUS upgrade: based on player's Nexus, ability to search out new life and new civilizations and add them as followed, thus making them visitable
  - req: implement some sort of 'privacy' gating
[_] Upgrade face icon logistics (can use a Codepen to play with it?)
[_] Upgrade ChatEvent to include timestamp behavior
[_] Implmement basic Adventure Class data to allow for some abilities and stat differentiation
[_] Joinable basic Chatventures! ... or some other mechanism for doing echo-able ChatEvent stuff
[_] Include ACTION BAR (view/unview since it might get a bit bulky, or a mobile-friendly version somehow), set and usage potential
[_] Create dead-simple Chatventure format ... Hanging Out!
[_] Slightly more advanced Chatventure format ... FIGHT!
[_] Add "unread messages" logic, as well as "oh snap EVENTS GOING ON HERE" icons/boxes/decorations
  - TownshipPreview with all sorts of fancy derived stats
[_] Define TOWNSHIP icon, make sure it's defined in township vars
[_] locationData on server is a bit... RY. So DRY it into a function that returns the stuff we're interested in. 
[_] Update header bar spacing/contents

[_] Are we happy with how playStack is structured?


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
[_] Thinking of making "ICON" a general component and then adding "type" inside the object so we can render faces to armor to buildings. WOO
  - can even make icon.type into 'image' or something and pull straight from an image file, if we'd like!
[_] Conditions modifying Icon (poisoned, ded, dilapidated, Foolish, etc.)


BROKEN?
[_] I'd prefer to have the NICKNAMES listed in the Nexus, but that would require another backend ping
  - alternatively, upon loading we can grab all the 'current icon data' for their nexus, including nickname, and just send events and quietly update them in a handy new var
  - this is additionally helpful for storing 'number of unread messages' as well
[_] Refresh sometimes hangs and doesn't give us anything... in SAFARI. God damn you, Safari.
[_] on.connection is now colliding with automatic login (which is the same as page refreshing right now). 
  - move all locationData init from connection to login, and allow for the possibility of fresh logless login
[_] Stuff gets weird and broken if I close my laptop for awhile, lose internet, and open it again. The page looks fine, but sends faulty data.
  - reconnection protocol? connection/data checking on sending? (specifically killed server this time on thisPlayer.playStack.gps = name)
[_] This, twice so far: "We encountered an error saving the user: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://docs.atlas.mongodb.com/security-whitelist/."
..
[x] Clicking township boopy is 'lagged'... nexus to a new town, click it, it's the previous town, dismiss, enter back in, CORRECT! That's awkward.
[x] Clicking on ZENITHICA town name whilst Husky or not owning it causes a crash, whoops
[x] So if someone is in Zenithica and sends a chat while another user is in their own township, the 'default' overlay shows up and then the app crashes hard. Ha.



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