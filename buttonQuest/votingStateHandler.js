let votingExporter = require("./votingManager.js");

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
        let msg = "Player " + playerID + " voted for " + color + ".";
        if (color == "blue") {
            if(this.voting.vote(playerID, "a")) {
                let toReturn = this.voting.getResult("blue", "green");
                this.voting = votingExporter.VotingManager(this.playerCount);
                return { result : toReturn, newState : "_FIGHT_MODE", message : msg + " The players voted for " + toReturn };
            }
        } else if (color == "green") {
            if(this.voting.vote(playerID, "b")) {
                let toReturn = this.voting.getResult("blue", "green");
                this.voting = votingExporter.VotingManager(this.playerCount);
                return { result : toReturn, newState : "_FIGHT_MODE", message : msg + " The players voted for " + toReturn };
            }
        }
        return { result : false, message : msg };
    }

    playerInputUp(playerID, color) {
    }
}