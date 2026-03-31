export class PresetBrowserScene extends Phaser.Scene {
    constructor() {
        super("PresetBrowserScene");
    }

    preload() {
        this.load.json("presets", "../assets/json/boss_gt1_presets.json");
    }

    create() {
        this.data = this.cache.json.get("presets");

        this.presetsArray = Object.keys(this.data).map((key) => ({
            key,
            name: this.data[key].name,
            tone: this.data[key].tone,
            songs: this.data[key].songs || []
        }));

        this.toneFilter = document.getElementById("toneFilter");
        this.presetFilter = document.getElementById("presetFilter");
        this.searchInput = document.getElementById("searchInput");
        this.presetList = document.getElementById("presetList");
        this.resultsCount = document.getElementById("resultsCount");
        this.clearBtn = document.getElementById("clearBtn");
        this.sortBtn = document.getElementById("sortBtn");
        this.results = document.getElementById("results");
        this.searchInput.addEventListener("input", this.renderPresetList);
        this.toneFilter.addEventListener("change", this.renderPresetList);
        this.presetFilter.addEventListener("change", this.renderPresetList);
        this.clearBtn.addEventListener("click", () => {
            this.searchInput.value = "";
            this.toneFilter.value = "";
            this.presetFilter.value = "";
            this.selectedPresetKey = null;
            this.renderPresetList();
        });
        this.selectedPreset = document.getElementById("selectedPreset");

        this.selectedPresetKey = null;
        this.sortMode = "preset";

        this.toneFilter.innerHTML = `<option value="">All tones</option>`;
        this.presetFilter.innerHTML = `<option value="">All presets</option>`;

        const toneSet = [...new Set(this.presetsArray.map((p) => p.tone))].sort();

        toneSet.forEach((tone) => {
            const opt = document.createElement("option");
            opt.value = tone;
            opt.textContent = tone;
            this.toneFilter.appendChild(opt);
        });

        this.presetsArray
            .slice()
            .sort((a, b) => a.key.localeCompare(b.key))
            .forEach((preset) => {
                const opt = document.createElement("option");
                opt.value = preset.key;
                opt.textContent = `${preset.key} - ${preset.name}`;
                presetFilter.appendChild(opt);
            });

        this.currentPresetKey = this.presetsArray[0].key;
        this.currentPreset = this.presetsArray[0].name;
        this.songRows = [];
        this.headerObjects = [];
        this.footerObjects = [];
        this.renderPresetList();
    }

    getFilteredPresets() {
        const search = searchInput.value.trim().toLowerCase();
        const tone = toneFilter.value;
        const presetKey = presetFilter.value;

        let list = this.presetsArray.filter((p) => {
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

        if (this.sortMode === "preset") {
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

    getVisibleSongsForPreset(preset) {
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

    showPresetInScene(preset) {
        this.selectPreset(preset.key, {
            name: preset.name,
            tone: preset.tone,
            songs: this.getVisibleSongsForPreset(preset)
        });
    }

    selectPreset(key, preset) {
        this.showPreset({ key, preset });
    }

    renderPresetList() {
        const filtered = this.getFilteredPresets();
        this.presetList.innerHTML = "";

        this.resultsCount.textContent = `${filtered.length} preset${filtered.length === 1 ? "" : "s"} found`;

        if (!filtered.length) {
            this.presetList.innerHTML = `
        <div class="alert alert-secondary py-2 px-3">
          No matching presets found.
        </div>
      `;
            this.selectedPresetKey = null;
            return;
        }

        filtered.forEach((preset) => {
            const div = document.createElement("div");
            div.className = "preset-item" + (preset.key === this.selectedPresetKey ? " active" : "");
            div.innerHTML = `
        <div class="preset-code">${preset.key}</div>
        <div class="preset-name">${preset.name}</div>
        <div class="preset-tone">${preset.tone} • ${preset.songs.length} songs</div>
      `;

            div.addEventListener("click", () => {
                this.selectedPresetKey = preset.key;
                this.renderPresetList();
                this.showPresetInScene(preset);
            });

            this.presetList.appendChild(div);
        });

        if (!this.selectedPresetKey || !filtered.some((p) => p.key === this.selectedPresetKey)) {
            this.selectedPresetKey = filtered[0].key;
        }

        const selected = filtered.find((p) => p.key === this.selectedPresetKey);
        if (selected) {
            this.showPresetInScene(selected);
        }
    }

    showPreset(payload) {
        if (!payload) return;
        this.currentPresetKey = payload.key;
        this.currentPreset = payload.preset;

        let html = `
        <div class="selected-preset-key">${payload.key}</div>
        <div class="selected-preset-name">${payload.preset.name}</div>
        <div class="selected-preset-tone">${payload.preset.tone}</div><p>
        <div class="selected-preset-songsTitle">Songs</div> `;
        const songs = payload.preset.songs || [];

        for (let i = 0; i < songs.length; i++) {
            html += `<div class="selected-preset-song">${songs[i].artist} - ${songs[i].song}</div>`
        }
        this.selectedPreset.innerHTML = html;
    }
}
