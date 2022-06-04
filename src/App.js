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



QUICKSCRATCH
-) battle log data/encounter logged data... for achievements, results, resolution possibilities
  - when a chatventure gives you lemons... I mean, an encounter (type: battle), track what everyone got up to! for AI purposes as well as different resolution concepts
-) vaguely ACNH approach of daily or per-time-frame chance of visitation, where 'guaranteed' special npc shows up under pity conditions
-) party system implementation... sending immediate requests, possibly 'event' requests, and under what conditions to form a party


  REFACTOR ABILIITY DONK:
  attack damage is sqrt(atk) * potency * buildupMod * atk/magMod
  defense reduction is sqrt(def)... oh, that certainly doesn't scale against that attack :p
  so let's do base atk vs base def for initial value, then mod up
  ... ok, it works 'alright' but leaves unarmed husks doing VERY little damage at first (though it ramps up pretty quickly with their repeated attacks)
    - I like the core concept, but maybe have higher guaranteed base damage, and have damage reduction be more % based to avoid a lot of 1 dmg early on?
    - or maybe it's fine, especially for now, ONWARD!
  

Hunting special mobs: job board


GRITTY DITTY (kinda in order):




ASPIRE?
[_] For socket shenanigans, some sort of socketRestore fxn on each socket action -- check thisPlayer, if borked, attempt to fix
  - should be pretty easy, do a quick two-step function; since the socket IS active, it should be receiving a jwt? we can test for that
[_] Set up the Initial Chatventure (character creation -> play tutorial)
[_] Chatventure setup -- types, conditions, relationship with origin (area it's in) - ref email Chatventure hangouts
[_] Going on Chatventures -- solo (Chatventure Spawn - flux?), some basic adventures
[_] Going on Chatventures -- with FRIENDS!
[_] More advanced chat scroll behavior (jumping to bottom upon request, not necessarily every single new message; jump-to-bottom button)
  - should probably also cap the length of the history array in one or more ways, as eventually that'll get a little overwhelming
][_] Thinking of making "ICON" a general component and then adding "type" inside the object so we can render faces to armor to buildings. WOO
  - can even make icon.type into 'image' or something and pull straight from an image file, if we'd like!
[_] Conditions modifying Icon (poisoned, ded, dilapidated, Foolish, etc.)
[_] Hm, for stuff like Township Ticks, can we 'outsource' it to clients to run everything? :P
  - do a socket shot and await a response... can we immediately tell if there's no response?
  - we can also 'save up' tsticks and have a visiting user run the cumulative tick logic upon visit, and have a "traversing the nexus" loading screen in the meantime :P



BROKEN?
[_] WhoopsieDoodle: if I don't have the game run for more than a couple days (or even a day and a half), game doesn't find the proper load and does a fresh init :P
  - can amend loading to have a third fallback option of pulling up ALL records and sorting it out from there
  - if there's a 'pull up most recent record' option, that'd work great, as well (and might replace current functionality)
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
[_] If we want mobs/npcs to have classes and access to certain global perks (due to easy referencing), they would need to 'live' in an allNpcs and/or allMobs global obj
  - this can be 'derived' from saved DB data without being forcibly shaped thusly, or we could just make separate variables and save them in the aggregate data





CHATVENTURE STRUCTURE... redux?

- given that, yes, everyone should have -A- chatventure; their own, or their leader's
  - so what about when party is suspended?... you stay in the socket channel but... hmmmm
  when is the chatventure initiated? how is it structured? or is it JUST a channel?

well, it's definitely at least a place where HISTORY should go, so... there's that, it's definitely an object
with meta data on who is in it, a ref to everyone, mobs, players, npcs, and so on
... but they don't just exist there, so... refs, refs everywhere!
DEFINING A NEO CHATVENTURE!
ok. chatventure needs to have a channel to join with its own history. echo objects as usual, voicespan, npcs can chat and opine, etc.

a chatventure is just a 'vessel' for dictating what your playState is doing... 
... so if you're playing without other humans, do you need a chatventure? your actions will directly change playState, nobody else to echo it to.
THUS! FINALLY! a chatventure is a meta object that brings together a band of human players to experience something together by sync'ing their playStates
... so a single-player chatventure would just be a way to 'talk to yourself' and be in a channel that gets all the pertinent io data
  - CHATVENTURE SPECIAL: you retrieve recent chats/echoes, but NOT from before when you joined, so JOINTIME is a thing, more like a MUDroom in that respect
... so when you're joining a player's party, you're 'really' joining their chatventure
... so is a chatventure just a party? dang. so what if we replace PARTY with CHATVENTURE?
one sec
... well, the chatventure is the top-level server-side concept, but the PARTY is more stack-level and shared locally
... so ok, they're very intimately related, but not the same

CHATVENTURES ARE TOP-LEVEL buuuut THEIR KEY IS THE PLAYERNAME
so 


WHEN YA FIND A RED NEXUS... anyway
... wow, I really just wrote that and left it for weeks with no context, so the above line means almost nothing to me for now. :P


so you boot up the 'game' fresh. you log in. you may or may not be in a party. that needs to be sorted. 
- you're in a party, neato, resume 'watching' the leader's chatventure
- all chatventures are linked to a player's (unique) name and are the director of what's being seen, the 'playStack Source'

PARTY LOGISTICS
- what if someone logs out for too long? what happens to their character?
- can we track 'logged off' socket status or who's logged in or out of a channel? that would help quite a bit
  - might just have to add an 'offline' and 'inactive' status checker to allSouls and then work from there
  - if entityType === 'player' check, otherwise off to the races



so when you decide to go adventuring with or without your built-up party, it's a chatventure!
  - chatventures are all chat-enabled
  - they're all 'shared,' so if it's a battle, EVERYONE battles... if you're shopping, EVERYONE is shopping :P
  - so when you depart unto the world, it's definitely a chatventure
  - but when you're in town, it's NOT a chatventure, even if you're in a party? that tracks
  - so every party has a leader, and departing without your leader removes you from the party
  - party of one?... hm, to be universally applicable to party mechanics leading the way, that actually makes sense
  - ok, so everything is party-centric, populate your party with yourself as leader by default; IF you're in another party, 
    ... party object is copied from leader, but with 'leader: false'?
  - anyway, leaving that aside for the time being, 
  got the 'view' on top and the 'chat' on the bottom; decide on how to handle chatting during combat (I'd like to still have it, but it can't be a big part of the UI)
  .. so the 'shared space' of a township or an idle chatventure is all 'chill' see-things, chat-here
  .. top view, bottom chat, main new concept .. don't click the township, SEE the township up top!
  .. how to set up parties, hmmmm clicky or scan area boopty
  .. chatventure party of one? 
    - well, if you're in a party, or suspendedParty? ... when you want to keep the party intact but go do your own thing
    so party: {leader: false, suspended: false, }
    if you're the leader and you go on a 'proper chatventure' should we have a 'summon party members' boop? hmmmm
    - and then we have to be like "hey your leader is off through the gates, wanna go with?" ... timeOut to answer or be disjoined
  
  so what we have here is a party-centric concept of shared experience, mixing party and chatventure together in delightful harmony
  - so is party part of playStack now?
  - we can have the party/chatventure have a WHATDOING with all relevant data for parsing
  - so now hanging out in a township... a 'universal chat nexus' more than a specific special thing? a tileChat?



[_] Finish TileArea basic logic, harmonized with above
  [_] finish defining starter style moves (at least strike and shock) so we can throw 'em on the muglins (and our player)
  [_] class MuglinMob to populate with for testing
    x- decide on how equipment works, rejigger blueprints
    x- eh, just slap basic-ass clubs on everybody for now
    o- nail down logistics for combat flow, pending CHATVENTURE STRUCTURE above
    o- think through tileArea logic for 'random encounters' and spawning muglin camps/gatherings (first area has one as a primary goal to get enough opalite to UP NEXUS and travel to new worlds)
[_] Rethink and establish Chatventure structure (notes above)
[_] Struct new behaviors and brandNewPlayer init spawn of the 'basics'
[_] Amend class mod logic, apply it to new characters upon creation
[_] Add allMobs, allNPCs (maybe all under allMobs umbrella for ease)
[_] Make combat possible for turn-based now that mobs can spawn battles for us
[_] equipment maker fxn for a given level (and/or given resources)
  ... doable with current means: take their level, pick a blueprint, for each slot they want, search allMaterials, and construct accordingly

[_] NPC gen
  [_] stats, level, etc.
  [_] randomization of name and 'features'
  [_] extra: talents, skills


- add world gen extras: mobfactions support (for both team-level and faction-level PVE!), random encounters, points of interest, rare treasures of some sort
  - 'goody bag' that is generated on landmass init, proportionate to the number of total tiles for that landmass
  - what kind of goodies? (varies per tile type, generally)... BRAINSTORM!


- how to init mob encounters? per tile, or some other way? now's the time!
  - a 'simpler' way would just to have a global/worldwide encounter table, just keeping mobLevel and threatLevel variables per tile as we go/interact
  - so you're cruising around, checking encounter risk (maybe it accumulates over time and is 'spent' when you bonk into battle)
  - mapData vs worldData; the player gets mapData, the server keeps track of (most or all of) worldData (which includes mobData)
  - special structs can have their own special mobs, and/or we can spawn special encounters separately


- add overlay1 support (COAL, foal), overlay2 stuff (town, township, etc.), overlay3 (player, other player-type entities)
- start a new character with their very own little 'tutorial' world and try to implement the Civ Concept for gathering materials
  - smallish world, bound growth from the center of the map, expansive sea on each side that's too far to see across (and no means to build boats)
  - slap 'em down in a savanna and call it a day to begin with
- refactor township(s) so we can exit the gate and then re-enter the township
- add township struct view at the top
- township management: allocate resource gathering, build structs, upgrade structs, assign npcs to structs
- server stock: some system whereby resources are gathered under some ongoing means, KISS gently
  - every 15m is probably fine for "check for events," and every 1h is probably fine for gathering resources, we'll start with that
- 



... I've buried myself once more. Alas! Let's focus down. We've achieved our tech showcase when:
[_] We can play Civ
 o- build & upgrade structs, assign npcs, get resources for all of above
 x- world gen
[_] We can play DQ
 o- make parties (npcs and/or players), go on chatventures, battle against mobs to win/lose, gain levels/trayzure
 x- 
[x] We can pop over to friends' chatrooms and chat wildly


need a way to signal we're in the MODE of walkin' aboot
- chatventure sync


next up:
X) generate a new 'tutorial' world while creating a new player, search for a savanna once the world is set up, establish the township ON that savanna
  x - ok, we now spawn our starter character's township on a savanna (probably), neat
  x - resize worlds so they're not intensely insanely massive files, DONE
X) figure out and begin income process (and maybe some starter materials already on hand)
X) display that to user when in township, which should already be running right away
X) be able to assign two 'away team' gathering spots?

5) basic building/ugprade logic within township... and maybe for reachable tiles?

X) be able to pop out of current township and stroll about via town gate
X) use Nexus to search for other townships and go chat and stroll about THEIR wacky worlds




we can derive a system for 'easy tile lore'
FIRST SPOT: the tile type, such as j = jungle
SECOND SPOT: tile placement detail for later, such as lower left, middle, upper (from spritesheet, once implemented)
THIRD SPOT: tile 'natural special'? coal-hill, etc. ... each tile should have at least 1, some can have more than that if I'm feeling inspired :P
  - 0 = normal tile
FOURTH SPOT: tile built special... player-constructed, mob-constructed stuff; TOWNSHIP takes precedence, T! if township is there, we'll T it up

river adds +1 water universally, may add other mods specifically
  - river can meander through any forest, flatland, or bumpy zone; rivers can ORIGINATE from freshwater, wetland, or lakey mountain
road present FROM current space TO target space (aside from enabling connections for trade, income, events, npc stuff in the future, etc.) reduce threat rise from travel
  - every space traveled by default increases threat and rolls for encounter; traveling along roads greatly diminishes 'random encounters'

OK! LET'S TOWNSHIP!
- okiedokie! now we can actually visit the worlds of our FRIENDS! (well, followed-ers :P)
- ok, we can now re-enter the township via the ENTER button awkwardly on the tile desc strip, good enough for now (add DQ menu shortly)
NEXT,
x- add displayName to structs for township display
o- next we should get township management working -- VIEW by default (except Zenithica), MANAGE if it's yours
  (x) first off, gotta remove all Zenithica stuff if that's where we're at... oddly defaults to whatever your last actual township was
  (x) OOPS: clicking NEXUS when a Husk is... bad. but now we just don't allow it. :P
  (o) we need at least basic management data available in the township structure - let's go define that setup


o- THOUGHT: hey, we can have the client handle a certain subset of requests on default struct interactions, such as NEXUS before throwing it to the backend
o- brainstorm more starter structs, get their starter classes/objects/blueprints going

now that we can add friends, which is great, we have "You don't KNOW ME" displaying when clicking the township name... not ideal, we need those structs :P
- then let's turn that into a proper township management thing
  - this will likely require more structs in the township to be built and designed to work predictably
  - also, let's have allocatable squares and a TOWNSHIP ALLOCATION WINDOW of clickable tiles that highlight somehow (can drawRect, maybe? simple as can be)


FINISHING UP:
- struct building, struct upgrading, struct interfaces: basics and test drive
- struct basics: initial tradepost offerings, plop down first class trainer (switch!), struct-spec menus, basic refining online
- final equipment stuff: how it affects stats, maybe add cha
  o- add cha (cha cha), be so compelling
  o- make sure SPR is a thing rather than RES
- finally, our FIRST ENCOUNTER (oops all slimes) complete with exp and basic loot! (don't worry right off on terrain influence on encounter rate)
  o- walking increases chances of encounter until BOOM! encounter triggered
  o- have a generic slime pop up and do a basic slap fight with it
- actually finally, make sure we can't send "derpy data" to the backend; thisPlayer keeps going undefined on us, so can just kinda break
  - may be mostly a dev problem, because things get wacky when I save files here, but worth safeguarding against nonetheless


hmmm, dragon? whelp? a way to reposition within the tutorial world after playing a little bit?
- yup that all sounds good but let's get the basics up and running ASAP

- make sure when the game loads, all structs/mobs re-gain their structhood




WHOOPSIE
- LOL currently nothing to guard against someone just changing your township's management by strolling in and booping around :P
- slight whoops is that we don't redraw on camera change, so zoom level changing does NOT redraw until we move right now
- also we get lots of errors if MainView has changes whilst we're in the nexus
- adding a new friend to follow kicks back to your own township screen (due to player data overwrite), so consider adding a 'whichScreen' type optional var to check for
- TC does NOT mobile-shrink well: almost every screen needs an overhaul in this regard, feel free to hyper-shrink where necessary
- there's some sync issues where changing playStack to worldMap and back does NOT update the backend's record, so reloading the client can get... a little weird :P
  - related: we save worldMap mode on playStack when we enter it, but not for other stuff, so a page refresh can have us doing mgmt AND worldMap at the same time, which isn't ideal

LOOSE IDEA
- we can alter the scaling of levels to be as current, but then modified by level to under-weight below a certain point and over-weight gradually after that
  - mimicing lower levels = lower stat gains, currently it's very predictably flat across all levels
- can we use some sort of memoization for overworld encounter rate/threat bump?
- should we append to the tile string to indicate elevated or mitigated threat levels? should it be baked in as a variable?
- trading post starts with a default stock, boosts certain items based on starting class (figure out how to 'deduce' that, or just hard-code it for now), and then
    introduce a random couple boosts?
- should we combine more basic buildings? there's NINE buildings in a starter township. feels like a lot to begin with?
  - the well can be integrated elsewhere; gather+build+storage can combine; maybe also inn+tradepost?
- additional world creation factors to include how chaotic, how aggressive, etc.
- population as a boost, but not an active factor? hrm
- REFACTOR TS: buildings menu under management; 'what you can do here' menu visible (shop, exit, nexus); add 'refine building mats' to mgmt; maybe local item refine separate
- whaaat if we removed initial classes, and have them be joined later?
  - liking that more, level up a bit before we worry about classes, use items and gear and guile
- ooh, we can change the encounter rate to have a 'floor' (so, NOT 1 step minimum :P), so at 1-threat-per-step, a peaceful world rolls between 20 and 100 instead?
- COMBINE: gathering/building/(maybe refining?) all in one stat! MwaHA! choose your battles!
- super expensive 'terraforming' concept?... slowly reshape the land, with limitations and lots of effort
  - mostly 'deconstructive'... slowly knock a mountain down into a hill down into a flatland
  - can later have options to forest up an area, etc., or change the tropicality

DOOPTY
- the only problem I just realized with equipment scaling with stats is that, absent a known 'level,' stat scaling will be a little wackadoo potentially
  - back to the basics: rarity gives more chance at amps


CURRENTLY:
o- how build/upgrade?
  o- define build object... {gps: soulName OR worldID, coords: wps, <otherData>}
o- fix township management so you can't bonk over and manage friends' townships :P
o- adjust township management to slip into 'overview' by default, even after you close and then open again

o- ideally, fix 'SAVE MANAGEMENT SETTINGS' button to be more intuitive and actually compare to state.mgmtData to see if there are changes 
  - actually, on-the-fly changes work for refining, no reason they wouldn't work for gathering, sooooo let's change it to be on-the-fly/consistent

o- let's focus on having first actions being SNAPPY & FAST... quick watchtower? done in minutes! first upgrades? five minutes!
  - so first playing isn't sloggy
  - and new world settlement isn't particularly sloggy either
  - modify construction time of out-of-township stuff by distance AND road connectivity


      HOW TO UPGRADE OR BUILD
      building: 
        - add a "+ Build New Structure" button to top
        - blueprints for now are global; can add specially sourced builds/upgrades later
        - weight capacity for the town comes from limited struct upgrades (initially Crossroad)... should add weight and weightLimit (latter to townstats?)
        - each township level requires a certain amount of builds+upgrades, as well as food+water maintenance
          - township 'consumes' food/water preferentially to operate; starvation levels of food/water don't 'de-level' but put the town in a productivity debuff hole


      upgrading:
        - main "level" upgrades cost substantial resources plus time and money; specializations cost little to no general resources, maybe some special/rare resources, and time+money
        - each spec eats into the 'specWeight' of the struct, can require other specs, and some require overall level or other structs/conditions to be met to unlock
        - specs COULD get a bit more expensive per, based on specWeight; maybe only in terms of time & money?
        - now, how to CODE it?
        

      wares:
        - wares are now 'township global,' and individual structs can get upgrades to sell better stuff

  
    ooh struct SPECIAL ACTIONS such as events... HOST BREW PARTY at the Crossroad for a beer/food (and actionSlot?) cost, gain special effects
      - some can be seasonal/conditional
    
    how to handle 'township level up' concept as well as population... or is level = population, Civ1 style?
      - population -> actionSlots conversion logic?
      - 1 for 1, make it easy; township level = population 'level' = actionSlots (2 + level by default; we can have more with other modifiers from other structs, the way we have it townstatted)

    I have re-decided that TURN-BASED COMBAT is the way to go, with some caveats to keep it crispy. Starkly limited 'wait times' is part of it. :P

    Also, currently refining isn't listed conveniently anywhere; since it's ongoing, having "timber + x.xx/hr" would be super handy
    - and later on, being able to assign multiple 'points'/population to refining to amplify the effect 1-to-1
    - listing the number of refiners active in mgmt screen would be lovely... builders, too, and being able to assign more of them
    - gatherers are still limited to 1/tile, and we can think about how to expand on that later (to be fair, the game DOES offer 48 potential gathering squares :P)



  ??? - should I have a + and - section for gathering, representing hourly gain/loss/change from gathering AND refining endeavors
    - sync'd all recipes to be on a 60 minute, so we can easily show/calc +/- hourly like gathering does

  !!! - beware! currently the 'township drawing' logic is just checking the 'building present' slot [3] for being NOT 0... both main ctx drawing sxns use this wildly simplified logic
  !!! - oops. mountains can and will block our walking, sometimes disasterously... they should ideally find a way to ensure they're not blocking the ONLY walkable terrain



  Anyhoo! Blitzing along:
  x) rejigger gathering income logic on both ends to reference township's tile income data, which can then be expanded upon with STRUCT MASTERIES
  x) list o' structs to build, alpha
  x) list o' upgrades for base and buildables, up to a certain low-ish level (let's say based on township level)
  x) convert struct creation logic in preparation for class Struct() universality for building and upgrading
  -) define township levels/logic
  -) add ability to view details @ structs, build structs, upgrade structs
  -) update income/hour visibility for refine/gather for consistency
  -) add overview for actionSlots used/available on base town mgmt screen
  -) add structView page when booping structs (or + Build New Struct, when added) buttons in town mgmt
  -) time checker/ticker for... hm, building, and maybe eventually crafting (a later concept for now)



  TOWN MANAGEMENT & LEVELING
  - Crossroad's level is now the 'township level' - buildSlots = 2 + crossroad level
  - what if... upgradeCap was derived from the Crossroad's level, instead of specific other stuff?
    - making the Crossroad the most 'unique' leveling struct in terms of costs and requirements would help that along
  - township level can just be the Crossroad's level; the 'heart' of the township, just keep chunking that up
  - can integrate 'reqs' like town wall at a certain level or something, or even soul.history requirements
  - buildLimit is derived from level as well, though in a more procedural way; having +5 buildable structs at level 5 seems a lot :P
    ... or IS it? as struct variance increases, I think it's fine to have a ton of struct points!
    ... ok! actionSlots and buildCapacity = crossroad level
    ... just gotta rejigger the structs to scale in a way that's consistent with this new 'lotsa structs' logic, including having higher-weight buildings

  CHARACTER LEVELS! woo!
  - gain mne, gain levels... at least for awhile (history.mneGained)

  CLASS LEVELS! woo!
  - for now, see Flux below; then come back and flesh it out
  - should probably have a 'starting class' to test drive the concept
  - skills from that starting class can be bought to help segue into the first tier classes in ZC

  FLUX? woo!
  - I like the idea, but what is it "for," and what does it get you?
  - thinking class levels based on "insight" gained from flux usage
  - should we have a 'starter class' before getting our 'four main' classes? Zenithica?
  - for 'rare' or 'limited' actions... turning the Township into a mode of transport, for example
  - sort of a 'time spent beyond the time the player is spending' concept, with a little time-warping shenanigans in there for good measure

  ZENITHICA! woo!
  - a place to buy/sell stuff as character
  - a place to buy/sell township stuff as manager of same
  - various starter classes
  - special events/actions
  - easy way to 'advertise' your self/township, chat with folks, etc.

  
  ... what's that lagtime after creating a character before I can do township management? ... is it the same lagtime as going out the gate?

  
  ... huh, what's our client ref for tile incomes?? ... I don't think it has anything to do with what's on the BE, that's for sure, so we should fix that
  !!! TOWNSHIP SAILING AWAAAAY ... freshwater, shallow ocean, deep ocean, SKY!
    - what precipitates a "driveable" township? <cue Epoch music for some reason>
  ... when doing a mgmt check on a township, it makes sense to check on building projects firstly, then calculate up until each next completed project (if applicable for that timeframe)
    - if a project gets completed, builder(s) can go back to gathering
  ... wares is now becoming just an array for structs; FANCY ware tech can be in a wareMods obj later on
  ... implementing 'township vibes' and edicts such as overclocking and easy breezy would be neat, modifying consumption rates, adding universal mods, etc.
  ??? how do we determine the cost of buying stuff at the shop? hmmm
  ... upon player creation, ZENITHICA echo? ... and while we're at it, adding more meaningful 'ambient messaging' in the Zen chat
  ... there are currently ZERO chatventures, which we should probably remedy at some point :P
  ... it'd be best to offload world gen to the client or a worker-analogue; even the 'tutorial world'/starter world takes a few seconds to do, which would NOT scale well :P
  !!! whoops: hitting "enter"/submitting more than once while creating a new character is a little... wonky, so we should 'lock' that button as we segue into a new world
  ... so booping gathering DOES work in toggling, but does NOT display the change to 'Gather'/'Stop Gathering' string
  ... make sure all the upgrade-y structs do something of use :P ... right now, the tradehall does butt all and isn't worth upgrading in the least
  ... related, but we need to make sure that we list out what we get by upgrading! ... might even want to add an 'upgradeDescription' for JUST describing the upgrade
    - also related to related, we need to see what each struct actually functionally DOES for our township on detailed view :P
  ... hm, loading is SUPER fast when there isn't any data... so what part of loading is taking aaaages after a few players/dates are there?
  ... yeah, 500 starter storage goes away after one overnight, it's too little, EXPAND ITS DEFAULTNESS
  !!! logging out crashes the app now :P ... sometimes. function.keys, undefined, null, etc.
  !!! buggy: accelerating completion of crossroad to level 3 took 5 flux, dropping us to 0, but didn't then give us the 5 we get for the ugprade
  ... hm, when lotta buildings, scrolls WHOLE page, not just the structs, losing the "X"... awkward behavior
  ... currently there's zero reason to upgrade the town wall... should probably see to that at some point
  ... building and upgrading should echo to the tippy-right and to the town chat
  ??? do mountains pop from greenhills? 'cuz they should :P
  ... hm, having enough stat points at start for TWO +5 stats and no negatives seems a bit much if we're doing 10% hops over/under 10

  
  
  STRUCTS + STATS is back, baby! :P (or will be, when I implement it...)
    ... but since stats are now designed to be MUCH more impactful, exercise restraint... on 5th-level capping, perhaps

  STORMIN SKULL NOODLES @ BATTLE
  - monster 'tier' and then sub-classifications, such as "Boss" or "Dragon" or "Toughie"/Elite that modify them stats (and rewards, potentially)
  - monsters can have classes, as well... so, their TIER opens up one set of possibilities, and then their CLASS gives them specific abilities and other mods
  - drop tables based on 'race,' tier, etc.

  - probably rescale player stats to start at 10 across the board, with 10 being 'neutral', and then stats give 5% mods to various endeavors per point
  - might add in additional stats for precision, evasion, etc.
  - add in +/- stats for equipment... nothing provides perfect protection, everything is vulnerable to something, trade-offs are key!
  - main query right now is how to balance scaling/leveling up with tiers being more 'rare' than levels?
  - or tiers just dictate the spread of stats + seeds for monsters under the hood, and we get a sense of what tiers we can tackle as we go
  - so instead of seed stat scaling, we'll have what was preivously derived stat scaling per level, and classes mod that
  - and tiers will be roughly equal to level squared, so Tier 1 = level 1 stats, Tier 2 = level 4, Tier 3 = level 9, Tier 4 = level 16, etc. ... natural asymptote (reverse asymptotes? :P)
    - noooot sold on this yet; may change it up to each tier = 5 levels, or a more manual approach that widens gaps later on
    - circling back, I like 5 level increments a lot better (where tier 0 is actually level 1, probably, not level 0 :P)
  - so define the 'base' job as modding everything * 1, 
  - atk acc def eva mag foc spr res dft cha (the last two are kind of wackadoo and don't fit the opposing-pairs theorem :P)
  
  SO! level ups. how do they work?
  - independent levels from mne primarily (other reqs later); class levels/skill 'bought' from trainers with various forms of mne, 
  mne as a number, and bigMne as special mne? :P ... can define those as we go, in an object, so long as we're careful about nully neighbors



  ALERTS/ALERT TYPES
  - info: array, for stuff like 'building complete,' 'upgrade complete,' 'item received'... just little 'something somewhat noteworthy has happened, possibly offscreen'
    - upper-right, log available probably at some point, rolls down side of page to about halfway probably, fades and then self-dismisses pretty quickly
  - alert: basically anywhere we'd use window.alert(), but fancier and also helpfully self-dismissing
    - middle bottom, animated to grab attention
  - huzzah: you gained a level! ... and such
    - upper left, flourish
  - prompt (subtype: lockPrompt): the user needs to know something RIGHT NOW and acknowledge it; lockPrompt requires a specific input or it won't release
    - lockPrompt can also be conditional, such as 'loading'... withholds exit button until conditions met
    - big and in the center of the damn screen, so make sure it can't happen when being attacked or such, that'd be very rude :P



  ONGOING MGMTDATA PULSES
  - mgmtData then becomes persistent, and live updates more salient
  - pulses should probably come from the player/client to be like 'hey is stuff done yet'; every 5 minutes? with exceptions when we 'know' something will be done sooner?



  FLUX CAPACITY
  [x] 24 + crossroad.level; +1/hr by default, though we need to add that 'income' real quick... DONE
  - flux accelerate: pass time with FLUX POWAH; can only do every so often, maximum efficiency using the ones that use less flux/cover less time
    - basically, flux turns into 'time spent' rapidly; 
    - flux used directly correlated to cooldown time; cooldown is less than flux spent, so having more influx (:P) can make it possible to always have flux to spend on this
    - which is to say, if ACCELERATE costs 10 flux, it'll recharge much faster than 10 hours
    - have to add FLUX ACTION COOLDOWN logic, but for now, WILD FLUX ACTION is non-granular and simply results in flux / 5 hours passing
  - flux flourish: do a wave-to-boss battle on a tile to get... something! OOH, supplies, items, mne, and TILE CHANGE ACCELERATION (as opposed to accelerate, which does only own projects)
  - assuming ACCELERATE works, it does put us more on the hook to have 'idle workers' scoot immediately back to township center when builds are done



  MARCHIN' ALONG:
  [x] add 'asOf: Date()' to mgmtData; that'll be the hook for pulsing tickin'
  - now we kinda need to sort out 'passive receipt' and 'active receipt'... more actually, need a separate way that we set mgmtData when LOOKING (active: true) vs. background
  - then, we need to ensure that we receive mgmtData pretty frequently, especially upon login (rather than only when viewing)
  - after that, universal ongoing tickertocker with smart resets so we're not slamming the poor server (that probably wouldn't scale super well with many users)

  - adding some sort of buying/selling to Zenithica would be great, so brainstorm that to some satisfying simplicity
  - starting at 0 flux, but gaining flux for every struct built/upgraded? and then can do FLUX ACTION: fiiiighto


  okidokie! mgmtData now has tileIncomes: {} and flux: 123, so we can represent tileIncomes accurately now in the client, in theory



  BATTLE REQS
  - a combat system that is resolvable
  - HEALTH: 100 default; MP: ??? default
  - atk/mag/def/res = ((statCalc (~10ish) + level) * classMod) + equipment

  !!! whoops, refreshing while in ZENITHICA removes its interactions... no more nexus, for some reason... locationData.interactions

  WHAT IF...
  - add each thingy having a [ + ] [ - ] [ net ] [ % ] display

  I think we can do 'staggered calcTownIncome for builds' by doing an early check to see if build times conclude before the length of tick -> 'now'
    - if so, separate code that resolves it and re-calls calcTownIncome with hoursToPass adjusted properly
    - may need to put building resolution earlier in the function, and/or have this separate section call calcTownship (to put idle workers back to income generation)
  
  ... rather than forcing a BE ping, we couuuuuld theoretically just keep calculating our income on the FE and tick up there
    - just have to make sure the client and server have exactly the same assumptions/ticks, and we notify the BE whenever something 'exciting' happens

  !!! whoops! we only check if township is capped to disallow more refining; if we have any workers available, it seems we can assign indefinitely :P
  
  
  [?] encounters
    - we can rejigger world vars to alter min threshold 'threat' to get into battle
    - need to know what sort of encounters to 'create' under different circumstances: how many monsters, what levels, etc.
    - transition into and out of battle (shouldn't be TOO hard, just need the right playStack/chatventure hookage)
    - world-based 'encounter table' that uses the data from the tile to generate the encounter
    - hm, it's starting to make more sense to have 'continent encounter data' so that a tile 'knows' which continent it is a part of
      - later on we can get REALLY fancy and define them as zones... so, early on, each continent is a 'zone,' but later on continents can have multiple zones
    - anyway, each world has a default 'tier' off which encounters scale; each individual tile will have a single char in its string that modifies encounter tier
      - be mindful that a single level 10 monster (tier 3) is nowhere near as threatening as, y'know, four or five of same :P
      - so it's important to be able to generate an expectation of 'difficulty' of battle, as well, not just 'tier'/level
    - a second string that modifies encounter group size?
    - we can also have the 'zone stats' give a base encounter 'size,' 
    - worlds can also be 'more dangerous at night, bigger size encounters vs monsters at night,' and so on... well, once we have a day/night cycle

  [?] world map menu (use items, etc.)

  [?] battle
  [?] trading with Zenithica
    - for now, average BUY of base materials = 5 wealth/1 mat
    - average SELL of base materials = 2 wealth/1 mat
    - rarest materials/unique materials appear sporadically?
    - I like the idea of fluctuating pricing based on invisible factors, allowing some 'market trading,' but that's prooobably for later
  [?] recruiting
  [?] equipment (stats, wares, buy/sell)

  [?] how are we gonna handle tier-ing for monsters via world map?
  - MAP PUSH: if map changes substantially, everyone 'in' that map needs to know it, ideally; how to 'subscribe' to maps? just make their own sockets?
  - can be tied to tile-string variable vs world 'tier' default
  - 
  

*/