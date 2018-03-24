
let characterExporter = require("./character.js");
let itemExporter = require("./item.js");
let narrator = require("./narrator.js");

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
            buttonQuest.partyLoot = [ itemExporter.getItem("Sword"), itemExporter.getItem("Wand") ];
            return { result : true, newState : "_LOOT_MODE", message : narrator.bossDefeated({name : "Toad"})};
        }
        return { result : false, message : narrator.bossHurt({name : "Toad"}, character.getDamage()) };
    }

    playerInputUp(playerID, color) {
    }
}