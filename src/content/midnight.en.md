# 01 / PRODUCT

## Midnight Persona

**Interactive Adult Entertainment / Product Design & Strategy**

<!-- notice -->

Porn is usually something you watch. In Midnight Persona, you're part of it

It's an interactive erotic world where you can flirt, play out stories, and have virtual sex. Users influence what happens, but they don't control everything. The characters have their own personalities, desires, and ideas about how relationships should develop.

You can teach an AI to flirt with a single prompt. Keeping a character's personality consistent as things unfold, making them respond differently to different actions, and building memory that keeps the experience alive and continuous is another matter entirely.

<!-- preview-end -->

### Under the Hood

I built a dialogue engine that analyzes user behavior, updates relationships, and generates instructions for every reply based on memory and context. It controls when characters take the initiative, keeps their personalities consistent through long conversations, and accounts for what it takes to get close to each one. Two modes, Roleplay and Hotter, steer the story in different directions.

At the same time, the engine tracks the physical state of the scene: location, clothing, poses, and where the characters are positioned. This information is connected to a media catalog, allowing the system to offer photos and videos that match what's happening. The content is produced in advance through a separate generative pipeline, giving me control over quality and visual consistency.

### Money

Monetization is built into the experience itself. Users can pay for something specific they want: a photo, a video, or access to a chat. Or they can subscribe and get access to the entire product. Microtransactions let people pay for what they want, when they want it. Subscriptions let them forget about limits altogether.

Both models run through the same commerce system. I can offer discounts on individual purchases, run subscription promotions around specific events, and offer upgrades. The system keeps track of free limits and purchased access, while offers appear in a contextual media panel right inside the conversation.

### The Artificial Becomes Sensual

AI relationships are often seen as a cheap substitute for human intimacy. I wanted to move past that stigma without hiding the artificial nature of the product or toning down its sexuality.

The art direction is built around contradictions: alive yet synthetic, cold yet human. A sensual digital environment contrasts with the characters' casual, everyday selfies. A strict, straightforward interface connects the two without getting in the way of the interaction.

I wasn't trying to convince people that AI intimacy is normal. I wanted to create an experience where the question simply never comes up.


# 02 / DIALOGUE ENGINE

## LLM Behavior Engine

**AI Systems Engineering / LLM Orchestration**

<!-- accent:full -->

The model writes. The engine controls.

An LLM can come up with almost any continuation of a story. In my case, that's a problem. Characters forget their own decisions, lose their personalities, jump between events, and go along with the user even when they should push back. The more freedom the interaction allows, the harder it becomes to keep everything coherent.

I stopped treating conversation as a sequence of requests to a model. In EngageFlowAI, every turn changes the state of the system. A character's personality, their relationship with the user, the current dynamics of the interaction, memory, and the physical state of the scene all exist as separate but connected layers of control.

<!-- preview-end -->

The engine decides when a character should follow the user's lead, when to assert their own personality, and when to pick up a lost thread of conversation. Instead of relying on a single static prompt, the model receives instructions assembled for the specific situation. The output is checked, and inconsistent responses are regenerated.

### The Physics of a Fictional World

A character has more than a personality. They have a body in space. The engine tracks their position, clothing, surroundings, and physical distance from the user. These states can't change arbitrarily. Every change must follow from an action that actually took place, not simply from the model's intentions or whims.

I built this logic directly into generation. A character can't suddenly end up on a bed if they were standing in the doorway a second ago. Photos and videos follow the same physical model as the dialogue, so what you see never contradicts what's happening.

I gave the model freedom to improvise, but took away its right to forget the rules of the world it creates.

[GitHub / EngageFlowAI](https://github.com/thaelr/EngageFlowAI)

# 03 / ENGINEERING

## Midnight Persona Backend

**Systems Architecture / Full-Stack Engineering**

Midnight Persona has two client applications, its own dialogue engine, a commerce system, and a shared data store. I designed and built the architecture, backend logic, and integrations myself.

I built the first version in n8n. Visual workflows made it easy to change the logic and see what was happening at each step. As the system grew, I moved routing, access control, and commerce into TypeScript. I kept n8n for the AI engine and Telegram interface, where being able to change workflows quickly is actually useful.

### Architecture

<!-- preview-end -->

![[midnight-persona-system-architecture-polished.svg]]

At the core is a modular TypeScript backend shared by Telegram and Web. Both clients use the same accounts, chats, user entitlements, purchases, and media catalog. The backend determines which actions are allowed, while each interface decides how to present them.

I split the business logic into seven domain modules, but didn't turn them into microservices. For example, Products handles products and pricing, Access handles individual entitlements and restrictions, and Commerce handles purchase processing and fulfillment.

Each module has its own responsibility, but they all run in one application. I don't need additional network calls or separate infrastructure just to keep the code organized. Related operations can also run within a single transaction.

### State and Consistency

A single user operation can change several related records at once: purchase status, access rights, and fulfillment history. I handle these operations with PostgreSQL transactions, using SQL functions and constraints where data integrity can't be left to the order of application calls. The schema and functions are versioned through migrations, and logs preserve the history of operations.

There's no shared transaction across independent systems, so for payments, media delivery, and message processing, I use stable identifiers, idempotency, and operation recovery.

For example, if a payment provider doesn't respond to a payment creation request, the system keeps the payment in an unresolved state instead of blindly creating another one. Payment confirmation and access grants are tracked separately: a duplicate webhook can't fulfill the same purchase twice, and failed fulfillment can be recovered without another charge.

A similar problem comes up with AI. If a user resets the scene while a response is being generated, that delayed response must not end up in the new story. The engine and database coordinate changes through state revisions and checks that operations are still current.

### Testing the System

I built a separate integration test environment that runs the actual Gateway, n8n, and PostgreSQL with the full migration history. External services are replaced with controlled test doubles, while tests run through real workflows, APIs, and SQL operations.

Payment scenarios, contracts between repositories, and preservation of existing data during database schema changes are tested separately.

I run development through AI agents. They write the code, while I design the system it has to fit into: defining the architecture, assigning responsibilities to modules, working through complex scenarios, and planning changes.

With this approach, development speed is no longer the main constraint. The hard part is keeping the whole thing working when dozens of connected components are changing at once.That's why I built integration tests that verify the agents' work across the entire system. This lets me handle, on my own, development work that would previously have required a whole team.

[GitHub / Midnight Persona Backend](https://github.com/thaelr/midnight-persona-backend)

# 04 / GENERATIVE MEDIA

## Midnight Persona Media Pipeline

**AI Vision / Generative Production Engineering**

Good dialogue sets expectations the visuals have to meet. For Midnight Persona, I needed thousands of images with recognizable characters, realistic anatomy, and an accurate depiction of what was happening in the scene. All at a cost that made sense for microtransactions.

I built the first pipelines using FLUX and SDXL Pony. FLUX produced convincing realism but wasn't well suited to NSFW and was also painfully slow. Pony could generate explicit scenes, but struggled to keep characters recognizable: at low LoRA weights, they lost their likeness; at high weights, the images turned into unusable slop.

<!-- preview-end -->

I tried compensating for the models' shortcomings with PuLID, IP-Adapter, ControlNet, and automated inpainting, but additional tools often introduced new problems. Around the time of the first commercial tests, there was a boom in open models and NSFW fine-tunes. I had a chance to rethink the entire approach.

Every promising model meant starting almost from scratch: figuring out how to prompt it, testing difficult scenes, comparing results without LoRA and at different weights, and finding the limits of its predictable behavior. I wasn't interested in getting one lucky shot. I wanted quality I could reproduce thousands of times.

Then there was the economics. If generating an image takes tens of seconds and a large share of the results need to be redone, compute costs quickly eat into microtransaction revenue. At the same time, one bad photo can ruin the impression of an entire scene. Quality, speed, and cost couldn't be addressed separately.

### Mass Production

I built a generation system using n8n and ComfyUI, connected to the dialogue engine's physical model.

Most of the work went into designing visual scenarios. I defined what different character states should look like: which combinations of locations, clothing, poses, and actions were valid, which camera angles worked best, and how to get the composition right. I then used AI to scale dozens of manually designed scenarios into hundreds of variations.

I also automated dataset preparation for LoRA training. Later, I added an image-to-video pipeline that could animate photos while preserving the characters' likeness and the original composition.

### Results

Eventually, I found a technical setup that delivers the realism, consistency, and NSFW support I needed without a complicated chain of fixes. I'll keep the exact checkpoint and pipeline design a trade secret.

Generating one image on an RTX 5090 takes around 4 seconds. I've already produced more than 16,000 photos and 500 videos for Midnight Persona.

The estimated production cost is approximately $0.005 per photo and $0.10 per video.

# 05 / ART DIRECTION

## Midnight Persona

**Art Direction / Visual Identity & Interaction Design**

Midnight Persona has a very specific commercial goal: to stand out among erotic AI services and reach beyond their usual audience.

While humanity is still trying to figure out how to make good use of AI, my target user has already worked their way through a bunch of half-baked products. The last thing I want is for them to think, "Oh, this shit again." Even if there was a time when that shit was exciting.

<!-- accent:audience -->

What about a colder audience?

<!-- preview-end -->

There's plenty of stigma around AI intimacy. You can feel sexual desire and still despise the way you satisfy it. I'm sure there's a whole debate somewhere about whether AI relationships are acceptable. I couldn't tell you what exactly they're arguing about. I'm not particularly interested in whether it's acceptable. I'm interested in something else: how can something artificial arouse genuine desire?

Someone watching regular porn already knows what they want. But why on earth would they want to talk to a neural network? Being able to influence what happens means nothing if what's happening doesn't make you feel anything.

And someone who isn't looking for this kind of entertainment at all might be interested in something else entirely: the aesthetics, the strangeness of it, the artificial world itself. They might even want to enter a world they'd never have thought to explore.

I don't think I need to explain to people why they'd want AI intimacy. I should probably make it appealing before explaining anything at all.

### The Artificial Becomes Sensual

I didn't want the entire visual language to revolve around imitating humans. I wanted to know whether something nonhuman could arouse sexual desire on its own, without trying to pass for something alive.

I started with sensations we associate with the body: wetness, warmth, touch, breath. Then applied them to materials that have no body at all. Fogged-up glass with finger marks. Synthetic matter that swells, spreads apart, and comes together in anatomical forms unlike any body known to science.

<!-- accent:recognition -->

You recognize a sensation even when you no longer recognize its source.

There's something alien and unexpectedly sexual about these forms. Liquid matter stretches, intertwines, and wraps around itself. It's too fluid to resemble flesh, but there's something intimate in the way it moves.

There's nothing explicit in the frame. That doesn't stop it from being obscene. The world doesn't try to please the viewer, but it certainly knows how to seduce them.

This was still a commercial product, and I didn't want the characters to become part of that abstraction.

Phone photos, casual angles, familiar bedrooms and bathrooms. I wanted that everyday ordinariness to contrast with the strange world around it. The girls aren't creatures from some fantasy universe. They've just sent you a photo they took in the middle of going about their day.

The world is openly synthetic, and the characters don't exist in reality either, but talking to them can become deeply personal. You can get used to their personalities, wait for a reply, laugh at their antics. And maybe even feel tenderness toward them.

I think that tenderness is what connects things that seem incompatible at first. It doesn't make something artificial alive. But a human feeling doesn't become artificial just because it's directed at something that doesn't exist.

Complicated mechanics and a confusing interface shouldn't get in the way of that feeling. The interface had to be as clear and simple as possible. Precise geometry, straightforward navigation, predictable behavior. Every action needs a clear outcome, every movement should follow a physical logic.

I can probably get away with whatever madness I want in the visual world, as long as it doesn't get in the user's way. The interface just has to work. And work exceptionally well.  At worst, the user just doesn't give a fuck about any of it.

I'm not trying to prove that the artificial is just as good as the real, and I don't want to pass one off as the other. With this project, I was just curious about one thing:

<!-- accent:final -->

**If something artificial can make you feel something real, why should it have to apologize for what it is?**
