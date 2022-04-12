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

QUICKSCRATCH
-) instead of 'static breaks,' have BUFFS and DEBUFFS be conditional?
  - OH! Ok let's scrap the 'specificy' concept and go with physical = balance, magical = focus, and you gain/lose balance/focus!
  - so you can +1 your balance, attempt to -1 opponent's balance, etc.
  - can think about other variables later, if we want to add more, but going with the simple phy/mag duality seems solid for now
-) battle log data/encounter logged data... for achievements, results, resolution possibilities
  - when a chatventure gives you lemons... I mean, an encounter (type: battle), track what everyone got up to! for AI purposes as well as different resolution concepts
-) filtering functions: instead of ten kajillion mods, you could have a function ref attached to equipment that takes specific action types and rejiggers them
  - currently kind of an idle thought, and we'd probably want an extra checker attached somewhere such as "uponSpellCast: {rightHand: true, head: true}" 
    which would let us know which slots to hit up in our spellCasting extravaganza
  - this would potentially scale more dynamically, but we'll think about it further first 
-) should we add locationData: type to distinguish if we're in a chat vs chatventure?
-) vaguely ACNH approach of daily or per-time-frame chance of visitation, where 'guaranteed' special npc shows up under pity conditions
-) party system implementation... sending immediate requests, possibly 'event' requests, and under what conditions to form a party
-) patrol joining implementation for multiplayer, keeping a mind open to other possibilities down the road, plus when all-for-one vs one-for-self (dependent vs independent play)
  - this also sort of requires being able to visit other townships, so let's implement "following" and privacy later

-) reinstate skills, have learning abilities raise skills by some amount
  - using a skill increases its exp AND gives you exp in proportion; no difference between USE and EXP anymore

-) NOTE: structRequesting will need to change to always check the 'visit' first, join in on that, and then push any specifically chosen EVENT sub-mode from there
  - default is always visit for now

x) add structs to brandNewPlayer (perimeter, at least) ... DONE
x) add struct visitation anchor to client and server ... DONE
3) successfully 'visit' perimeter, creating a chatventure and doing proper io.to shoutouts
4) set up the LEAVE option to... well, leave the chatventure, including dismantling the chatventure if it's got nobody left in it

X) skim quickscratch, add more interactions, building up to two big ones: patrol and trade



Fiddlesticks
[x] warrior -> fighter
[x] mage -> sorcerer
[x] Flesh out some more blueprints and Struct class stuff to allow varied struct creation
[x] Add perimeter to struct blueprints
[x] Redesign abilityBlueprints to conceptually use the rather exciting struct mode
[_] Change up strut init() functions to include the creation of a belongsTo that points to the allSouls key where this thing lives/was created in
[_] Change perimeter to townwall
[_] Add towngate struct, call it south gate or main gate or whatever, have it nickname descriptively perhaps, and have THAT be the patrol origin
[_] ability aoe => targetOptions, defaultTarget
[_] Design struct interaction basics, including particularly "patrol" on perimeter, which starts a CHATVENTURE! our first!
[_] Make chatventure 'playable' in terms of chatting, using abilities, battling, choosing options to make stuff happen (immediately or discretionar-ily)
[_] Refine basic class data for at least level 1/initial level data with at least one usable active ability for each (or at least for one so we can test drive it)
[_] Add class starter structs to blueprints
[_] Add township.worldMap = {areas: {}, map: []} logic for areas in some basic but usable form
[_] Add 'explore' options to perimeter to chatventure those worldMap areas in some way, exploring and uncovering more options for them
[_] Add basic general store struct to township creation, including some basic wares
[_] Add capacity to interact
[_] NPC generation: ids, name (from a name generator!), core stats, 'party up' and 'duel' options possibly... or at least township 'contribution' and combatable mobs
[_] Township sub-menu functionality: basic management - rename (req backend), privacy (same)
[_] Township sub-menu functionality: basic struct interaction (visit, pulling up separate menu for each... maybe using playState.at or somesuch)
  - based on main struct type? ... or conditional accessible bits based on typing built in?
[_] Retrofit NAME boopable to conjure overlay sub-menus: inventory, equipment, stats, ???
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
[_] Add some 'force-a-gamestate-save' mechanisms
  - is there a way to add a 'oh shit we're crashing do something before going offline' hook to the server?



HIGHER DEV
[_] Building icons (at least super basic ones where you can tell it's a building at a glance... can use type: 'img' for Icon if that's easier right now)
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
[_] When the Player Page gets too tall, uh... it... kind of bleeds off the page with no way to scroll :P
[_] When chat text gets too long, player name collapses on itself oddly... maybe scoot 'name' to a 'top space' above the text
[_] I'd prefer to have the NICKNAMES listed in the Nexus, but that would require another backend ping
  - alternatively, upon loading we can grab all the 'current icon data' for their nexus, including nickname, and just send events and quietly update them in a handy new var
  - this is additionally helpful for storing 'number of unread messages' as well
[_] Refresh sometimes hangs and doesn't give us anything... in SAFARI. God damn you, Safari.
[_] on.connection is now colliding with automatic login (which is the same as page refreshing right now). 
  - move all locationData init from connection to login, and allow for the possibility of fresh logless login
[_] Stuff gets weird and broken if I close my laptop for awhile, lose internet, and open it again. The page looks fine, but sends faulty data.
  - reconnection protocol? connection/data checking on sending? (specifically killed server this time on thisPlayer.playStack.gps = name)
[_] This, twice so far: "We encountered an error saving the user: MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted. Make sure your current IP address is on your Atlas cluster's IP whitelist: https://docs.atlas.mongodb.com/security-whitelist/."
[_] If I leave my computer off for awhile, come back, let the 'game' idle a bit, and then try to visit a township, KA-CRASH
  - it's due to thisPlayer.playStack.gps being undefined, so have a way to handle/fallback for that
  - this also seems to happen when I'm editing the server file and it re-saves/re-launches, something gets corrupted/detached/comes loose somewhere
..
[_]



CONSIDERATIONS
[_] When in combat, or other such situations, where should the live combat info live? state.playStack.data? state.contextData (currently nonexistent)?
[_] I'm using OVERLAY for character creation, but it's meant to be the 'primary overlay' for things like stats, inventory, etc. Mutually exclusive stuff.
  - ChatVenture should likely be its own component. Probably not the only scenario like this.
[_] Dig deeper on playStack, its uses, its execution
[_] Without console, text appears huge. Consider adjusting to calc +vmin, rather than +vw
[_] NOTE: currently the KEY of all townMap.structs is the same as the TYPE. We'd have to take extra steps to change this.
  - this essentially means that every struct MUST have its object key be its type, and so only ONE of each struct can be made right now
  - if we want to allow multiples, which we probably do, we need to create a way by which new structs generate their own key, use it, and save it internally for other fxns





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