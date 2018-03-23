let characters = {};
let itemExporter = require("./item.js");

module.exports = {
    generateCharacter : function(buttonID) {
        let newCharacter = new Character();
        newCharacter.pickupWeapon(itemExporter.getItem("Stick"));
        characters[buttonID] = newCharacter;
        return newCharacter;
    },
    getCharacter : function(buttonID) {
        return characters[buttonID];
    }
};

class Character {
    constructor() {
        this.weapon = undefined;
        this.health = 100;
    }

    pickupWeapon(newWeapon) {
        this.weapon = newWeapon;
    }

    getWeapon() {
        return this.weapon;
    }

    getDamage() {
        return this.weapon.damage;
    }
}