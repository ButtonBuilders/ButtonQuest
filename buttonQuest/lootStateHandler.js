let characterExporter = require("./character.js");

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
            console.log("Character " + playerID + " picked up the " + character.getWeapon().name);
            if (buttonQuest.partyLoot.length == 0) {
                buttonQuest.setState("_VOTING_MODE");
            }
        } else {
            throw "PartyLoot should not be empty when this is called";
        }
    }

    playerInputUp(playerID, color) {
    }
}