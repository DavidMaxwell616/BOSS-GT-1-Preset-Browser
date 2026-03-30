export class PresetBrowserScene extends Phaser.Scene {
    constructor() {
        super("PresetBrowserScene");
    }

    preload() {
        this.load.json("presets", "../assets/json/boss_gt1_presets.json");
    }

    create() {
        this.currentPresetKey = null;
        this.currentPreset = null;
        this.songRows = [];
        this.headerObjects = [];
        this.footerObjects = [];

        this.bg = this.add.graphics();
        this.uiLayer = this.add.container(0, 0);

        this.drawBackground();
        this.scale.on("resize", this.handleResize, this);

        this.showWelcome();

        const data = this.cache.json.get("presets");
        if (window.initPresetBrowserUI) {
            window.initPresetBrowserUI(data, this);
        }
    }

    selectPreset(key, preset) {
        this.showPreset({ key, preset });
    }

    drawBackground() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.bg.clear();
        this.bg.fillGradientStyle(0x10161d, 0x10161d, 0x19212a, 0x19212a, 1);
        this.bg.fillRect(0, 0, w, h);

        this.bg.fillStyle(0x0d6efd, 0.12);
        this.bg.fillRoundedRect(24, 24, w - 48, h - 48, 20);

        this.bg.lineStyle(2, 0x4c84ff, 0.3);
        this.bg.strokeRoundedRect(24, 24, w - 48, h - 48, 20);
    }

    clearUI() {
        this.uiLayer.removeAll(true);
        this.songRows = [];
        this.headerObjects = [];
        this.footerObjects = [];
    }

    showWelcome() {
        this.clearUI();

        const w = this.scale.width;
        const h = this.scale.height;

        const title = this.add.text(w / 2, h / 2 - 40, "GT-1 Preset Browser", {
            fontFamily: "Arial",
            fontSize: "30px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const sub = this.add.text(w / 2, h / 2 + 10, "Choose a preset from the list on the left", {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#b9c2cc"
        }).setOrigin(0.5);

        const note = this.add.text(w / 2, h / 2 + 46, "Use the filters to narrow by tone, preset, artist, or song", {
            fontFamily: "Arial",
            fontSize: "15px",
            color: "#94a3b8"
        }).setOrigin(0.5);

        this.uiLayer.add([title, sub, note]);
    }

    showPreset(payload) {
        if (!payload) return;

        this.currentPresetKey = payload.key;
        this.currentPreset = payload.preset;

        this.clearUI();
        this.drawBackground();

        const w = this.scale.width;
        const h = this.scale.height;
        const left = 52;
        let y = 52;

        const code = this.add.text(left, y, payload.key, {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#7fb3ff",
            fontStyle: "bold"
        });
        y += 28;

        const name = this.add.text(left, y, payload.preset.name, {
            fontFamily: "Arial",
            fontSize: "30px",
            color: "#ffffff",
            fontStyle: "bold",
            wordWrap: { width: w - 120 }
        });
        y += name.height + 10;

        const tone = this.add.text(left, y, "Tone: " + payload.preset.tone, {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#d0d7de"
        });
        y += 42;

        const divider = this.add.graphics();
        divider.lineStyle(2, 0xffffff, 0.15);
        divider.lineBetween(left, y, w - 52, y);
        y += 18;

        const songsTitle = this.add.text(left, y, "Songs", {
            fontFamily: "Arial",
            fontSize: "22px",
            color: "#ffffff",
            fontStyle: "bold"
        });
        y += 38;

        this.uiLayer.add([code, name, tone, divider, songsTitle]);

        const rowHeight = 42;
        const songs = payload.preset.songs || [];

        for (let i = 0; i < songs.length; i++) {
            const rowY = y + i * rowHeight;

            const bg = this.add.graphics();
            bg.fillStyle(i % 2 === 0 ? 0xffffff : 0x6ea8fe, i % 2 === 0 ? 0.04 : 0.03);
            bg.fillRoundedRect(left, rowY, w - 104, 34, 10);

            const artist = this.add.text(left + 14, rowY + 8, songs[i].artist, {
                fontFamily: "Arial",
                fontSize: "16px",
                color: "#9dc1ff",
                fontStyle: "bold"
            });

            const song = this.add.text(left + 250, rowY + 8, songs[i].song, {
                fontFamily: "Arial",
                fontSize: "16px",
                color: "#ffffff",
                wordWrap: { width: w - 340 }
            });

            this.uiLayer.add([bg, artist, song]);
        }

        const foot = this.add.text(
            left,
            h - 38,
            `${songs.length} song${songs.length === 1 ? "" : "s"} shown`,
            {
                fontFamily: "Arial",
                fontSize: "14px",
                color: "#9aa7b4"
            }
        );
        this.uiLayer.add(foot);
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.resize(width, height);
        this.drawBackground();

        if (this.currentPresetKey && this.currentPreset) {
            this.showPreset({
                key: this.currentPresetKey,
                preset: this.currentPreset
            });
        } else {
            this.showWelcome();
        }
    }
}