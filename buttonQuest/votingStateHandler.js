let votingExporter = require("./votingManager.js");
let narrator = require("./narrator.js");

module.exports = {
    VotingStateHandler : function(playerCount) {
        return new VotingStateHandler(playerCount);
    }
};

class VotingStateHandler {
    constructor(playerCount) {
        this.playerCount = playerCount;
        this.voting = votingExporter.VotingManager(playerCount);
    }

    playerInputDown(playerID, color) {
        let msg = narrator.playerVoted(playerID, color);
        if (color == "blue") {
            if(this.voting.vote(playerID, "a")) {
                let toReturn = this.voting.getResult("blue", "green");
                this.voting = votingExporter.VotingManager(this.playerCount);
                
                return { result : toReturn, newState : "_FIGHT_MODE", message : msg + narrator.playersVoted(toReturn) };
            }
        } else if (color == "green") {
            if(this.voting.vote(playerID, "b")) {
                let toReturn = this.voting.getResult("blue", "green");
                this.voting = votingExporter.VotingManager(this.playerCount);
                return { result : toReturn, newState : "_FIGHT_MODE", message : msg + narrator.playersVoted(toReturn) };
            }
        }
        return { result : false, message : msg };
    }

    playerInputUp(playerID, color) {
    }

    onStateEnter(oldState, gameState) {
        
    }

    onStateExit(newState, gameState) {

    }
}