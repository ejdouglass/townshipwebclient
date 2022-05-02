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

The choose-your-own-adventure chatventure is still a rare and mythical beast. :P
What we need to get done, as simply as possible:
- can fight, gaining exp, loot, levels, etc. and effecting change (either by getting stuff for township/self, opening up new options, or changing worldMap area params)
- can manage the township by allocating population, building structures, upgrading structures; setting privacy/visit rules
- township ticks away, generating income, events, local worldMap changes
- can do a few basic chatventures, such as patrolling, trading, exploring (DQT style upgrade ability chances for discovery), 




QUICKSCRATCH
-) battle log data/encounter logged data... for achievements, results, resolution possibilities
  - when a chatventure gives you lemons... I mean, an encounter (type: battle), track what everyone got up to! for AI purposes as well as different resolution concepts
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

-) LEVEL SCALING RECONSIDERATION: classLevel as "adventurer level," then match against levels of mobs? HRM... ok, yeah, I kinda like that :P
  - requires some thought about scaling, as well as learning abilities from other classes, multi-classing, and/or class changing


2) test playStack.doing OR mode for enabling combat concepts
  - start it out with just YOU FIND MONSTER(S), but you scout them, so you can FIGHT, KITE, or FLEE
  - for now FIGHT starts a battle, and FLEE just dismisses the possibility
  - let's start with all patrols revealing a single DROOLING HUSK, which if fought just stands there naked and takes hits :P

  - oh, before we wrap up, send to history ... BOB GOES ON PATROL, Y'ALL (and any other echo data we're interested in)



  SCRATCH FOR CURRENT COMBAT IMPLEMENTATION ON SERVER
  - fantastic! husk smacking itself is all operational. now we just have to call actOut again at the end of it all.
  DONE! agent.currentAction is now the basis for transitioning between maneuvers.
  next up: an actual live battle, win or lose


  REFACTOR ABILIITY DONK:
  attack damage is sqrt(atk) * potency * buildupMod * atk/magMod
  defense reduction is sqrt(def)... oh, that certainly doesn't scale against that attack :p
  so let's do base atk vs base def for initial value, then mod up
  ... ok, it works 'alright' but leaves unarmed husks doing VERY little damage at first (though it ramps up pretty quickly with their repeated attacks)
    - I like the core concept, but maybe have higher guaranteed base damage, and have damage reduction be more % based to avoid a lot of 1 dmg early on?
    - or maybe it's fine, especially for now, ONWARD!
  
  (O) So the big challenges now... define core and second-tier abilities for everyone to get them to level whatever
    - have a 'targeting' system
    - loot and level
    - basic materials and item crafting/generation (can make fxns to generate possible stuff under given parameters)
    - decide on core STARTER structs, as well as buildout options for a little bit of playtime
      - core materials, straight level upgrade scheme with new description/nickname (later icon), costs in terms of weight, time, materials
      - STOCKPILE whose job is just to be an inventory

    


    PLAN IT ALL OUT PRE-BUILD - REFACTORS & PREFACTORS
    @combat
    - spellcasting works a bit differently: vanilla casting of spells has a significant windup if that's the only action, buuuut
      - various rituals, techniques, and actions can carry a spellCharge attribute, which defrays the cost of subsequent spell(s)
    - some actions are flagged by default as, or can BECOME through previous actions, 'finishers,' which expend substantial EQL
      - at minimum, all remaining EQL is spent
      - can 'overspend' EQL
      - forces stance reset (999/-999/whatever # we end up on)
    - what happens upon INPUT? note that the WINDUP is 'part' of the technique, even if the windup is 0
      - could we consider the move's COOLDOWN as part of the next move's WINDUP?
    - ok! ... coming along. NOW! let's figure out expected 'income' of exp and loot from battle?


    @leveling
    - gain exp for using skills (just doing visit-style skill spamming shouldn't 'pay' very well :P), spending flux, completing chatventures, etc.
    - Ingress 'main level' it a bit... add in requirements that can be checked; first 10 levels exp-only is fine
    - exp is a spendable amount, but .history.expGained -should- record all expGain for players for leveling purposes
    - AHA! ok, so STATS scale with currentClass(es), simply according to level and without caring about the 'class level' too much
    - classes get a set number of abilities per, with predictable arcs to level them up
      - classes gain exp by mastering their abilities
      - higher class level unlocks bonus stat mods and possible purchasing of higher tier abilities
      - 


    @abilities
    - learn by spending exp (and possibly other requirements... wallet, flux, items, what have you) to unlock
    - jump to Building Classes - abilities in server.js to brainstorm
    - after that, they gain exp by use (1 per use), and can be further trained at certain buildings/trainers
    - level requirement scaling as well as skill level granted based on tier, but can have skills go up based on type, action, etc. (martial up, wind up, etc.)
    - may refactor to universal use() and windup() fxns, which should be able to use the user + their skill obj + their actionQueue to figure everything out


    @materials
    .. refactor:
    - metals, woods, fabrics, leathers, etc. are their own objects that can be filtered for 'tier,' which is the primary determinant of quality
    - aside from tier, slightly different stats/mods/special effect potentials to help differentiate gear made from them for different purposes
    @equipment
    - simplify a bit, with discrete levels of scaling (S-D, 0.25 intervals starting at D-) for stats to contribute to ATK/MAG/DEF/RES
    - each blueprint can have a material requirement for filtering purposes
    - equipment tier/level? hm... but plz, @ kiss
    - ok, so a basic number represents 'scaling', and equipment can have something like
    scaling: {atk: {strength: 1}, mag: {willpower: 1}}, representing a 0.25 scaling for every 1 point (granularity!)
      - so the 'build' of the item confers the first value, and the material represents additional modification potential
      - we can let the client sort out the display of all this
      - maybe the material TIER constitutes the 'basic' scaling of the core item, and material then holds potential for mods that can be applied
      - so for example metals: {copper: {tier: 1, weaponProps: {mag: {willpower: 1}}, armorProps: {res: {intelligence: 1}}, props: {conductive: 3}}}
        - weaponProps would be automatically added to any weapon made of this material, likewise for armorProps
        - props (general properties) can EITHER be a list of general properties OR specific mods
        - general properties would generally scale better
      - weapons can also have atk: {scaling: {...}, mod: 1, impact: 1}, mag: {...likewise}
        - atk mod baked in, impact for eql damage, scaling for stat determination, huzzah
        - should ALL attacks disrupt EQL?... hm, nah, let's assume only if specified
      - armors should probably have some resistance qualities? ... 




    @township & structs
    .. let's try:
    - how BIG is a township to start with? 5x5? is that sufficient? sure, why not, itty bitty township at that level, upgrade with NEXUS (mebbe)
    - universal 10m pulses (followed by saving), and all logic for events/actions/etc. is sorted at that point, resulting in 6 pulses/hour
    - these pulses should have a shot at generating various kinds of events within the township, bringing it to life
      - good, bad, and wacky... but let's keep it relatively simple for now
    - player's LEVEL determines potential by default (how many buildings, upgrade possibilities, etc.) - WEIGHT limit
    - struct upgrades can be dynamic eventually, but for now should be static, a linear series of upgrades
    - most structs can (should?) have population of township assigned to them, and may have 'npc slots' for special functionality/boosts
      - as upgrading occurs, there might be some 'maintenance' minimum to maintain to keep it from falling into disrepair (HP?)
      - some internal logic for handling resource extraction, including access and population, and including any support structure bonuses
    - might add struct HP value, representing overall state of repair or disrepair
    - some structs can exist just to help build population
    - possibly use placeStruct() global fxn to place structs! :P .... oooooooor Class Methods, woooooo!
    - population requires food and water supply/income, at minimum... build a well, and/or allocate some hunters/gatherers/build some farms
    - 
      ..
    @worldMap
    .. gen, changes, interaction with township
    - as the 'basis' for the operations of the township, it needs to be fairly well-defined
    - it's also the basis for a lot of potential random occurrences, so
    - note that worldMap for each township can and will change for various reasons, so will have its own pulses
    - when you 'outgrow' an area, can become starbound to the next possibilities, and maybe land somewhere wacky like a desert (black iron!)
    - let's think about initializing a worldMap...
    
    ideally, we'll have a drawable map array with coords, but that could lead to a LOT of different areas... which is... fiiiiine, actually?

    each square on the map is an 'area' with its own native resources, Civ style but with a little more 'extra' going on
    - structs within the township dictate the potential 'reach' of resource gathering and efficacy
    - worldMap.map gives us a grid of areas, with stuff like rivers, lakes, etc. generated throughout with their own layering logic
    - area biome spawn with a certain robustness from a 'core' (forest growth, hill 'growth,' etc.)
    - each gridArea has its own internal spawn data, resource data
    - each gA also has visitable sub-structs with contextual actions based on said sub-structs, can be 'chill'ed in, and you can move 'room to room'?
      - sounds like a MUD with extra steps :P ... 


    @npcs
    .. doop de doo, they have levels too





    breaks vs 'core' stats, which influence derived stats, but again require a calcStats in there somewhere
      - which also requires some understanding of stats as listed being 'core'/innate
      - and bonus stats become effectiveStats? hmmmm

    also! consider the situation where a player leaves and the entity/others/effects attempt to hit them... never assume the target is in range or visible
      - just a quick note to self to check for that... can have a separate "you there?" fxn that's called in combat checks
    
    QUERY: what mods, status effects, etc. do we want on release? ... probably almost none, realistically, for the tech demo concept
    QUERY: what 'skills' do we want on release? ... what influence 'should' they have, and on what?


6) combat resolution -- win (with some loot, as least wallet+) or flee (with any basic considerations there)
7) give things some TEETH, add combat resolution scenario -- lose (likewise with basic considerations)

o) SHOPPING!
  - will probably require some thought into ware generation, ideally with a little bit of RNG, owner soul checking, and township/struct resources
  - having an NPC 'take over' a struct or become otherwise 'attached' to it can be helpful, depending... but the mechanism for that isn't yet defined
  - ultimately, any 'shopping' / trading mode will just require a stock of wares to be provided, either by a struct or generated with an npc/event

o) TOWNSHIP LOGISTICS
  - refactor worldMap to INCLUDE current township
  - use worldMap data to determine resource availability
  - multiplayer: go to a township, "some for me, some for you" if you go on gathering excursions... everybody wins! ... unless you're terrible :P


O) skim quickscratch, add more interactions, building up to two big ones: patrol and trade
O) we're "ready" when we have basic chatventures, basic leveling, basic township management (interaction, building, surveying), and the ability to chat and pop over with others

REFACTOR:
- chat IS a chatventure; no 'visit' for separate areas of the township
- storybook chatventures are a separate entity, with battles and such, and can still have shopping/etc. overlays theoretically

possibly have 'branching upgrades' at certain struct levels OR for each level, choosing which 'stat' or aspect to focus on

RE-SETTLING: a chatventure of chatventures to scout a new world! 

Balance 'flux costs' versus 'free costs'? Abandon flux entirely? I'unno. I like the idea of a 'hybrid' model of some sort.

Hunting special mobs: job board


GRITTY DITTY (kinda in order):
[_] All icons... they gotta go! We're going FULL TEXT FOR NOW (pending some time to design graphical bits)
[_] Reconfigure character creation to account for NO ICON (no face, get that step outta here)
[_] Auto-recuperate upon returning from chatventure
[_] Define starter abilities for all, and wildly simplify and DQ-ify the ablilities for classes
[_] Rejigger stat scaling, atk/mag/def/spr, equipment level, etc.
[_] Ensure combat EQL lock for 'finisher' moves and scenarios -- lock further inputs if actionIndex is -999, but not if -1 or null
[_] Define the properties of all starting structs
[_] Introduce basic worldbuilding - worldMap gen (oops all husks for now... oops all copper, etc.), make sure everything seems to work alright
  - area types: forest, plains, hills, mountains, tundra, desert
  - each can have subtypes... eventually :P
  - subareas: river, lake
[_] Ensure brandNewPlayer init is properly intact given all of the above
[_] Do some battle testing vs. husks, including resolution and gaining exp, loot, etc.
[_] Mob AI tweaking to 'choose' moves based on weighting, on-the-fly re-targeting
[_] Moar mobs
[_] Moar worldMap gen depth
[_] Township income - township ticks (reminder: stockpile 'copper ore' before we get usable copper)
[_] Finish up basic equipment blueprints (incl. cost)
[_] Flesh out materials (a few tiers in for everything, specials)
[_] Add some new structs to be able to build (laborCost, which is scaled down by population involved in building)
[_] Enable chatventure @ patrol, explore, trade
[_] Township settings @ privacy/visitability, consider adding nuance to following and followedBy as objects with 'status' (friend, etc.)
  - alternatively, player.relationships can cover that one



Fiddlesticks
[_] create ability menu(s) - chill, battle, trade, ??? (or just a 'universal' menu that filters based on context?)
[_] upon player creation, an echo throughout ZENITHICA, woo
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
[_] Add more nuance to materials rather than merely level, reconsider equipment design nuance
[_] It'd be neat if, at later Nexus levels, you could VISIT and cast aoe buff/helper magic and have it 'hit' everyone in that township
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
[_] If we want mobs/npcs to have classes and access to certain global perks (due to easy referencing), they would need to 'live' in an allNpcs and/or allMobs global obj
  - this can be 'derived' from saved DB data without being forcibly shaped thusly, or we could just make separate variables and save them in the aggregate data





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




CHATVENTURE STRUCTURE


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


so you boot up the 'game' fresh. you log in. you may or may not be in a party. that needs to be sorted. 
- you're in a party, neato, resume 'watching' the leader's chatventure
- all chatventures are linked to a player's (unique) name and are the director of what's being seen, the 'playStack Source'
- 

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
  play

  ... having party in here makes combat concepts a LOT easier to manage, I think, especially if ALL playStacks (mobs included) have this format
neoPlayStack: {
  wps: world positioning system, by worldID
  gps: coords within wps
  at: if within a specific struct/town/township present at the current gps
  party: {leader: true, suspended: false, slotRef: 0, comp: []}
  event: {type: 'shop/battle/', id: (maybe?), ...}
  nextAction: {} ... select your battle move, or if just chilling, can have it be a timeOut based on deftness to give a bit of 'delay' vs instant spam of whatever
  overlay: null
  menu: null // often used with events, but not exclusively... menu is an object by default, so can have a 'type' we can match to
}

Aw, heck. Should we say EFF IT and make basic graphical world seeding? A little X by X grid we can stomp around?
- sigh. that's what we're building toward, anyway, sooooooooooooo fine. not much more work than what we're already doing. maybe. KISS? KISS.
- start simple with "OUR PLAYER" being just a little dot or whatever and the terrains being... stupidly little 5-minute tiles to start
- ok, we have... grassland, forest, and nothing else
- this allows us to 'spread' monster data, too, hm
- interesting seed-gen possibilities open up
- need a 'township icon' now too... and logic to 'overlay' it on the tile in question

... nexus needs to know wps/gps to warp back to?
BLOOPTY. Currently easier to refactor everything down here. :P
MOVE WITH SPEED, SIR
[_] Finish neoPlaystack logic, implement, test basics to make sure nothing has exploded violently
[_] Seed building logic, with a 'starter area' setting that guarantees a reachable chunk of forest and grassland, and probably is absurdly small for a 'world'
[_] Finish TileArea basic logic, harmonized with above
  [_] finish defining starter style moves (at least strike and shock) so we can throw 'em on the muglins (and our player)
  [_] class MuglinMob to populate with for testing
    x- decide on how equipment works, rejigger blueprints
    x- eh, just slap basic-ass clubs on everybody for now
    o- nail down logistics for combat flow, pending CHATVENTURE STRUCTURE above
    o- think through tileArea logic for 'random encounters' and spawning muglin camps/gatherings (first area has one as a primary goal to get enough opalite to UP NEXUS and travel to new worlds)
[_] Township management: brainstorm & design, then implement the civ component
[_] Rethink and establish Chatventure structure
[_] Struct new behaviors and brandNewPlayer init spawn of the 'basics'
  [_] Town Gate - exit point for worldMap
  [_] Tavern recruitment! (and maybe struct behaviors in general - refactor/reorder playStack concept for more sensible chatventure layout)
  [_] General Store shopping! (and stock gen)
[_] Amend class mod logic, apply it to new characters upon creation
[_] Add more combat actions: GUARD (always deft 9999), stance logic
[_] Add allMobs, allNPCs (maybe all under allMobs umbrella for ease)
[_] Make combat possible for turn-based now that mobs can spawn battles for us
[_] equipment maker fxn for a given level (and/or given resources)
  ... doable with current means: take their level, pick a blueprint, for each slot they want, search allMaterials, and construct accordingly

[_] NPC gen
  [_] stats, level, etc.
  [_] randomization of name and 'features'
  [_] extra: talents, skills


REACH
[_] Add biome specificity to materials, most likely by adding biome data to allMaterials entries, 
[_] Start in a Husk's chatventure? Hooded figure? ... name area is "who am I?" and enter info there to log in/create, actually 'close your eyes'
  - should definitely whisk 'em up to Zenithica at that point to start the chatting process, though... immediate chance to interact!
  - or start in Zenithica so we can have CHAT-FRONT SHOWCASE and then 'oh you woke up let's pop down'
[_] online/offline hooks upon socket-ing


ATM:
x make client button to request a new map, wait for it, receive it
x canvas time: DRAW the full map into a png file? or nah? figure out whether we want 'full map drawn, chunk out pieces' or just have the canvas draw relevant bits as we go
x 'walk' around the map like a wacky hovering spirit
x make some sprites, do it again!
x add bounding logic (no more walking across the ocean under default parameters)
x tighten up world gen a bit: mini-snakes, landmass distancing, lake logic, river/road support, basic river gen
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
[_] We can pop over to friends' chatrooms and chat wildly
 o- 
 x- 

There's lot of extra growth that's possible beyond that, but hey, room to grow is fun!


Ok, real quick... it's best if we rejigger it so we create a new character and figure out township - world relationship
NEXUS can hold the worldID, as well as coords within the world
... world will have the township info present on said tile, and INTERACT mode for that can involve ENTERing the township/chatroom
... chatroom is saved for regular towns, too? maybe? NPC towns? hmmmmmmm. I dunno.
... but their other functionality would be pretty similar, a collection of structs in an area that can be interacted with.
... when do we 'clean up' a world and dismantle it?
... ok, so allWorlds: id: mapData: [[]], worldData: id: ref, souls: soulRef, soulRef
... okiedoke one sec working on brandNewPlayer a bit, rejiggeirng how townships are structured

need a way to signal we're in the MODE of walkin' aboot
- chatventure sync

township itself can hold information on stuff like tiles available to send to gather?

*/