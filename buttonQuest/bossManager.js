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
		this.bosses;
		this.bosses.push(new Frog(players));
	}

	getBoss(metaTags)
	{
		let highestTagCount = 0;
		let matchingBoss = -1;

		for (let i = 0; i < bosses.length; ++i)
		{
			let tagCount = 0;
			for (tag in bosses[i].tags)
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

		return this.bosses[matchingBoss];
	}
}

class Atttack
{
	constructor()
	{
		this.attackTime = 0;
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

class Boss 
{

}

class Frog extends Boss
{
	constructor(players)
	{
		this.startingHealth = 100 + (players.length * 15);
		this.currentHealth = this.startingHealth;

		this.tags = {
			"frog",
			"weak",
			"swamp",
			"water"
		}
	}

	attack()
	{
		if (this.currentHealth >= this.startingHealth / 2)
		{
			return attackPhaseOne();
		}
		else
		{
			return attackPhaseOne();
		}
	}


	attackPhaseOne()
	{
		let randomAttack = Math.randint(0, 5);

		if (randomAttack <= 3)
		{
			return tongueAttack(3);
		}
		else
		{
			return jumpAttack();
		}
	}

	attackPhaseTwo()
	{
		let randomAttack = Math.randint(0, 2);

		if (randomAttack == 0)
		{
			return tongueAttack(5);
		}
		else
		{
			return jumpAttack();
		}
	}

	// Frog hits 3 random players with his tongue slowly,
	// Then hits 3 random players with his tongue quickly
	tongueAttack(attacks)
	{
		let tongueAttacks = [];

		for (attack in attacks)
		{
			let slowAttack = new Atttack();
			slowAttack.attackTime = 0.5;
			slowAttack.color = "green";
			slowAttack.damage = 10;
			slowAttack.players = players[Math.randint(0, players.length)];
			tongueAttacks.push(slowAttack);
		}
		
		for (attack in attacks)
		{
			let fastAttack = new Attack();
			fastAttack.attackTime = 0.3;
			fastAttack.color = "green";
			fastAttack.damage = 10;
			fastAttack.players = players[Math.randint(0, players.length)];
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
		jumpAttack.attackTime = 3.0;
		jumpAttack.damage = 30;
		jumpAttack.players = players;
		jumpAttack.color = "green";
		jumpAttack.delay = Math.randint(0, 4);
		jumpAttack.attackType = jumpAttack.attackTypes.PRESS_MULITPLE;
		jumpAttack.damageReductionPerPress = 1;
	}


	damage(damageTaken)
	{
		this.currentHealth -= damageTaken;
		if (this.currentHealth <= 0)
		{
			die();
		}
	}

	die()
	{

	}
}