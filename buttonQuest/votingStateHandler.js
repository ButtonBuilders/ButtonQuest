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

    playerInput(playerID, color) {
        if (color == "blue") {
            if(this.voting.vote(playerID, "a")) {
                let result = this.voting.getResult("blue", "green");
                this.voting = votingExporter.VotingManager(this.playerCount);
                return result;
            }
        } else if (color == "green") {
            if(this.voting.vote(playerID, "b")) {
                let result = this.voting.getResult("blue", "green");
                this.voting = votingExporter.VotingManager(this.playerCount);
                return result;
            }
        }
        return false;
    }
}