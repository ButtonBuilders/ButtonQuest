let characterExporter = require("./character.js");
let narrator = require("./narrator.js");

let buttonQuest = undefined;

module.exports = {
    LootStateHandler : function(parentButtonQuest, playerCount) {
        buttonQuest = parentButtonQuest;
        return new LootStateHandler(playerCount);
    }
};

class LootStateHandler {
    constructor(playerCount) {
        this.playerCount = playerCount;
    }

    playerInputDown(playerID, color) {
        if (buttonQuest.partyLoot != undefined && buttonQuest.partyLoot != []) {
            let character = characterExporter.getCharacter(playerID);
            character.pickupWeapon(buttonQuest.partyLoot.pop());
            let msg = narrator.playerPickedUpLoot(playerID, character.getWeapon());
            if (buttonQuest.partyLoot.length == 0) {
                return { result : true, newState : "_VOTING_MODE", message :  msg + "There is no remaining loot."};
            }
            return { result : false, message : msg };
        } else {
            throw "PartyLoot should not be empty when this is called";
        }
    }

    playerInputUp(playerID, color) {
    }

    onStateEnter(oldState, gameState) {
        
    }

    onStateExit(newState, gameState) {

    }
}