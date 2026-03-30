import { PresetBrowserScene } from "./PresetBrowserScene.js";

window.initPresetBrowserUI = function initPresetBrowserUI(data, scene) {
    const presetsArray = Object.keys(data).map((key) => ({
        key,
        name: data[key].name,
        tone: data[key].tone,
        songs: data[key].songs || []
    }));

    const toneFilter = document.getElementById("toneFilter");
    const presetFilter = document.getElementById("presetFilter");
    const searchInput = document.getElementById("searchInput");
    const presetList = document.getElementById("presetList");
    const resultsCount = document.getElementById("resultsCount");
    const clearBtn = document.getElementById("clearBtn");
    const sortBtn = document.getElementById("sortBtn");

    let selectedPresetKey = null;
    let sortMode = "preset";

    toneFilter.innerHTML = `<option value="">All tones</option>`;
    presetFilter.innerHTML = `<option value="">All presets</option>`;

    const toneSet = [...new Set(presetsArray.map((p) => p.tone))].sort();

    toneSet.forEach((tone) => {
        const opt = document.createElement("option");
        opt.value = tone;
        opt.textContent = tone;
        toneFilter.appendChild(opt);
    });

    presetsArray
        .slice()
        .sort((a, b) => a.key.localeCompare(b.key))
        .forEach((preset) => {
            const opt = document.createElement("option");
            opt.value = preset.key;
            opt.textContent = `${preset.key} - ${preset.name}`;
            presetFilter.appendChild(opt);
        });

    function getFilteredPresets() {
        const search = searchInput.value.trim().toLowerCase();
        const tone = toneFilter.value;
        const presetKey = presetFilter.value;

        let list = presetsArray.filter((p) => {
            if (tone && p.tone !== tone) return false;
            if (presetKey && p.key !== presetKey) return false;

            if (!search) return true;

            const presetMatch =
                p.key.toLowerCase().includes(search) ||
                p.name.toLowerCase().includes(search) ||
                p.tone.toLowerCase().includes(search);

            const songMatch = p.songs.some((s) =>
                s.artist.toLowerCase().includes(search) ||
                s.song.toLowerCase().includes(search)
            );

            return presetMatch || songMatch;
        });

        if (sortMode === "preset") {
            list.sort((a, b) => a.key.localeCompare(b.key));
        } else if (sortMode === "name") {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMode === "tone") {
            list.sort((a, b) => {
                const toneCmp = a.tone.localeCompare(b.tone);
                return toneCmp !== 0 ? toneCmp : a.key.localeCompare(b.key);
            });
        } else if (sortMode === "songs") {
            list.sort((a, b) => b.songs.length - a.songs.length || a.key.localeCompare(b.key));
        }

        return list;
    }

    function getVisibleSongsForPreset(preset) {
        const search = searchInput.value.trim().toLowerCase();
        if (!search) return preset.songs;

        return preset.songs.filter((song) => {
            return (
                preset.key.toLowerCase().includes(search) ||
                preset.name.toLowerCase().includes(search) ||
                preset.tone.toLowerCase().includes(search) ||
                song.artist.toLowerCase().includes(search) ||
                song.song.toLowerCase().includes(search)
            );
        });
    }

    function showPresetInScene(preset) {
        scene.selectPreset(preset.key, {
            name: preset.name,
            tone: preset.tone,
            songs: getVisibleSongsForPreset(preset)
        });
    }

    function renderPresetList() {
        const filtered = getFilteredPresets();
        presetList.innerHTML = "";

        resultsCount.textContent = `${filtered.length} preset${filtered.length === 1 ? "" : "s"} found`;

        if (!filtered.length) {
            presetList.innerHTML = `
        <div class="alert alert-secondary py-2 px-3">
          No matching presets found.
        </div>
      `;
            selectedPresetKey = null;
            scene.showWelcome();
            return;
        }

        filtered.forEach((preset) => {
            const div = document.createElement("div");
            div.className = "preset-item" + (preset.key === selectedPresetKey ? " active" : "");
            div.innerHTML = `
        <div class="preset-code">${preset.key}</div>
        <div class="preset-name">${preset.name}</div>
        <div class="preset-tone">${preset.tone} • ${preset.songs.length} songs</div>
      `;

            div.addEventListener("click", () => {
                selectedPresetKey = preset.key;
                renderPresetList();
                showPresetInScene(preset);
            });

            presetList.appendChild(div);
        });

        if (!selectedPresetKey || !filtered.some((p) => p.key === selectedPresetKey)) {
            selectedPresetKey = filtered[0].key;
        }

        const selectedPreset = filtered.find((p) => p.key === selectedPresetKey);
        if (selectedPreset) {
            showPresetInScene(selectedPreset);
        }
    }

    searchInput.addEventListener("input", renderPresetList);
    toneFilter.addEventListener("change", renderPresetList);
    presetFilter.addEventListener("change", renderPresetList);

    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        toneFilter.value = "";
        presetFilter.value = "";
        selectedPresetKey = null;
        renderPresetList();
    });

    sortBtn.addEventListener("click", () => {
        const order = ["preset", "name", "tone", "songs"];
        const labels = {
            preset: "Sort: Preset",
            name: "Sort: Name",
            tone: "Sort: Tone",
            songs: "Sort: Songs"
        };

        const i = order.indexOf(sortMode);
        sortMode = order[(i + 1) % order.length];
        sortBtn.textContent = labels[sortMode];
        renderPresetList();
    });

    renderPresetList();
};

const gameWrap = document.getElementById("gameWrap");

const config = {
    type: Phaser.AUTO,
    parent: "phaser-game",
    width: gameWrap.clientWidth,
    height: gameWrap.clientHeight,
    backgroundColor: "#0f1318",
    scene: [PresetBrowserScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
    if (game && game.scale) {
        game.scale.resize(gameWrap.clientWidth, gameWrap.clientHeight);
    }
});