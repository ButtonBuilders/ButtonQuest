
let characterExporter = require("./character.js");
let itemExporter = require("./item.js");

let buttonQuest = undefined;
let fightHandler = undefined;

module.exports = {
    FightStateHandler : function(parentButtonQuest, playerCount) {
        buttonQuest = parentButtonQuest;
        fightHandler = new FightStateHandler(playerCount);
        return fightHandler;
    },
    getFightStateHandler : function() {
        return fightHandler;
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
            buttonQuest.partyLoot = [ itemExporter.getItem("Sword") ];
            return { result : true, newState : "_LOOT_MODE", message : "The Boss has been defeated! The Sword of Exarrg has been dropped." };
        }
        return { result : false, message : "The boss has lost " + character.getDamage() + " health, with " + this.bossHealth + " health remaining!" };
    }

    playerInputUp(playerID, color) {
    }
}