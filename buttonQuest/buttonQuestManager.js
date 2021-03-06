let votingStateHandlerExporter = require("./votingStateHandler.js");
let fightStateHandlerExporter = require("./fightStateHandler.js");
let lootStateHandlerExporter = require("./lootStateHandler.js");
let gameStateExporter = require("./gameState.js");
let character = require("./character.js");
let narrator = require("./narrator.js");

let playerCount = 0;
let buttonQuestManager = undefined;

let gameState = undefined;

module.exports = {
    launchButtonQuest : function(inGamePlayerCount) {
        playerCount = inGamePlayerCount;
        buttonQuestManager = new ButtonQuestManager(playerCount);
        gameState = gameStateExporter.GameState();

        for(let i = 1; i < playerCount + 1; i++) {
            gameState.players.push(character.generateCharacter(i, 100, 1, 1, 1, 1));
        }

        buttonQuestManager.setState("_VOTING_MODE");
        console.log(narrator.offerVote("option a", "option b"));

        buttonQuestManager.addStateHandler("_VOTING_MODE", votingStateHandlerExporter.VotingStateHandler(playerCount));
        buttonQuestManager.addStateHandler("_FIGHT_MODE", fightStateHandlerExporter.FightStateHandler(buttonQuestManager, playerCount));
        buttonQuestManager.addStateHandler("_LOOT_MODE", lootStateHandlerExporter.LootStateHandler(buttonQuestManager, playerCount));

        return buttonQuestManager;
    },
    getButtonQuest : function() {
        return buttonQuestManager;
    }
};

class ButtonQuestManager {
    constructor(inGamePlayerCount) {
        playerCount = inGamePlayerCount;
        this.state = "_VOTING_MODE"; //_VOTING_MODE, _FIGHT_MODE, _LOOT_MODE
        this.stateHandlers = {};
        this.partyLoot = [];
    }

    //// States ////
    addStateHandler(state, handler) {
        this.stateHandlers[state] = handler;
    }   

    //// Player Input ////
    playerInputDown(playerID, color) {
        if (this.stateHandlers.hasOwnProperty(this.state)) {
            return this.stateHandlers[this.state].playerInputDown(playerID, color);
        }
    }

    playerInputUp(playerID, color) {
        if (this.stateHandlers.hasOwnProperty(this.state)) {
            return this.stateHandlers[this.state].playerInputUp(playerID, color);
        }
    }

    //// Modes ////
    setState(newState) {
        let oldState = this.state;

        let oldStateHandler = this.stateHandlers[oldState];
        let newStateHandler = this.stateHandlers[newState];
        
        if (oldStateHandler != undefined) {
            oldStateHandler.onStateExit(newState, gameState);
        }
        if (newStateHandler != undefined) {
            newStateHandler.onStateEnter(oldState, gameState);
        }

        this.state = newState;
    }

    getState() {
        return this.state;
    }
}
