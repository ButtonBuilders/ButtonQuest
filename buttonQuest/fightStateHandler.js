let characterExporter = require("./character.js");
let itemExporter = require("./item.js");
let bossManagerExporter = require("./bossManager.js");

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
        this.bossManager = bossManagerExporter.BossManager(playerCount);
        this.attackerStates = {
            players : 1,
            boss : 2,
        };
        this.currentAttackers = this.attackerStates.players;
    }

    loadBoss(bossTags, gameState)
    {
        this.boss = this.bossManager.getBoss(bossTags);

        // Have the boss attack the party every 7 seconds
        setInterval(handleBossAttack(), 7000);
    }

    handleBossAttack()
    {
        let attack = this.boss.attack(gameState.players);
        setInterval(bossAttackStart(), attack.delay);
        this.ongoingAttack = attack.players;
        this.currentAttackers = boss;
    }

    bossAttackStart()
    {
        for (player in this.ongoingAttack.players)
        {
            // Change colours!
        }
        setInterval(bossAttackEnd(), attack.duration);
    }

    bossAttackEnd()
    {
        for (player in this.ongoingAttack.players)
        {
            player.damage(this.ongoingAttack.damage);
        }

        this.currentAttackers = players;
    }

    playerInputDown(playerID, color) {
        switch(this.currentAttackers)
        {
            case attackerStates.players:
                let character = characterExporter.getCharacter(playerID);
                let bossDead = this.boss.damage(character.getDamage());
                if (bossDead) {
                    console.log("Boss has been defeated!");
                    buttonQuest.partyLoot = [ itemExporter.getItem("Sword") ];
                    return { result : true, newState : "_LOOT_MODE", message : "The Boss has been defeated! The Sword of Exarrg has been dropped." };
                }
                return { result : false, message : "The boss has lost " + character.getDamage() + " health, with " + this.boss.currentHealth + " health remaining!" };
                break;
            case attackerStates.boss:
                let character = characterExporter.getCharacter(playerID);
                for (player in this.ongoingAttack.players)
                {
                    if (character == player && color == "green")
                    {
                        let index = this.ongoingAttack.players.indexOf(player);
                        this.ongoingAttack.players.splice(index, 1);
                    }
                }
                break;
        }

    }

    playerInputUp(playerID, color) {
    }
}