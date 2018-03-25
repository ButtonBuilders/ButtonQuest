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
        this.attackThread = undefined;
    }

    loadBoss(bossTags, gameState)
    {
        this.boss = this.bossManager.getBoss(bossTags);
        // Have the boss attack the party every 7 seconds
        this.attackThread = setInterval(this.handleBossAttack, 1000, gameState); //Can't use "this" from a setInterval callback
    }

    onStateEnter(oldState, gameState) {
        let bossTags = "frog";
        this.loadBoss(bossTags, gameState);
    }

    onStateExit(newState, gameState) {

    }

    handleBossAttack(gameState)
    {
        let alivePlayers = [];
        for (let i = 0; i < gameState.players.length; i++)
        {
            if (gameState.players[i].currentHealth > 0)
            {
                alivePlayers.push(gameState.players[i].characterID);
            }
        }
        let attack = fightHandler.boss.attack(alivePlayers); 
        if (attack != undefined) {
            setTimeout(fightHandler.bossAttackStart, attack.delay, attack);
            fightHandler.ongoingAttack = attack;
            fightHandler.currentAttackers = fightHandler.attackerStates.boss;
        } else {
            clearInterval(fightHandler.attackThread);
            console.log("Every player has died.");
        }
    }

    bossAttackStart(attack)
    {
        for (let playerID in fightHandler.ongoingAttack.players)
        {
            let player = characterExporter.getCharacter(playerID);
            // Change colours!
        }
        setTimeout(fightHandler.bossAttackEnd, attack.duration);
    }

    bossAttackEnd()
    {
        let toDelete = [];
        for (let i = 0; i < fightHandler.ongoingAttack.players.length; i++)
        {
            let playerID = fightHandler.ongoingAttack.players[i];
            let player = characterExporter.getCharacter(playerID);
            if (player.damage(fightHandler.ongoingAttack.damage)) {
                toDelete.push(i);
                fightHandler.ongoingAttack.players[i] = undefined;
            }
            console.log("Player " + playerID + " took " + fightHandler.ongoingAttack.damage + " damage and has " + player.currentHealth + " hp remaining.");
        }
        for(let i = 0; i < toDelete.length; i++) {
            fightHandler.ongoingAttack.players.splice(i, 1);
        }
        if (fightHandler.ongoingAttack.players.length == 0) {
            //Stop this interval.
            //console.log("Everyone is dead, plz stop");
        }
        fightHandler.currentAttackers = fightHandler.attackerStates.players;
    }

    playerInputDown(playerID, color) {
        let character = characterExporter.getCharacter(playerID);
        switch(this.currentAttackers)
        {
            case this.attackerStates.players:
                let bossDead = this.boss.damage(character.getDamage());
                if (bossDead) {
                    clearInterval(this.attackThread);
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