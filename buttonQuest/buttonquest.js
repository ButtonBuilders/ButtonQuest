'use strict';

const Alexa = require('alexa-sdk');
// Gadget Directives Builder
const GadgetDirectives = require('./gadgetDirectives.js');
// Basic Animation Helper Library
const BasicAnimations = require('animation_library/basicAnimations.js');
// Concurrency Wrapper -- see inline comments in exports.handler.
const concurrencyWrapper = require('./concurrencyWrapper.js');

// Temporary workaround for Concurrency Wrapper
function skillHandler(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = '';
    alexa.dynamoDBTableName = 'ButtonQuest'; // if you want to persist Attributes between sessions
    alexa.registerHandlers(globalHandlers, startModeIntentHandlers, playModeIntentHandlers, exitModeIntentHandlers);
    alexa.execute();
}

function interruptAlexa(modeHandler) {
    // To have a button press interrupt the text, use this
    modeHandler.handler.response.response.outputSpeech.playBehavior = 'REPLACE_ALL';
}

function dontEndSessionOrOpenMic(modeHandler) {
    // Deleting shouldEndSession will keep your session open, but NOT open the microphone.
    // You can also set shouldEndSession to false if you want a voice intent also.
    // Never set shouldEndSession to true if you're expecting Input Handler events: you'll lose the session!
    delete modeHandler.handler.response.response.shouldEndSession;
}

exports.handler = function(event, context, callback) {
    console.log("===EVENT=== \n" + JSON.stringify(event)); // Prints Alexa Event Request to CloudWatch logs for easier debugging
    // Newer Echo devices (Echo Gen 2, Echo Plus, Echo Show, Echo Spot) send Echo Button events concurrently
    // to your skill as opposed to how older devices (Echo Gen 1, Echo Dot (Gen 1 and 2) send Echo Button
    // events in FIFO.  To ensure idemtpotency of sessionAttributes across skill requests (see Known Issues
    // errata), we'll use the included concurrenyWrapper.js library for storage and versioning of data we
    // store in sessionAttributes.  
    var params = {
        "event": event,
        "context": context,
        "callback": callback,
        "verboseLogging": false, //set to true to add more logging to CloudWatch
        "minimumResponseSpacing": 1000,
        "stateTableName": 'ButtonStateTable', // Create Table in DynamoDB with primary Key - sessionId
        "primaryKeyName": 'sessionId'
    };
    console.log("Calling concurrenyWrapper");
    return concurrencyWrapper(params, skillHandler);
};

// The skill states are the different parts of the skill.
const states = {
    // Start mode performs roll call and button registration.
    // https://developer.amazon.com/docs/gadget-skills/discover-echo-buttons.html
    START_MODE: '',
    PLAY_MODE: '_PLAY_MODE', //To remove
    VOTING_MODE: '_VOTING_MODE', // Button_down does voting and chooses decision. After everyone votes, narrates a fight entrance and changes to FIGHT_MODE
    FIGHT_MODE: '_FIGHT_MODE', // Button_down and Buttom_up are used for attacks. After the boss dies, narrates the death, droppde loot and goes to DROPS_MODE
    DROPS_MODE: '_DROPS_MODE', // First button to press grabs the loot. If theres more loot, it says the next one and lets useres keep grabbing. On none left, go to VOTING_MODE
    // Exit mode performs the actions described in
    // https://developer.amazon.com/docs/gadget-skills/exit-echo-button-skill.html
    EXIT_MODE: '_EXIT_MODE'
};

// For the entire skill, we'll use the same recognizers and event
// parameters for the GameEngine.StartInputHandler directive.
// https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#start
const recognizers = {
    "button_down_recognizer": {
        "type": "match",
        "fuzzy": false,
        "anchor": "end",
        "pattern": [{
                "action": "down"
            }
        ]
    },
    "button_up_recognizer": {
        "type": "match",
        "fuzzy": false,
        "anchor": "end",
        "pattern": [{
                "action": "up"
            }
        ]
    }
};

const events = {
    "button_down_event": {
        "meets": ["button_down_recognizer"],
        "reports": "matches",
        "shouldEndInputHandler": false
    },
    "button_up_event": {
        "meets": ["button_up_recognizer"],
        "reports": "matches",
        "shouldEndInputHandler": false
    },
    "timeout": {
        "meets": ["timed out"],
        "reports": "history",
        "shouldEndInputHandler": true
    }
};

// ***********************
// Global Handlers - Runs regardless of state

const globalHandlers = {
    'HelpIntent': function() {
        var reprompt = "Listen to the directions.";
        var outputSpeech = 'Welcome to Button Quest. This skill will allow you to play Button Quest. ' + reprompt;

        this.response.speak(outputSpeech).listen(reprompt);
        this.emit(':responseReady');
    },
    'StopIntent': function() {
        console.log('StopIntent');
        this.response.speak('The adventurers head off into the horizon, never to be seen again.');

        //End Game Input Handler
        var startId = this.attributes.StartInputID;
        console.log('End Input Handler - RequestID: ' + startId);

        // Stop Input Handler 
        this.response._addDirective(GadgetDirectives.gameStopInput(startId));

        var deviceIds = this.attributes.DeviceID;
        deviceIds = deviceIds.slice(-2);

        // FadeOut Animation
        this.response._addDirective(GadgetDirectives.gadgetButtonIdle(deviceIds, BasicAnimations.FadeOutAnimation(1, "white", 1000), 0));
        // Reset button animation for skill exit
        this.response._addDirective(GadgetDirectives.gadgetButtonDown([], BasicAnimations.FadeOutAnimation(1, "blue", 200), 0));
        this.response._addDirective(GadgetDirectives.gadgetButtonUp([], BasicAnimations.SolidAnimation(1, "black", 100), 0));

        // Reset State
        delete this.attributes.STATE;
        this.handler.state = '';
        this.emit(':responseReady');
    },
    'UnhandledIntent': function() {
        console.log("Global: unhandled");
        var reprompt = "Please say it again";
        var outputSpeech = "Sorry, I didn't get that. " + reprompt;

        this.response.speak(outputSpeech).listen(reprompt);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
        console.log('SessionEndedRequest');
        // Reset State
        delete this.attributes.STATE;
        this.handler.state = '';
        this.emit(':saveState', true);
    }
};

//////////////////////////////////////////
class VotingManager {
    constructor(playerCount) {
        this.playerCount = playerCount;
        this.reset();
    }

    vote(buttonId, vote) {
        if (!(buttonId in this.votes)) {
            this.votes[buttonId] = vote;
            this.voteCount++;
            if (this.voteCount == this.playerCount){
                let aCount = 0;
                let bCount = 0;
                for (var vote in this.votes) {
                    if (this.votes.hasOwnProperty(vote)) {
                       if (vote == "a"){
                           aCount++;
                       } else if (vote == "b") {
                           bCount++;
                       }
                    }
                }
                this.result = aCount >= bCount? "a" : "b";
                return true;
            } else {
                return false;
            }
        }
    }

    getResult(aWord, bWord) {
        if (this.result != undefined){
            return this.result == "a" ? aWord : bWord;
        } else {
            return undefined;
        }
    }

    reset() {
        this.voteCount = 0;
        this.votes = {};
        this.result = undefined;
    }
}

let voting = new VotingManager();

// ***********************
// State Specific Handlers

// Handlers for when the state is "Start of game" state
const startModeIntentHandlers = Alexa.CreateStateHandler(states.START_MODE, {
    'LaunchRequest': function() {
        this.emit('NewSession');
    },
    'NewSession': function() {
        console.log("Start_Mode - New Session");

        // Roll Call
        var outputSpeech = "Welcome to Button Quest. " +
            //"This skill provides a brief introduction to the core functionality that every Echo Button skill should have. " +
            //"We'll cover roll call, starting and stopping the Input Handler, and button events, which are button up, button down, and timeout. " +
            "Let's get started with roll call. " +
            "Roll call wakes up the buttons to make sure they're connected and ready for play. " +
            "Ok. Press the first button and wait for confirmation before pressing the second button.";

        this.response.speak(outputSpeech);

        this.attributes.rollCall = false;
        this.attributes.expectingEndSkillConfirmation = false;

        // Define List of Buttons used in Skill
        this.attributes.DeviceID = Array.apply(null, {
            length: 3
        });
        this.attributes.DeviceID[0] = "Device ID listings";

        dontEndSessionOrOpenMic(this);

        // Build Start Input Handler Directive
        // Function - gameStartInput(timeout, recognizers, events)
        this.response._addDirective(GadgetDirectives.gameStartInput(50000, recognizers, events));

        // Save StartInput Request ID
        this.attributes.StartInputID = this.event.request.requestId;
        console.log("Start Input Event ID: " + this.event.request.requestId);

        // start keeping track of some state
        this.attributes.buttonCount = 0;

        console.log("==Response== " + JSON.stringify(this.handler.response));
        this.emit(':responseReady');
    },
    'GameEngine.InputHandlerEvent': function() {
        console.log("Start_Mode - InputHandlerEvent");

        let gameEngineEvents = this.event.request.events || [];
        for (let i = 0; i < gameEngineEvents.length; i++) {

            let buttonId;
            var outputSpeech;
            var reprompt;

            // In this request type, we'll see one or more incoming events
            // that correspond to the StartInputHandler we sent above.
            switch (gameEngineEvents[i].name) {
                case 'button_down_event':
                    console.log("Start_Mode - InputHandlerEvent: button_down");

                    // ID of the button that triggered the event
                    buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;
                    var buttonCount = this.attributes.buttonCount;
                    buttonCount += 1;
                    voting = new VotingManager(buttonCount);

                    var deviceIds = this.attributes.DeviceID;

                    // Recognize a new button
                    let isNewButton = false;

                    // Check to see if Button ID is already recorded
                    if (deviceIds.indexOf(buttonId) == -1) {
                        isNewButton = true;
                        this.attributes.DeviceID[buttonCount] = buttonId;

                        this.response._addDirective(GadgetDirectives.gadgetButtonDown([buttonId], BasicAnimations.SolidAnimation(1, "green", 1000), 0));
                        this.response._addDirective(GadgetDirectives.gadgetButtonUp([buttonId], BasicAnimations.SolidAnimation(1, "white", 4000), 0));
                    }

                    dontEndSessionOrOpenMic(this);

                    if (isNewButton) {
                        // Say something when we first encounter a button
                        outputSpeech = 'hello, button ' + buttonCount;
                    } else {
                        // The Button is already registered
                        outputSpeech = 'welcome back, button ' + this.attributes[buttonId];
                    }

                    // Check to see if this is the second button
                    if (buttonCount === 2 && this.attributes.rollCall === false) {
                        this.handler.state = states.VOTING_MODE;
                        outputSpeech = outputSpeech +
                            "<break time='1s'/> Awesome. I've registered two buttons. " +
                            "Now let's learn about button events. Please select one of the following colors: red, blue, or green.";

                        reprompt = "Please pick a color, green red or blue";

                        this.attributes.rollCall = true;
                        this.handler.state = states.PLAY_MODE;

                        interruptAlexa(this);

                        this.response.speak(outputSpeech).listen(reprompt);


                        //End Game Input Handler
                        var startId = this.attributes.StartInputID;
                        console.log('End Input Handler - RequestID: ' + startId);
                        this.response._addDirective(GadgetDirectives.gameStopInput(startId));

                        deviceIds = deviceIds.slice(-2);

                        // Send Animation to Registered Buttons
                        this.response._addDirective(GadgetDirectives.gadgetButtonIdle(deviceIds, BasicAnimations.FadeInAnimation(1, "green", 5000), 0));

                        // Reset button animation 
                        this.response._addDirective(GadgetDirectives.gadgetButtonDown(deviceIds, BasicAnimations.FadeOutAnimation(1, "blue", 200), 0));
                        this.response._addDirective(GadgetDirectives.gadgetButtonUp(deviceIds, BasicAnimations.SolidAnimation(1, "black", 100), 0));
                    } else {
                        this.response._addDirective(GadgetDirectives.gadgetButtonIdle([buttonId], BasicAnimations.SolidAnimation(1, "green", 8000), 0));
                        this.response.speak(outputSpeech);
                    }

                    this.attributes.buttonCount = buttonCount;

                    // Prints Response to CloudWatch Log for Easier debugging
                    console.log("==Response== " + JSON.stringify(this.handler.response));
                    this.emit(':responseReady');
                    break;

                case 'button_up_event':
                    console.log("Start_Mode - InputHandlerEvent: button_up");

                    buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;

                    dontEndSessionOrOpenMic(this);

                    // Prints Response to CloudWatch Log for Easier debugging
                    console.log("==Response== " + JSON.stringify(this.handler.response));
                    this.emit(':responseReady');
                    break;

                case 'timeout':
                    console.log("Start_Mode - InputHandlerEvent: timeout");

                    outputSpeech = "The input handler has timed out. Now I'll ask you if you want to quit. would you like to quit?";
                    reprompt = "should we exit?";

                    this.response.speak(outputSpeech).listen(reprompt);

                    var deviceIds = this.attributes.DeviceID;
                    deviceIds = deviceIds.slice(-2);

                    // FadeOut Animation
                    this.response._addDirective(GadgetDirectives.gadgetButtonIdle(deviceIds, BasicAnimations.FadeOutAnimation(1, "white", 2000), 0));
                    // Reset button animation for skill exit
                    this.response._addDirective(GadgetDirectives.gadgetButtonDown([], BasicAnimations.FadeOutAnimation(1, "blue", 200), 0));
                    this.response._addDirective(GadgetDirectives.gadgetButtonUp([], BasicAnimations.SolidAnimation(1, "black", 100), 0));

                    this.handler.state = states.EXIT_MODE;

                    // Set Skill End flag
                    this.attributes.expectingEndSkillConfirmation = true;

                    // Prints Response to CloudWatch Log for Easier debugging
                    console.log("==Response== " + JSON.stringify(this.handler.response));
                    this.emit(':responseReady');
                    break;
            }
        }
    },
    'AMAZON.StopIntent': function() {
        this.emit('StopIntent');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('CancelIntent');
    },
    'SessionEndedRequest': function() {
        console.log('SessionEndedRequest');
        // Reset State
        delete this.attributes.STATE;
        this.handler.state = '';
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
        console.log("Start_Mode: unhandled");
        this.emit('UnhandledIntent');
    }
});


// Handlers for when the state is "Exit" state
const exitModeIntentHandlers = Alexa.CreateStateHandler(states.EXIT_MODE, {

    'AMAZON.YesIntent': function() {
        console.log("Exit_Mode: Yes");

        if (this.attributes.expectingEndSkillConfirmation === true) {
            // Reset State
            delete this.attributes.STATE;
            this.handler.state = '';

            this.response.speak("Thank you for playing!");
            console.log("==Response== " + JSON.stringify(this.handler.response));
            this.emit(':responseReady');
        } else {
            this.emit('UnhandledIntent');
        }
    },
    'AMAZON.NoIntent': function() {
        console.log("Exit_Mode: No");

        var reprompt;
        var outputSpeech;

        if (this.attributes.expectingEndSkillConfirmation === true) {
            reprompt = "Pick a different color red, blue, green.";
            outputSpeech = "Ok, let's keep going. " + reprompt;

            // Change State back to Play Mode
            this.handler.state = states.PLAY_MODE;

            this.response.speak(outputSpeech).listen(reprompt);
            this.emit(':responseReady');
        } else if (this.attributes.rollCall === false) {
            outputSpeech = "ok, let's continue with roll call. Please press the buttons again.";
            this.response.speak(outputSpeech);

            // Change State back to Start Mode
            this.handler.state = states.START_MODE;

            // Reopen Input Handler
            this.response._addDirective(GadgetDirectives.gameStartInput(50000, recognizers, events));
            // Keep Session Open
            dontEndSessionOrOpenMic(this);

            // Save StartInput Request ID
            this.attributes.StartInputID = this.event.request.requestId;
            console.log("Start Input Event ID: " + this.event.request.requestId);

            this.emit(':responseReady');
        } else {
            this.emit('UnhandledIntent');
        }
    },
    'AMAZON.StopIntent': function() {
        this.emit('StopIntent');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('StopIntent');
    },
    'SessionEndedRequest': function() {
        console.log('SessionEndedRequest');
        // Reset State
        delete this.attributes.STATE;
        this.handler.state = '';
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
        console.log("Exit_Mode: unhandled");
        this.emit('UnhandledIntent');
    }
});

const votingModeIntentHandlers = Alexa.CreateStateHandler(states.VOTING_MODE, {
    'GameEngine.InputHandlerEvent': function() {
        console.log("Voting_Mode - InputHandlerEvent");

        let gameEngineEvents = this.event.request.events || [];
        for (let i = 0; i < gameEngineEvents.length; i++) {
            let buttonId;
            var outputSpeech;
            var reprompt;
            var deviceIds = this.attributes.DeviceID;
            // The color the user chose
            var uColor = this.attributes.ColorChoice;
            // In this request type, we'll see one or more incoming events
            // that correspond to the StartInputHandler we sent above
            switch (gameEngineEvents[i].name) {
                case 'button_down_event':
                    console.log("Voting_Mode - InputHandlerEvent: button_down");

                    // ID of the button that triggered the event
                    buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;

                    // Checks for Invalid Button ID
                    if (deviceIds.indexOf(buttonId) != -1) {
                        var buttonNo = deviceIds.indexOf(buttonId);
                        let done = false;
                        
                        if (uColor == "blue") {
                            done = voting.vote(buttonId, "a");
                        } else if (uColor == "green") {
                            done = voting.vote(buttonId, "b");
                        }

                        outputSpeech = "button " + buttonNo + " voted for " + uColor + ".";

                        if (done) {
                            outputSpeech += " The final result of the voting was was " + getResult("to go down the dark corridor", "to travel up the creeky crickity stairs");
                            //Change state to whatever state comes after voting. Probably fighting
                        }

                        this.response.speak(outputSpeech);
                        interruptAlexa(this);
                    } else {
                        console.log("Invalid Button ID - Do nothing");
                        // Don't send any directives back to Alexa for invalid Button ID Events
                    }

                    dontEndSessionOrOpenMic(this);

                    // Prints Response to CloudWatch Log for Easier debugging
                    console.log("==Response== " + JSON.stringify(this.handler.response));
                    this.emit(':responseReady');
                    break;

                case 'button_up_event':
                    console.log("Voting_Mode - InputHandlerEvent: button_up");

                    buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;

                    // Checks for Invalid Button ID
                    if (deviceIds.indexOf(buttonId) == -1) {
                        console.log("Invalid Button ID - Do nothing");
                        // Don't send any directives back to Alexa for invalid Button ID Events
                    } else {
                        // On releasing the button, we'll replace the idle animation
                        // on the button with a new color from a set of animations
                        // FadeIn Animation
                        this.response._addDirective(GadgetDirectives.gadgetButtonIdle([buttonId], BasicAnimations.FadeInAnimation(1, uColor, 5000), 0));
                    }

                    dontEndSessionOrOpenMic(this);

                    // Prints Response to CloudWatch Log for Easier debugging
                    console.log("==Response== " + JSON.stringify(this.handler.response));
                    this.emit(':responseReady');
                    break;
                case 'timeout':
                    console.log("Voting_Mode - InputHandlerEvent: timeout");

                    outputSpeech = "The input handler has timed out. That concludes our test, would you like to quit?";
                    reprompt = "should we exit?";
                    this.response.speak(outputSpeech).listen(reprompt);

                    deviceIds = deviceIds.slice(-2);

                    // FadeOut Animation
                    this.response._addDirective(GadgetDirectives.gadgetButtonIdle(deviceIds, BasicAnimations.FadeOutAnimation(1, uColor, 2000), 0));
                    // Reset button animation for skill exit
                    this.response._addDirective(GadgetDirectives.gadgetButtonDown(deviceIds, BasicAnimations.FadeOutAnimation(1, "blue", 200), 0));
                    this.response._addDirective(GadgetDirectives.gadgetButtonUp(deviceIds, BasicAnimations.SolidAnimation(1, "black", 100), 0));

                    // Set Skill End flag
                    this.attributes.expectingEndSkillConfirmation = true;
                    this.handler.state = states.EXIT_MODE;

                    // Prints Response to CloudWatch Log for Easier debugging
                    console.log("==Response== " + JSON.stringify(this.handler.response));
                    this.emit(':responseReady');
                    break;
            }
        }
    },
    'AMAZON.StopIntent': function() {
        this.emit('StopIntent');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('StopIntent');
    },
    'SessionEndedRequest': function() {
        console.log('SessionEndedRequest');
        // Reset State
        delete this.attributes.STATE;
        this.handler.state = '';
        this.emit(':saveState', true);
    },
    'Unhandled': function() {
        console.log("Play_Mode: unhandled");
        this.emit('UnhandledIntent');
    }
});

// [Deprecated] Handlers for when the state is in Play mode
const playModeIntentHandlers = Alexa.CreateStateHandler(states.PLAY_MODE, {
    
        'colorIntent': function() {
            console.log("Play_Mode - Color");
    
            var uColor = this.event.request.intent.slots.color.value;
            console.log("User color: " + uColor);
    
            var arr = ['blue', 'green', 'red'];
    
            if (uColor === undefined || arr.indexOf(uColor) == -1) {
                this.emit('Unhandled');
            } else {
    
                this.attributes.ColorChoice = uColor;
    
                // Build Start Input Handler Directive
                this.response._addDirective(GadgetDirectives.gameStartInput(30000, recognizers, events));
    
                // Save StartInput Request ID
                this.attributes.StartInputID = this.event.request.requestId;
                console.log("Start Input Event ID: " + this.event.request.requestId);
    
                var deviceIds = this.attributes.DeviceID;
                deviceIds = deviceIds.slice(-2);
    
                // Build 'idle' breathing animation that will play immediately
                this.response._addDirective(GadgetDirectives.gadgetButtonIdle(deviceIds, BasicAnimations.BreatheAnimation(30, "white", 40), 0));
    
                // Build 'button down' animation for when the button is pressed
                this.response._addDirective(GadgetDirectives.gadgetButtonDown(deviceIds, BasicAnimations.SolidAnimation(1, uColor, 2000), 0));
    
                // build 'button up' animation for when the button is released
                this.response._addDirective(GadgetDirectives.gadgetButtonUp(deviceIds, BasicAnimations.SolidAnimation(1, "white", 500), 0));
    
                var outputSpeech = "Ok. " + uColor + " it is. When you press a button, it will now turn " + uColor + " ." +
                    "Pressing the button will also interrupt me if I'm in the middle of a response. I'll start talking so you can interrupt me. Go ahead and try it. " +
                    "Lorem ipsum dolor sit ahmet pootz, consectetur adipiscing elit, sed do sparkley tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    
                this.response.speak(outputSpeech);
    
                dontEndSessionOrOpenMic(this);
    
                // Prints Response to CloudWatch Log for Easier debugging
                console.log("==Response== " + JSON.stringify(this.handler.response));
                this.emit(':responseReady');
            }
        },
        'GameEngine.InputHandlerEvent': function() {
            console.log("Play_Mode - InputHandlerEvent");
    
            let gameEngineEvents = this.event.request.events || [];
            for (let i = 0; i < gameEngineEvents.length; i++) {
    
                let buttonId;
                var outputSpeech;
                var reprompt;
    
                var deviceIds = this.attributes.DeviceID;
    
                // The color the user chose
                var uColor = this.attributes.ColorChoice;
    
                // In this request type, we'll see one or more incoming events
                // that correspond to the StartInputHandler we sent above
                switch (gameEngineEvents[i].name) {
                    case 'button_down_event':
                        console.log("Play_Mode - InputHandlerEvent: button_down");
    
                        // ID of the button that triggered the event
                        buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;
    
                        // Checks for Invalid Button ID
                        if (deviceIds.indexOf(buttonId) == -1) {
                            console.log("Invalid Button ID - Do nothing");
                            // Don't send any directives back to Alexa for invalid Button ID Events
                        } else {
                            var buttonNo = deviceIds.indexOf(buttonId);
                            outputSpeech = "button " + buttonNo;
    
                            this.response.speak(outputSpeech);
                            interruptAlexa(this);
                        }
    
                        dontEndSessionOrOpenMic(this);
    
                        // Prints Response to CloudWatch Log for Easier debugging
                        console.log("==Response== " + JSON.stringify(this.handler.response));
                        this.emit(':responseReady');
                        break;
    
                    case 'button_up_event':
                        console.log("Play_Mode - InputHandlerEvent: button_up");
    
                        buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;
    
                        // Checks for Invalid Button ID
                        if (deviceIds.indexOf(buttonId) == -1) {
                            console.log("Invalid Button ID - Do nothing");
                            // Don't send any directives back to Alexa for invalid Button ID Events
                        } else {
                            // On releasing the button, we'll replace the idle animation
                            // on the button with a new color from a set of animations
                            // FadeIn Animation
                            this.response._addDirective(GadgetDirectives.gadgetButtonIdle([buttonId], BasicAnimations.FadeInAnimation(1, uColor, 5000), 0));
                        }
                        
                        dontEndSessionOrOpenMic(this);
    
                        // Prints Response to CloudWatch Log for Easier debugging
                        console.log("==Response== " + JSON.stringify(this.handler.response));
                        this.emit(':responseReady');
                        break;
                    case 'timeout':
                        console.log("Play_Mode - InputHandlerEvent: timeout");
    
                        outputSpeech = "The input handler has timed out. That concludes our test, would you like to quit?";
                        reprompt = "should we exit?";
                        this.response.speak(outputSpeech).listen(reprompt);
    
                        deviceIds = deviceIds.slice(-2);
    
                        // FadeOut Animation
                        this.response._addDirective(GadgetDirectives.gadgetButtonIdle(deviceIds, BasicAnimations.FadeOutAnimation(1, uColor, 2000), 0));
                        // Reset button animation for skill exit
                        this.response._addDirective(GadgetDirectives.gadgetButtonDown(deviceIds, BasicAnimations.FadeOutAnimation(1, "blue", 200), 0));
                        this.response._addDirective(GadgetDirectives.gadgetButtonUp(deviceIds, BasicAnimations.SolidAnimation(1, "black", 100), 0));
    
                        // Set Skill End flag
                        this.attributes.expectingEndSkillConfirmation = true;
                        this.handler.state = states.EXIT_MODE;
    
                        // Prints Response to CloudWatch Log for Easier debugging
                        console.log("==Response== " + JSON.stringify(this.handler.response));
                        this.emit(':responseReady');
                        break;
                }
            }
        },
        'AMAZON.StopIntent': function() {
            this.emit('StopIntent');
        },
        'AMAZON.CancelIntent': function() {
            this.emit('StopIntent');
        },
        'SessionEndedRequest': function() {
            console.log('SessionEndedRequest');
            // Reset State
            delete this.attributes.STATE;
            this.handler.state = '';
            this.emit(':saveState', true);
        },
        'Unhandled': function() {
            console.log("Play_Mode: unhandled");
            this.emit('UnhandledIntent');
        }
    });