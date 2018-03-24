
// boss : boss.name, boss.tags[strings]

module.exports = {
    bossBattleIntro : function(boss) {
        return boss.name + " appears before you!!! ";
    },
    playerDied : function(buttonID) {
        return "Player " + buttonID + " has died. ";
    },
    playerInjured : function(buttonID, character, damageDelt) {
        return "Player " + buttonID + " has received " + damageDelt + " damage. ";
    },
    bossSecondStage : function(boss) {
        return boss.name + " hit their second wind! ";
    },
    bossAttack : function(boss) {
        return boss.name + " attacked! ";
    },
    bossHurt : function(boss, damageDealt) {
        return boss.name + " has received " + damageDealt + " damage! ";
    },
    bossDefeated : function(boss) {
        return boss.name + " has been defeated!";
    },
    playerPickedUpLoot : function(buttonID, loot) {
        return "Player " + buttonID + " has acquired " + loot.name + ". ";
    },
    checkBossStatus : function(boss) {
        return boss.name + " has  " + boss.health + " remaining. ";
    },
    encouragingWords : function() {
        return "You got this! ";
    },
    pessimisticWords : function() {
        return "Damn you suck. ";
    },
    playerVoted : function(playerID, vote) {
        return "Player " + playerID + " voted for " + vote + ". ";
    },
    playersVoted : function(voted) {
        return "The end vote was for " + voted + ". ";
    }
};