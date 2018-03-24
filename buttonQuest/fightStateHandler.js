let characterExporter = require("./character.js");
let itemExporter = require("./item.js");
let bossManagerExporter = require("./bossManager.js");
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
        console.log("BOSS ");
        console.log(this.boss);
        // Have the boss attack the party every 7 seconds
        setInterval(this.handleBossAttack, 7000);
    }

    handleBossAttack()
    {
        let attack = this.boss.attack(gameState.players);
        setTimeout(this.bossAttackStart, attack.delay);
        this.ongoingAttack = attack.players;
        this.currentAttackers = boss;
    }

    bossAttackStart()
    {
        for (player in this.ongoingAttack.players)
        {
            // Change colours!
        }
        setTimeout(this.bossAttackEnd, attack.duration);
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
        let character = characterExporter.getCharacter(playerID);
        switch(this.currentAttackers)
        {
            case this.attackerStates.players:
                let bossDead = this.boss.damage(character.getDamage());
                if (bossDead) {
                    console.log("Boss has been defeated!");
                    buttonQuest.partyLoot = [ itemExporter.getItem("Sword") ];
                    return { result : true, newState : "_LOOT_MODE", message : narrator.bossDefeated(this.boss)};
                }
                return { result : false, message : narrator.bossHurt(this.boss, character.getDamage()) };
                break;
            case this.attackerStates.boss:
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