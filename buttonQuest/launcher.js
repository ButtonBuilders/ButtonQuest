let buttonQuest = require("./buttonQuestManager.js").launchButtonQuest(4);
let prompt = require('prompt');

prompt.start();

console.log("### Launching Button Quest ###");

let keepPlaying = true;

let reprompt = function() {
    prompt.get(['playerID', 'color'], function (err, promptResult) {
        let playerID = parseInt(promptResult.playerID);
        let color = promptResult.color != undefined ? promptResult.color : "blue";

        let state = buttonQuest.getState();
        let actionResults = buttonQuest.playerInputDown(playerID, color); // { result : "green", message: "What she'll say", newState : "_FIGHT_MODE" }
        console.log(actionResults["message"]);

        if (actionResults != undefined) {
            switch(state) {
                case "_VOTING_MODE":
                    break;
                case "_FIGHT_MODE":
                    break;
                case "_LOOT_MODE":
                    break;
                default:
                    break;
            }

            if (actionResults.hasOwnProperty("newState")) {
                buttonQuest.setState(actionResults["newState"]);
            }
        }

        if (playerID != -1) {
            reprompt();
        }
    });
}

reprompt();
/*
prompt.get(['user', 'color'], function (err, result) {
    //result.user
    //result.color
});

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
buttonQuest.playerInputDown(4, "blue");
buttonQuest.playerInputDown(1, "blue");
buttonQuest.playerInputDown(2, "blue");
buttonQuest.playerInputDown(1, "blue");
buttonQuest.playerInputDown(4, "blue");
if (buttonQuest.playerInputDown(4, "blue")) { //FINISHING BLOW
    buttonQuest.playerInputDown(1, "red"); //Grab Sword!
    */