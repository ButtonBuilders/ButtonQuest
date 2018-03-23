
let buttonQuest = require("./buttonQuestManager.js").launchButtonQuest(4);

console.log("### Launching Button Quest ###");

buttonQuest.playerInputDown(1, "blue");
buttonQuest.playerInputDown(4, "blue");
buttonQuest.playerInputDown(3, "blue");

switch(buttonQuest.playerInputDown(2, "green")) {
    case "blue":
        //Voted blue
        console.log("The adventureres voted blue");
        break;
    case "green":
    default:
        throw "Should have voted blue";
}

buttonQuest.setState("_FIGHT_MODE");

buttonQuest.playerInputDown(1, "blue");
buttonQuest.playerInputDown(2, "blue");
buttonQuest.playerInputDown(1, "blue");
buttonQuest.playerInputDown(4, "blue");