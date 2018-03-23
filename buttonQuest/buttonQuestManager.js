let votingStateHandlerExporter = require("./votingStateHandler.js");
let fightStateHandlerExporter = require("./fightStateHandler.js");

let playerCount = 0;
let buttonQuestManager = undefined;

module.exports = {
    launchButtonQuest : function(inGamePlayerCount) {
        playerCount = inGamePlayerCount;
        buttonQuestManager = new ButtonQuestManager(playerCount);

        buttonQuestManager.setState("_VOTING_MODE");

        buttonQuestManager.addStateDownHandler("_VOTING_MODE", votingStateHandlerExporter.VotingStateHandler(playerCount));
        buttonQuestManager.addStateDownHandler("_FIGHT_MODE", fightStateHandlerExporter.FightStateHandler(playerCount));

        return buttonQuestManager;
    }
};

class ButtonQuestManager {
    constructor(inGamePlayerCount) {
        playerCount = inGamePlayerCount;
        this.state = "_VOTING_MODE"; //_VOTING_MODE, _FIGHT_MODE, _LOOT_MODE
        this.stateDownHandlers = {};
        this.stateUpHandlers = {};
    }

    //// States ////
    addStateDownHandler(state, handler) {
        this.stateDownHandlers[state] = handler;
    }

    addStateUpHandler(state, handler) {
        this.stateUpHandlers[state] = handler;
    }

    //// Player Input ////
    playerInputDown(playerID, color) {
        if (this.stateDownHandlers.hasOwnProperty(this.state)) {
            return this.stateDownHandlers[this.state].playerInput(playerID, color);
        }
    }

    playerInputUp(playerID) {
        if (this.stateUpHandlers.hasOwnProperty(this.state)) {
            return this.stateUpHandlers[this.state].playerInput(playerID);
        }
    }

    //// Modes ////
    setState(newState) {
        this.state = newState;
    }

    getState() {
        return this.state;
    }
}
