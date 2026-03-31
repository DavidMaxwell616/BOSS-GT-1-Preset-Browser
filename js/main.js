import { PresetBrowserScene } from "./PresetBrowserScene.js";

const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    backgroundColor: "#0f1318",
    scene: [PresetBrowserScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
