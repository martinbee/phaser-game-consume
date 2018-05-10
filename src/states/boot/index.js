// Boot State: general game settings are defined, and the assets of the preloading
// screen are loaded (example the loading bar). Nothing is shown to the user.
// Should start preload state in create

import Phaser from 'phaser';

export default {
  preload() {
    // load assets for preload state
    // replace with my logo
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('preloadBar', 'assets/images/preload-bar.png');
  },

  create() {
    const {
      scale,
      game,
      state,
    } = this;

    // scaling options (REFACTOR INTO WEBPACK??)
    scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    scale.minWidth = 240;
    scale.minHeight = 170;
    scale.maxWidth = 2880;
    scale.maxHeight = 1920;

    // have the game centered horizontally
    scale.pageAlignHorizontally = true;

    // physics system for movement
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // start preload state
    state.start('Preload');
  },
};
