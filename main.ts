import moment from "moment";
import {
	App,
	MomentFormatComponent,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DayAndNightSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			// console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => {
				this.updateTheme();
			}, 60000)
		);
	}

	onunload() {}

	async updateTheme() {
		if (!this.settings.pluginEnabled) {
			return;
		}
		let currentTheme = this.getThemeToApply();

		this.setTheme(currentTheme);
	}

	private setTheme(currentTheme: string) {
		// @ts-ignore
		this.app.setTheme(currentTheme);
		this.settings.currentTheme = currentTheme;
		console.log(currentTheme);
		// @ts-ignore
		this.app.vault.setConfig("theme", currentTheme);
		this.app.workspace.trigger("css-change");
	}

	private getThemeToApply(): string {
		let dayDate: Date = moment(
			this.settings.dayTime,
			moment.HTML5_FMT.TIME
		).toDate();

		let nightDate: Date = moment(
			this.settings.nightTime,
			moment.HTML5_FMT.TIME
		).toDate();

		if (moment().isBefore(dayDate)) {
			return this.settings.dayTheme;
		} else if (moment().isSameOrAfter(nightDate)) {
			return this.settings.nightTheme;
		}
		return "";
	}

	async switchTheme() {
		this.settings.currentTheme = this.getThemeToApply();
		if (this.settings.currentTheme === this.settings.dayTheme) {
			this.setTheme(this.settings.nightTheme);
		} else {
			this.setTheme(this.settings.dayTheme);
		}
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

		containerEl.createEl("h2", {
			text: "Settings for Day and Night plugin.",
		});

		this.addPluginToggleSetting();
		if (this.plugin.settings.pluginEnabled) {
			this.addDaySettings();
			this.addNightSettings();
		}
	}

	private addPluginToggleSetting(): void {
		new Setting(this.containerEl)
			.setName("Enable Day and Night")
			.addToggle((value) => {
				value.setValue(this.plugin.settings.pluginEnabled);
				value.onChange((value) => {
					this.plugin.settings.pluginEnabled = value;
					this.plugin.saveData(this.plugin.settings);
					this.display();
				});
			});
	}

	private addNightSettings(): void {
		new Setting(this.containerEl)
			.setName("Night Theme")
			.setDesc("Select a Night Theme")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("Light", "Light")
					.addOption("obsidian", "Dark")
					.setValue(this.plugin.settings.nightTheme)
					.onChange((value) => {
						this.plugin.settings.nightTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName("Night Start Time")
			.addMomentFormat((format: MomentFormatComponent) => {
				format
					.setDefaultFormat("HH:mm")
					.setPlaceholder("HH:mm")
					.setValue(this.plugin.settings.nightTime)
					.onChange((value) => {
						this.plugin.settings.nightTime = value;
						this.plugin.saveData(this.plugin.settings);
					});
			});
	}

	private addDaySettings(): void {
		new Setting(this.containerEl)
			.setName("Day Theme")
			.setDesc("Select a Day Theme")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("Light", "Light")
					.addOption("obsidian", "Dark")
					.setValue(this.plugin.settings.dayTheme)
					.onChange((value) => {
						this.plugin.settings.dayTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName("Day Start Time")
			.addMomentFormat((format: MomentFormatComponent) => {
				format
					.setDefaultFormat("HH:mm")
					.setPlaceholder("HH:mm")
					.setValue(this.plugin.settings.dayTime)
					.onChange((value) => {
						this.plugin.settings.dayTime = value;
						this.plugin.saveData(this.plugin.settings);
					});
			});
	}
}

interface DayAndNightSettings {
	pluginEnabled: boolean;
	currentTheme: string;
	dayTheme: string;
	dayTime: string;
	nightTheme: string;
	nightTime: string;
}
