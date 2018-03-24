let characters = {};
let itemExporter = require("./item.js");

module.exports = {
    generateCharacter : function(buttonID, baseHealth, vitality, agility, magic, strength) {
        let newCharacter = new Character(baseHealth, vitality, agility, magic, strength);
        newCharacter.pickupWeapon(itemExporter.getItem("Stick"));
        characters[buttonID] = newCharacter;
        return newCharacter;
    },
    getCharacter : function(buttonID) {
        return characters[buttonID];
    }
};

class Character {
    constructor(baseHealth, vitality, agility, magic, strength) {
        this.weapon = undefined;
        this.baseHealth = baseHealth;
        this.currentHealth = baseHealth + vitality;
        this.vitality = vitality; //Health increase
        this.agility = agility; //Dodge chance
        this.magic = magic; //Magic
        this.strength = strength; //Bows + Swords
    }

    pickupWeapon(newWeapon) {
        this.weapon = newWeapon;
    }

    damage(damageTaken){
        this.currentHealth -= damageTaken;
        if (this.currentHealth <= 0){
            die();
        }
        return false;
    }

    die()
    {
        return true;
    }

    getWeapon() {
        return this.weapon;
    }

    getDamage() {
        return this.weapon.damage + this.strength;
    }
}