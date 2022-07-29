import {
	App,
	Editor,
	MarkdownView,
	Modal,
	MomentFormatComponent,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { text } from "stream/consumers";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class DayAndNight extends Plugin {
	settings: DayAndNightSettings;

	async onload() {
		await this.loadSettings();
		await this.updateTheme();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"switch",
			"Toggle Theme",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("Toggled Theme");
				this.switchTheme();
			}
		);

		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DayAndNightSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			// console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async updateTheme() {
		let currentTheme = this.settings.dayActive
			? this.settings.dayTheme
			: this.settings.nightTheme;

		console.log("Toggled Theme " + currentTheme);
		// @ts-ignore
		this.app.setTheme(currentTheme);
		// @ts-ignore
		this.app.vault.setConfig("theme", currentTheme);
		this.app.workspace.trigger("css-change");
	}

	async switchTheme() {
		this.settings.dayActive = !this.settings.dayActive;
		this.updateTheme();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DayAndNightSettingTab extends PluginSettingTab {
	plugin: DayAndNight;

	constructor(app: App, plugin: DayAndNight) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Enable Day and Night")
			.addToggle((value) => {
				value.setValue(this.plugin.settings.pluginEnabled);
				value.onChange((value) => {
					this.plugin.settings.pluginEnabled = value;
					this.plugin.saveData(this.plugin.settings);
				});
			});

		// Day  Settings
		let dateFormatSampleEl: MomentFormatComponent;
		new Setting(containerEl)
			.setName("Day Theme")
			.setDesc("Select a Day Theme")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("Light", "Light")
					.addOption("obsidian", "Dark")
					.setValue(this.plugin.settings.dayTheme)
					.onChange((value) => {
						console.log("Setting day theme to value: " + value);
						this.plugin.settings.dayTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(containerEl)
			.setName("Day Start Time")
			.addMomentFormat((format: MomentFormatComponent) => {
				dateFormatSampleEl = format
					.setDefaultFormat("HH:mm")
					.setPlaceholder("HH:mm")
					.setValue(this.plugin.settings.dayTime)
					.onChange((value) => {
						this.plugin.settings.dayTime = value;
						this.plugin.saveData(this.plugin.settings);
					});
			});

		// Night Settings
		let dateFormatSampleE2: MomentFormatComponent;
		new Setting(containerEl)
			.setName("Night Theme")
			.setDesc("Select a Night Theme")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("Light", "Light")
					.addOption("obsidian", "Dark")
					.setValue(this.plugin.settings.nightTheme)
					.onChange((value) => {
						console.log("Setting night theme to value: " + value);
						this.plugin.settings.nightTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(containerEl)
			.setName("Night Start Time")
			.addMomentFormat((format: MomentFormatComponent) => {
				dateFormatSampleE2 = format
					.setDefaultFormat("HH:mm")
					.setPlaceholder("HH:mm")
					.setValue(this.plugin.settings.nightTime)
					.onChange((value) => {
						this.plugin.settings.nightTime = value;
						this.plugin.saveData(this.plugin.settings);
					});
			});
	}
}

interface DayAndNightSettings {
	pluginEnabled: boolean;
	dayActive: boolean;
	dayTheme: string;
	dayTime: string;
	nightTheme: string;
	nightTime: string;
}
