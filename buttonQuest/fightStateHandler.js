
module.exports = {
    FightStateHandler : function(playerCount) {
        return new FightStateHandler(playerCount);
    }
};

class FightStateHandler {
    constructor(playerCount) {
        this.playerCount = playerCount;
    }

    playerInput(playerID, color) {
        console.log("PLAYER " + playerID + " ATTACKED!");
    }
}