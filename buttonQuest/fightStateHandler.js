
let characterExporter = require("./character.js");
let itemExporter = require("./item.js");

let buttonQuest = undefined;

module.exports = {
    FightStateHandler : function(parentButtonQuest, playerCount) {
        buttonQuest = parentButtonQuest;
        return new FightStateHandler(playerCount);
    }
};

class FightStateHandler {
    constructor(playerCount) {
        this.playerCount = playerCount;
        this.bossHealth = 100;
    }

    playerInputDown(playerID, color) {
        let character = characterExporter.getCharacter(playerID);
        this.bossHealth -= character.getDamage();
        if (this.bossHealth <= 0) {
            console.log("Boss has been defeated!");
            buttonQuest.setState("_LOOT_MODE");
            buttonQuest.partyLoot = [ itemExporter.getItem("Sword") ];
            return true;
        }
        return false;
    }

    playerInputUp(playerID, color) {
    }
}