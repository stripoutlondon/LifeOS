# Life OS UX Audit & Redesign Plan

Date: 23 August 2026

## Executive verdict

Life OS has strong feature coverage but weak orchestration. The product currently behaves like a collection of good modules rather than a coherent daily operating system. The user must understand the app's architecture before receiving value. This is the opposite of the intended experience.

The redesign goal is: **Life OS should always answer 'What should I do now?' and make the next useful action obvious.**

## Main problems found

1. **Too many competing surfaces.** Today, The Way, Habits, Goals, Journal, Operate, Whole Life, Alignment Coach, profile/cloud and other modules overlap conceptually.
2. **Feature-first information architecture.** The app is organised around what the software can do rather than the sequence in which a human lives a day.
3. **Today is still too long and mentally expensive.** The Today screen contains intention, priorities, morning checks, daytime checks, notes, evening review, weekly insights and coach content.
4. **Duplicated concepts.** Identity exists in The Way and Operate. Health/habits exist in Habits, Whole Life, Reset and Energy. Reflection exists in Today, Journal, Operate Evening and Coach. Goals/progress appear in Goals and daily priorities. This creates uncertainty over where to record something.
5. **Navigation has been mutated by multiple modules.** Core navigation is generated in index.html while extension scripts append or replace navigation items. This increases fragility and makes mobile navigation inconsistent.
6. **Time awareness is superficial.** The current guide changes copy/steps by hour, but the underlying product still exposes the same large architecture. It does not truly advance a user's state through a day.
7. **No single daily state machine.** There is no authoritative model for Morning -> Ready -> Focus -> Fuel/Reset -> Afternoon -> Close -> Evening -> Sleep. Different modules maintain separate state.
8. **Gamification is mainly completion percentages/checklists.** There is little emotional reward, momentum, streak resilience, progress narrative, celebrations, level-up feedback or visible compounding.
9. **AI is an added module rather than the connective tissue.** Coach sits on top of Today, but the AI should interpret check-ins and update the rest of Life OS automatically.
10. **Manual entry burden remains high.** Users can dictate into fields, but voice is field-level augmentation rather than the primary interaction model.
11. **No first-day journey.** A new user is not guided through defining the life they want, choosing a few priorities, setting routines and seeing an immediate personalised day plan.
12. **Weekly/monthly loops are buried.** Reviews exist, but the product does not clearly graduate daily signals into weekly learning and monthly course correction.
13. **Advanced modules are too visible.** Founder leverage, finances, preventative health, wearables, etc. are useful but should not compete with the daily path.
14. **The app does not yet create anticipation.** There is no strong sense of 'come back at lunch for your 60-second reset' or 'tonight we'll close the loop'.
15. **Mobile ergonomics need a single navigation owner.** Bottom navigation should be rendered in one place only, with four maximum primary destinations.

## Product principle

**The app should be sophisticated underneath and simple on the surface.**

Primary loop:

DECLARE -> PLAN -> DO -> CHECK IN -> LEARN -> NUDGE -> REFLECT -> ADAPT

## New product architecture

### 1. Today — the only screen most users need daily

Today is a guided timeline/state machine, not a dashboard.

It shows only:
- current phase
- next 1–3 actions
- one large Continue / Done control
- a talk-to-Life-OS button
- visible progress through today's journey

Everything completed collapses into a compact timeline.

### 2. Coach

A persistent conversational interface. The user can say anything naturally. AI extracts structured data, updates appropriate modules, identifies patterns and returns one useful intervention. The user should not have to decide whether something belongs in Journal, Energy, Habits or Goals.

### 3. Progress

Shows change over time rather than raw logs:
- alignment trend
- sleep/energy trend
- consistency without punitive streaks
- goals moving/not moving
- experiments and learned patterns
- weekly review summaries
- monthly direction

### 4. Life

The library/settings layer:
- Identity / My Way
- Health
- Relationships
- Work / Founder tools
- Money
- Spirituality
- Joy / Adventure
- Preventative health
- Wearables
- Settings / privacy / integrations

These are editable foundations, not daily destinations.

## Daily flow redesign

### Wake / Morning Launch (2–5 minutes)
1. Wake confirmation (automated later by wearable where available)
2. Water
3. Light / wash / dress
4. Stillness: meditation/prayer/visualisation
5. Identity card: 'Who am I becoming?'
6. Speak: 'What matters today?'
7. AI extracts Top 1 + optional Top 3
8. Start day

UI should show one card at a time or a short vertical sequence with visible completion and encouraging transitions.

### Focus Launch
At the start of the user's main work block:
- show only the #1 outcome
- optional focus timer
- phone-away prompt
- 'Start focus block'
- after block: 'Did you move it forward?' yes/no/voice

### Fuel / Energy Reset
Around first meal / midday:
- 30–60 second voice check-in
- what did you eat? (voice)
- energy now
- walk prompt if configured
- AI gives one adjustment only if useful

### Afternoon / Life
- surface only context-relevant items: second work block, school/family, movement, admin, etc.
- if no action is required, do not create one

### Close Work
- What remains open?
- AI classifies: tomorrow / delegate / automate / eliminate / calendar
- visible 'work closed' state

### Evening / Relationships / Recovery
- family/relationship intention if configured
- dinner
- environment reset
- screens/downshift

### Night / 2-minute Close
User speaks for up to 90 seconds:
- what happened today
- food/alcohol/movement/sleep preparation
- wins/problems/feelings
- relationships/work
AI extracts data and produces:
- alignment summary
- one win
- one lesson
- one upstream adjustment for tomorrow
- bedtime prompt

Then show: **Day complete. Tomorrow is already easier.**

## Gamification redesign

Avoid childish points. Use elegant progress psychology:

- **Daily Journey:** visual path from Wake -> Focus -> Reset -> Close -> Sleep
- **Alignment Ring:** based on user's own stated priorities, not generic morality
- **Momentum:** counts 'days returned to the path', not perfect streaks
- **Wins:** weekly tally of meaningful wins
- **Experiments:** 7/14/30-day experiments with completion and learning summaries
- **Level-ups:** when a behaviour becomes stable, Life OS suggests reducing reminders or raising the standard
- **Milestones:** '7 nights protecting bedtime', '10 walks after lunch', '3 weeks of weekly review'
- **Celebrations:** subtle haptic/visual reward when a phase completes
- **Recovery mechanic:** missed action becomes 'Resume' rather than broken streak

## First-day onboarding

The first experience should be conversational.

1. 'Tell me about the life you want to build.' (voice, up to 5 minutes)
2. AI summarises what it heard under Health, Relationships, Work, Money, Spirit, Joy, Identity.
3. User confirms/edits.
4. 'What would you most like to improve first?'
5. Choose 1–3 priorities only.
6. Define wake/sleep and broad daily rhythm.
7. Choose reminder tone/frequency.
8. Life OS generates the first 14-day starter plan.
9. Immediately enter Today's next step.

No user should need to configure every module before receiving value.

## Weekly flow

Once per week, 5–10 minutes, preferably voice-first.

Life OS prepares the review before the user arrives:
- what improved
- what slipped
- recurring energy/sleep/food patterns
- goals that moved
- people/relationships neglected
- repeated open loops
- founder bottlenecks where enabled
- joy/recovery balance

User answers three questions:
1. What am I proud of?
2. What is getting in my way?
3. What three outcomes matter next week?

AI then updates the next week's plan and reminder strategy.

## Monthly flow

10–20 minutes:
- identity: am I becoming who I chose?
- health/energy trend
- relationship trend
- work/business trend
- money direction
- learning/growth
- joy/adventure
- what to stop/start/continue
- one 'theme of the month'

Monthly output: one-page personal operating brief, not a long questionnaire.

## Notification philosophy

Notifications are contextual nudges, not generic reminders.

Rules:
- user chooses quiet hours and intensity
- completed actions cancel reminders
- repeated ignored reminders are reduced or rescheduled
- AI may suggest better timing, but user controls it
- wearable data can suppress irrelevant prompts (e.g. workout already completed)
- maximum default reminders should be low

Examples:
- Wake: 'Morning. Water first.'
- Stillness: 'Five quiet minutes before the world gets loud.'
- Focus: 'One thing. Protect your best attention.'
- Midday: 'How's your energy? 30-second check-in.'
- Close work: 'Anything still in your head? Tell Life OS and close the loop.'
- Night: 'Phone down. Book open. Tomorrow starts now.'

## Technical redesign recommendations

1. Introduce one canonical `dailyJourney` state model.
2. Stop extension modules from independently mutating bottom navigation.
3. Move current modules behind a single Life library/router.
4. Make AI check-in the universal capture path and write structured outputs into the underlying stores.
5. Consolidate duplicate identity/review/health fields into canonical domains with migration adapters.
6. Keep current data keys readable during migration; do not destroy historical data.
7. Build an event timeline (`life_events`) that can accept manual, AI, wearable and notification-generated events.
8. Use wearable integrations as data sources, not separate user workflows.
9. Notifications should be generated from the daily journey state and user rules.
10. Build analytics around adherence, alignment and outcomes rather than screen engagement.

## What to keep

Keep almost all current capabilities: identity, routines, goals, health, energy, relationships, spirituality, founder leverage, finances, journal, whole-life radar, wearables plan, voice, AI coach, cloud sync. The redesign is primarily about orchestration and progressive disclosure, not feature deletion.

## What to remove from the daily surface

- separate Operate destination
- separate Habits destination
- separate Journal destination
- The Way as a primary nav item
- long forms during normal daily use
- multiple competing daily reviews
- separate manual entry paths for the same fact

## Success criteria

A new user should be able to use Life OS for a full day without explanation.

Targets:
- first useful action visible within 3 seconds
- morning launch <= 5 minutes
- midday check-in <= 60 seconds
- evening close <= 3 minutes
- primary navigation <= 4 destinations
- no user has to decide 'where should I record this?'
- no more than one main coaching recommendation at a time
- user can miss a day without feeling the system is broken
- after 7 days, Life OS can show at least one useful personalised pattern if enough data exists
- after 30 days, user can see clear trend/change across their chosen priorities

## Recommended build order

1. Freeze feature additions.
2. Create canonical daily journey/state model.
3. Rebuild Today around one-step-at-a-time flow.
4. Consolidate navigation to Today / Coach / Progress / Life.
5. Make voice/AI the universal capture path.
6. Map existing data into canonical domains.
7. Add elegant momentum/gamification.
8. Build weekly and monthly auto-prepared reviews.
9. Implement native notification engine.
10. Add wearables as passive input sources.
11. Run 5–10-user usability test before further expansion.
