module.exports = {
	BossManager : function(players){
		return new BossManager(players);
	}
};
//let bossManagerExporter = require("./bossManager.js");
//let bossManager = bossManagerExporter.BossManager(playerList);

class BossManager
{    
	constructor(players)
	{
		this.bosses = [];
		this.bosses.push(new Frog(players));
	}

	getBoss(metaTags)
	{
		let highestTagCount = 0;
		let matchingBoss = -1;

		for (let i = 0; i < this.bosses.length; ++i)
		{
			let tagCount = 0;
			for (let tag in this.bosses[i].tags)
			{
				if (metaTags.indexOf(tag) > -1)
				{
					tagCount++;
				}
			}
			if (tagCount > highestTagCount || matchingBoss == -1)
			{
				highestTagCount = tagCount;
				matchingBoss = i;
			}
		}
		console.log(matchingBoss);
		return this.bosses[matchingBoss];
	}
}

class Atttack
{
	constructor()
	{
		this.duration = 0;
		this.delay = 0;
		this.color = "black";
		this.damage = 0;
		this.players = [];
		this.attackTypes = {
			PRESS_ONCE: 1,
  			PRESS_MULITPLE: 2,
  			PRESS_NONE: 3,
		};
		this.attackType = this.attackTypes.PRESS_ONCE;
		this.damageReductionPerPress = 0;
	}
}

class Frog
{
	constructor(players)
	{
		this.startingHealth = 100 + (players * 15);
		this.currentHealth = this.startingHealth;
		this.name = "Frog Face";
		this.tags = ["frog", "weak", "swamp", "water"];
	}

	attack(playerList)
	{
		// Simple attack for testing
		return bubbleAttack(playerList);


		if (this.currentHealth >= this.startingHealth / 2)
		{
			return attackPhaseOne(playerList);
		}
		else
		{
			return attackPhaseOne(playerList);
		}
	}


	attackPhaseOne(playerList)
	{
		let randomAttack = Math.randint(0, 5);

		if (randomAttack <= 3)
		{
			return tongueAttack(3, playerList);
		}
		else
		{
			return jumpAttack(playerList);
		}
	}

	attackPhaseTwo()
	{
		let randomAttack = Math.randint(0, 2);

		if (randomAttack == 0)
		{
			return tongueAttack(5, playerList);
		}
		else
		{
			return jumpAttack(playerList);
		}
	}

	bubbleAttack(playerList)
	{
		let bubbleAttack = new Atttack();
		bubbleAttack.duration = 0.5;
		bubbleAttack.color = "green";
		bubbleAttack.damage = 10;
		playerToAttack = Math.randint(1, playerList.length);
		while (playerToAttack.currentHealth <= 0)
		{
			playerToAttack = Math.randint(1, playerList.length);
		}

		bubbleAttack.players.push(playerToAttack);
		bubbleAttacks.push(bubbleAttack);

		return bubbleAttacks;
	}

	// Frog hits a set amount of players with his tongue slowly,
	// Then hits a set amount players with his tongue quickly
	tongueAttack(attacks, playerList)
	{
		let tongueAttacks = [];

		for (attack in attacks)
		{
			let slowAttack = new Atttack();
			slowAttack.duration = 0.5;
			slowAttack.color = "green";
			slowAttack.damage = 10;
			playerToAttack = Math.randint(1, playerList.length);
			while (playerToAttack.currentHealth <= 0)
			{
				playerToAttack = Math.randint(1, playerList.length);
			}

			slowAttack.players.push(playerToAttack);
			tongueAttacks.push(slowAttack);
		}
		
		for (attack in attacks)
		{
			let fastAttack = new Attack();
			fastAttack.duration = 0.3;
			fastAttack.color = "green";
			fastAttack.damage = 10;
			slowAttack.players.push(Math.randint(1, players + 1));
			tongueAttacks.push(fastAttack);
		}

		return tongueAttacks;
	}

	// Frog jumps into the air, and then after a random time between 1-5 seconds starts to land
	// While he's landing, players get 3 seconds to press their buttons as much as possible,
	// They take 30 - 1 damage for each time they press the button in the 3 seconds.
	jumpAttack()
	{
		let jumpAttack = Attack();
		jumpAttack.duration = 3.0;
		jumpAttack.damage = 30;
		for (i = 0; i < players; ++i)
		{
			jumpAttack.players.push(i);
		}
		jumpAttack.color = "green";
		jumpAttack.delay = Math.random(0, 4);
		jumpAttack.attackType = jumpAttack.attackTypes.PRESS_MULITPLE;
		jumpAttack.damageReductionPerPress = 1;
	}

	damage(damageTaken)
	{
		this.currentHealth -= damageTaken;
		if (this.currentHealth <= 0)
		{
			return die();
		}

		return false;
	}

	die()
	{
		return true;
	}
}