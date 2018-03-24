
module.exports = {
    StateHandlerTemplate : function(playerCount) {
        return new StateHandlerTemplate(playerCount);
    }
};

class StateHandlerTemplate {
    constructor(playerCount) {
        this.playerCount = playerCount;
    }

    playerInputDown(playerID, color) {
        return { result : undefined, message : "" } // newState : "_NEWSTATE_MODE" 
    }

    playerInputUp(playerID, color) {
    }
}