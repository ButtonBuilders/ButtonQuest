module.exports = {
    VotingManager : function(playerCount) {
        return new VotingManager(playerCount);
    }
};

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
                for (let vote in this.votes) {
                    if (this.votes.hasOwnProperty(vote)) {
                       if (this.votes[vote] == 'a'){
                           aCount++;
                       } else if (this.votes[vote] == 'b') {
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
