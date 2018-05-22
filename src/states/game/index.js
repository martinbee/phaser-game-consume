// Game State: the actual game where the FUN takes place.
import Phaser from 'phaser';

export default {
  create() {
    // player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player');
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.5);
    this.player.growthCharges = [];

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
    this.killOutOfBoundEnemies();

    if (this.player.growthCharges.length) this.grow();

    // add food on a timer
    //const foodAlive = this.food.children.filter(food => food.alive);
    if (this.food.countLiving() < 1) this.addFood();
    if (this.enemies.countLiving() < 5) this.addEnemy();
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
    //const numEnemies = this.game.rnd.integerInRange(10, 20);
    const numEnemies = 5;
    let enemy;

    for (let i = 0; i < numEnemies; i += 1) {
      // add sprite
      const {
        x,
        y,
        velocityX,
        velocityY,
      } = this.getInitialSpawnData();

      enemy = this.enemies.create(x, y, 'enemy');
      enemy.scale.setTo(this.game.rnd.integerInRange(2, 10) / 10);

      // physics properties
      enemy.body.velocity.x = velocityX;
      enemy.body.velocity.y = velocityY;
      enemy.anchor.setTo(0.5);
    }
  },
  getInitialSpawnData() {
    const spawnSide = this.game.rnd.integerInRange(0, 3);
    const offset = this.game.rnd.integerInRange(50, 100);

    let x = this.game.world.randomX;
    let y = this.game.world.randomY;
    let velocityX = this.game.rnd.integerInRange(-20, 20);
    let velocityY = this.game.rnd.integerInRange(-20, 20);

    switch (spawnSide) {
      case 0:
        y = 0 - offset;
        velocityY = this.game.rnd.integerInRange(1, 20);
        break;
      case 1:
        x = this.game.world.bounds.width + offset;
        velocityX = this.game.rnd.integerInRange(-20, -1);
        break;
      case 2:
        y = this.game.world.bounds.height + offset;
        velocityY = this.game.rnd.integerInRange(-20, -1);
        break;
      case 3:
      default:
        x = 0 - offset;
        velocityX = this.game.rnd.integerInRange(1, 20);
        break;
    }

    return {
      x,
      y,
      velocityX,
      velocityY,
    };
  },
  hitEnemy(player, enemy) {
    // this works as our sprites are squares
    const isPlayerLargerThanEnemy = player.width > enemy.width;

    if (isPlayerLargerThanEnemy) {
      this.player.growthCharges.push(1);
      enemy.kill();
      this.updateScore();
    } else {
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
    }
  },
  killOutOfBoundEnemies() {
    this.enemies.children.forEach((child) => {
      const { x, y } = child.position;

      const isOutOfXBounds = (x > this.game.world.width + 101) || x < -101;
      const isOutOfYBounds = (y > this.game.world.height + 101) || y < -101;
      const isOutOfBounds = isOutOfXBounds || isOutOfYBounds;

      if (isOutOfBounds) {
        child.kill();
      }
    });
  },
  addEnemy() {
    const {
      x,
      y,
      velocityX,
      velocityY,
    } = this.getInitialSpawnData();
    const enemyPosition = { x, y };
    const enemyVelocity = { x: velocityX, y: velocityY };

    this.recycleGroupMember(this.enemies, enemyPosition, enemyVelocity);
  },

  // food
  generateFood() {
    this.food = this.game.add.group();

    //enable physics in them
    this.food.enableBody = true;
    this.food.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    const numFood = this.game.rnd.integerInRange(1, 5);
    let food;

    for (let i = 0; i < numFood; i += 1) {
      //add sprite
      food = this.food.create(this.game.world.randomX, this.game.world.randomY, 'food');
      food.scale.setTo(0.5);
      food.anchor.setTo(0.5);
    }
  },

  collect(player, food) {
    //play collect sound
    this.collectSound.play();

    this.updateScore();

    //remove sprite
    food.kill();
    this.player.growthCharges.push(1);
  },

  addFood() {
    const foodPosition = {
      x: this.game.world.randomX,
      y: this.game.world.randomY,
    };

    this.recycleGroupMember(this.food, foodPosition);
  },

  grow() {
    this.player.growthCharges.forEach(() => {
      const { x, y } = this.player.scale;
      this.player.scale.setTo(x + 0.05, y + 0.05);
    });

    this.player.growthCharges = [];
  },

  recycleGroupMember(group, position, velocity) {
    // Recycle using getFirstExists(false)
    // Notice that this method will not create new objects if there's no one
    // available, and it won't change size of this group.
    const member = group.getFirstExists(false);

    if (member) {
      member.revive();

      // I do this logic instead of direct assignment because of the type prop
      if (position) {
        member.position.x = position.x;
        member.position.y = position.y;
      }

      // I do this logic instead of direct assignment because of the type prop
      if (velocity) {
        member.body.velocity.x = velocity.x;
        member.body.velocity.y = velocity.y;
      }
    }
  },

  updateScore() {
    this.playerScore += 1;
    this.scoreLabel.text = this.playerScore;
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
