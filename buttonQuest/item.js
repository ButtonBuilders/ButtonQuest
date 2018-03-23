
let items = {};

module.exports = {
    getItem : function(itemName) {
        return items[itemName];
    }
};

class Item {
    constructor(name, damage) {
        this.name = name;
        this.damage = damage;
    }
}

items["Stick"] = new Item("Stick", 10);
items["Sword"] = new Item("Sword", 50);
items["Wand"] = new Item("Wand", 30);