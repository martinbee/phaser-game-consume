// MainMenu State: your game’s welcome screen. After the preload state, all the
// game images are already loaded into the memory, so they can quickly accessed.
// Should start game state at some point

export default {
  create() {
    const {
      add,
      game: {
        width,
        height,
        stage,
      },
      highestScore,
    } = this;
    const centerWidth = width / 2;
    const centerHeight = height / 2;

    // set background to white
    stage.backgroundColor = '#fff';

    // write title menu text
    const titleText = 'CONSUME!';
    const titleStyle = { font: '30px Arial', fill: '#000', align: 'center' };
    const titleContent = add.text(centerWidth, centerHeight - 30, titleText, titleStyle);
    titleContent.anchor.set(0.5);

    // write main menu text
    const mainText = 'Tap to begin';
    const mainStyle = { font: '20px Arial', fill: '#000', align: 'center' };
    const mainContent = add.text(centerWidth, centerHeight + 30, mainText, mainStyle);
    mainContent.anchor.set(0.5);

    // write highest score
    const highestScoreText = `Highest score: ${highestScore}`;
    const highestScoreStyle = { font: '10px Arial', fill: '#000', align: 'center' };
    const highestScoreContent = (
      add.text(centerWidth, centerHeight + 70, highestScoreText, highestScoreStyle)
    );
    highestScoreContent.anchor.set(0.5);
  },

  update() {
    if (this.game.input.activePointer.justPressed()) this.game.state.start('Game');
  },

  init(passedScore = 0) {
    // set score to highestScore or passedScore if it was higher
    this.highestScore = this.highestScore || 0;
    this.highestScore = Math.max(passedScore, this.highestScore);
  },
};
