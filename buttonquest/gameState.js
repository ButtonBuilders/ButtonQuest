module.exports = {
	GameState : function(){
		return new GameState();
	}
};

class GameState
{
	constructor()
	{
		this.encounterTags = [];
		this.encounterCount = 0;
		this.players = [];
	}
}