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
-) new balance and focus: depending on your actions, and how recently they were taken, you will gain or lose balance/focus
  - so feel free to swing like a lunatic, but you'll quickly lose your balance as you go deeper into action debt
  - focus similar for focus-centric actions such as spells
  - this does open up the idea of 'balancing' action debt between physical and mental
  - also adding to the action debt of opponents
  - now we have to define action debt to make this fly :P ... KISS it gently, I hope
-) battle log data/encounter logged data... for achievements, results, resolution possibilities
  - when a chatventure gives you lemons... I mean, an encounter (type: battle), track what everyone got up to! for AI purposes as well as different resolution concepts
x) should we add locationData: type to distinguish if we're in a chat vs chatventure?
  - resolved: this info lives primarily in playStack right now as well as player.chatventure 
-) vaguely ACNH approach of daily or per-time-frame chance of visitation, where 'guaranteed' special npc shows up under pity conditions
-) party system implementation... sending immediate requests, possibly 'event' requests, and under what conditions to form a party
-) patrol joining implementation for multiplayer, keeping a mind open to other possibilities down the road, plus when all-for-one vs one-for-self (dependent vs independent play)
  - this also sort of requires being able to visit other townships, so let's implement "following" and privacy later

-) reinstate skills, have learning abilities raise skills by some amount (such as Zephyr raising magicLore, windLore, restoreLore... or whatever we end up calling anything)
  - the skill itself will have a record of how much 'value' is given per level, OR automatically scales based on tier, modded by any special values
  - using a skill increases its exp AND gives you exp in proportion; no difference between USE and EXP anymore
  - you spend accumulated EXP on unlocking new abilities, potentially powerleveling extant abilities, etc.
  - 

-) NOTE: structRequesting will need to change to always check the 'visit' first, join in on that, and then push any specifically chosen EVENT sub-mode from there
  - default is always visit for now
  - this is in cases such as general store, where you have to be in the 'visit' of it before you can shop
  - in cases such as exploring, a new chatventure is created, so you can 'skip' the visit, so to speak


x) successfully 'visit' perimeter, creating a chatventure and doing proper io.to shoutouts
x) set up the LEAVE option to... well, leave the chatventure, including dismantling the chatventure if it's got nobody left in it, cuz right now? TRAPPED FOREVER~

x) enable sending chats to chatventure
x) retrieve chatventure history on login/connection so refresh persists history data and pops it in
2) test playStack.doing OR mode for enabling combat concepts
  - start it out with just YOU FIND MONSTER(S), but you scout them, so you can FIGHT, KITE, or FLEE
  - for now FIGHT starts a battle, and FLEE just dismisses the possibility
  - let's start with all patrols revealing a single DROOLING HUSK, which if fought just stands there naked and takes hits :P

  - oh, before we wrap up, send to history ... BOB GOES ON PATROL, Y'ALL (and any other echo data we're interested in)


3) start a PATROL (configure successfully from both perimeter AND struct menu) -- have a TEST BATTLE button always available for DUMMY
4) figure out how to parse player/mob/party information within chatventure window (likely will involve having to add more info to the chatventure class)
5) COMBAT! fight something! even if it doesnt know how to fight back yet! -- initially, just be able to HIT or PEW for testing and numbers
6) combat resolution -- win (with some loot, as least wallet+) or flee (with any basic considerations there)
7) give things some TEETH, add combat resolution scenario -- lose (likewise with basic considerations)

o) SHOPPING!
  - will probably require some thought into ware generation, ideally with a little bit of RNG and vibe checking

O) skim quickscratch, add more interactions, building up to two big ones: patrol and trade
O) 



Fiddlesticks
[x] Add support for more equipment blueprints, as well as mods and materials to construct them with
[_] Refactor/refine township.worldMap to INCLUDE ref to township, as well as other points of interest, so we can grab 'weather' or any other relevant data
  - thinking about this for struct.visit() and other upcoming actions
[_] Add 'location' to Chatventure() init, using the above as a more thorough template
[_] Change up strut init() functions to include the creation of a belongsTo that points to the allSouls key where this thing lives/was created in
[_] Change perimeter to townwall (we'll assume a starting basic wood structure)
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
[_] For socket shenanigans, some sort of socketRestore fxn on each socket action -- check thisPlayer, if borked, attempt to fix
  - should be pretty easy, do a quick two-step function; since the socket IS active, it should be receiving a jwt? we can test for that
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



CONSIDERATIONS
[_] When in combat, or other such situations, where should the live combat info live? state.playStack.data? state.contextData (currently nonexistent)?
[_] All functions for struct actions (such as 'visit') call on requestor's current playStack.gps data -- it may serve to change it so we can optionally pass in more precise data
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