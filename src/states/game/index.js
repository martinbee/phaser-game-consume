// Game State: the actual game where the FUN takes place.
import Phaser from 'phaser';

export default {
  create() {
    // player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player');
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.5);

    // player initial score
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
    this.playerSpeed = 120;
    this.player.body.collideWorldBounds = true;

    // camera
    this.game.camera.follow(this.player);

    // generate obstables and food
    this.generateEnemies();
    this.generateFood();

    // audio
    this.explosionSound = this.game.add.audio('explosion');
    this.collectSound = this.game.add.audio('collect');

    // show score
    this.showLabels();
  },

  update() {
    // catch user clicking mouse event
    if (this.game.input.activePointer.justPressed()) {
      // move on the direction of the input
      this.game.physics.arcade.moveToPointer(this.player, this.playerSpeed);
    }

    //collision between player and enemies
    this.game.physics.arcade.collide(this.player, this.enemies, this.hitEnemy, null, this);

    //overlapping between player and food (overlap does not affect player physics)
    this.game.physics.arcade.overlap(this.player, this.food, this.collect, null, this);
  },

  // handle end state by restarting to menu
  gameOver() {
    // pass it the score as a parameter
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },

  // utility methods below
  generateEnemies() {
    this.enemies = this.game.add.group();

    // enable physics in enemies
    this.enemies.enableBody = true;
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

    // phaser's random number generator
    const numEnemies = this.game.rnd.integerInRange(10, 20);
    let enemy;

    for (let i = 0; i < numEnemies; i += 1) {
      // add sprite
      const { x, y } = this.getRandomOutsideBoundsSpawnPoints();
      console.log(x, y);
      enemy = this.enemies.create(x, y, 'enemy');
      enemy.scale.setTo(this.game.rnd.integerInRange(1, 4) / 10);

      // physics properties
      enemy.body.velocity.x = this.game.rnd.integerInRange(-20, 20);
      enemy.body.velocity.y = this.game.rnd.integerInRange(-20, 20);
      enemy.body.immovable = true;
    }
  },
  getRandomOutsideBoundsSpawnPoints() {
    const sideToSpawnOn = this.game.rnd.integerInRange(0, 3);
    const offset = this.game.rnd.integerInRange(50, 100);

    let x = this.game.world.randomX;
    let y = this.game.world.randomY;

    switch (sideToSpawnOn) {
      case 0:
        y = 0 - offset;
        break;
      case 1:
        x = this.game.world.bounds.width + offset;
        break;
      case 2:
        y = this.game.world.bounds.height + offset;
        break;
      case 3:
      default:
        x = 0 - offset;
        break;
    }

    return { x, y };
  },
  hitEnemy() {
    //play explosion sound
    this.explosionSound.play();

    //player explosion will be added here
    const emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);

    this.player.kill();

    // end game after a brief period
    this.game.time.events.add(800, this.gameOver, this);
  },

  // food
  generateFood() {
    this.food = this.game.add.group();

    //enable physics in them
    this.food.enableBody = true;
    this.food.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    const numFood = this.game.rnd.integerInRange(5, 10);
    let food;

    for (let i = 0; i < numFood; i += 1) {
      //add sprite
      food = this.food.create(this.game.world.randomX, this.game.world.randomY, 'food');
      food.scale.setTo(0.5);
    }
  },

  collect(player, food) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore += 1;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    food.kill();
  },

  // score
  showLabels() {
    const {
      add,
      game: {
        width,
        height,
      },
    } = this;

    const text = '0';
    const style = { font: '20px Arial', fill: '#fff', align: 'center' };

    this.scoreLabel = add.text(width - 50, height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  },
};
