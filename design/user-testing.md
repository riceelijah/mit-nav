# P5 user testing

I ran two hour-long user tests of the deployed app at [mit-nav.mit-sdg.dev](https://mit-nav.mit-sdg.dev/), one with a cross-registered friend from Harvard, and one with my mom. The app is populated by default with realistic campus data, including room listings for major buildings (E17, 10, 32, E2), student union amenities, floors that match the floor bar, and basic accessibility information. Additionally, I added some realistic reports.

## Task list

I ordered the tasks so that each one builds on the last, since the building a participant picks in Task 1 carries forward into the route tasks (3 and 5), and I planned for about 40 minutes of the hour-long session.

| # | Short Task Title | Instruction (given to participant) | Rationale and learning goals |
| --- | --- | --- | --- |
| 1 | Search and explore a building | "Find a building on campus where you have a class or appointment and open its detail view." | This tests whether a newcomer can find the search bar and make sense of the results without help, which is the gulf of execution. In my own walkthrough I already know where to click, so I wanted to see how someone starting cold does. |
| 2 | Filter by accessibility | "Find a route option that ensures you don't encounter stairs or heavy doors, and inspect what accessibility details are displayed." | This tests whether people can find the accessibility filter and what they take "step-free" to mean. I know what it means because I built it, so I can't judge that from my own walkthrough. |
| 3 | Plan a route from a starting area | "Figure out how to map a walking route to the building you just explored, starting from where you entered campus." | This tests whether people figure out how to set their own starting point, using the building from Task 1 as the destination. I enter an origin without thinking about it, so I wanted to see whether a newcomer finds that control at all. |
| 4 | Find a specific office or landmark | "Search for an administrative office or campus service location by its common name or acronym." | This tests whether search handles nicknames and acronyms and not only building numbers. I already connect acronyms to building numbers in my head, so I would never hit this failure myself. |
| 5 | Time-based route planning | "Determine what time you need to leave to arrive at the destination building by a specific time." | This tests whether people think about timing as when to leave or when to arrive. My own walkthrough just follows a fixed route, so it would not show that difference. |

## Study reports

### Study 1: Harvard cross-registered student

I tested mit-nav.mit-sdg.dev with a Harvard student who commutes in on the Mass Ave bus line, and overall the session showed that the app looks polished but assumes more insider knowledge than a newcomer has. They worked through all five tasks in about an hour, and I decided ahead of time to step in only if they were completely stuck for more than three minutes, so I didn't have to help them other than just writing down their suggestions.

Beginning with the positives, Task 1 went quickly and they liked the clean typography and map, saying the app felt modern. Task 2 is where they first hesitated, because they were not sure whether "step-free" referred to hills outside or included indoor elevators. In Task 3 they looked for a current location button to start from their bus stop and could not find one, so they tried other inputs and eventually dragged the map by hand. In Task 4, searching for Student Financial Services returned zero results. This made me realize that I was missing quite a few important aliases. In Task 5 they found the departure time control but wanted to set an arrival time instead, which frustrated them. Additionally, while looking at a building's floors they did not understand the vertical sidebar at first and suggested adding a layer icon.

In the debrief they said the design is polished, but the missing search aliases and therefore locations, and arrival time planning got in the way of actually using it.

### Study 2: Visiting parent

I tested the app with one of my parents who does not know MIT's layout at all, and overall the session showed that search is the biggest weak point for someone without insider knowledge. The session took about an hour, and my rule was to stay passive unless they asked for help after being stuck for more than three minutes.

The first surprise came on load, since the app already showed a start location, an end location, and a route, which was not what they expected to see. Next, they searched for the Alchemist statue, the Banana lounge, and "s3", and none of them came up because the search has no aliases for those names. A bug also appeared when they typed quickly, as the search bar did not update in time and jumped to Building E2, the top autocomplete result, so they had to pause and retype. On accessibility, "step-free" made them think of zero walking at first, which shows the wording is quite unclear. This also made me consider that it would be nice if I had integrated the shuttle system with the app. They also encountered a bug where text boxes do not select their contents on click, so they had to delete the old text by hand.

There were good moments as well. After a rough start they adjusted the departure time and found a route that worked, and they liked how clean the layout looks. In the debrief they suggested adding dining hall names and better information on points of interest.

## Design flaws and opportunities

### 1. Unlabeled vertical floor bar

- Level: Linguistic
- Severity: Minor
- Why it occurs: The bar has no label or icon saying that it switches floors, so one tester did not understand it at first.
- Improvement: Add a layers icon or a "Floors" label, as the student suggested, at the cost of a little more clutter on the map.

### 2. Ambiguous "step-free" wording

- Level: Linguistic
- Severity: Minor
- Why it occurs: The two testers read the term in different ways (outdoor hills, indoor elevators, or zero walking), so it does not have one clear meaning.
- Improvement: Rename the filter to "Stair-Free Route" and add a tooltip explaining that it covers elevators and ramps.

### 3. Search jumps to E2 when typing fast

- Level: Physical
- Severity: Critical
- Why it occurs: The search box waits 120 ms after the last keystroke before asking the server for matches, and pressing Enter picks the top result of whatever list is showing. When someone types quickly and hits Enter inside that window, the list is still the one from before they typed (buildings first, with E2 at the top), so the box snaps to E2.
- Improvement: Make Enter wait for the pending search to come back before choosing a result, which costs a slight delay on Enter but keeps the choice tied to what was actually typed.

### 4. Missing nicknames, landmarks, and department aliases

- Level: Conceptual
- Severity: Major
- Why it occurs: Searches for statues, lounges, courtyards, and department codes returned nothing because the data does not include natural-language names.
- Improvement: Add popular landmarks, statues, lounge nicknames, and student service department codes to the search index.

### 5. Departure-only time planning

- Level: Conceptual
- Severity: Moderate
- Why it occurs: The app only lets you pick a departure time, but one tester wanted to arrive by a specific time, which is how people usually plan a trip.
- Improvement: Add an "arrive by" option next to "depart at," even though it makes the time controls a bit more complex.
