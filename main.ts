import moment from "moment";
import {
	App,
	MomentFormatComponent,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { DayAndNightSettings } from "./DayAndNightSettings";

const DEFAULT_SETTINGS: DayAndNightSettings = {
	pluginEnabled: false,
	currentTheme: "",
	currentColorScheme: "moonstone",

	dayColorScheme: "moonstone",
	dayTime: "10:00",
	dayCommunityTheme: "",

	nightColorScheme: "obsidian",
	nightTime: "15:00",
	nightCommunityTheme: "",
};

export default class DayAndNight extends Plugin {
	settings: DayAndNightSettings;

	async onload() {
		await this.loadSettings();
		await this.updateTheme();

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
			}, 10000)
		);
	}

	onunload() {}

	async updateTheme() {
		if (!this.settings.pluginEnabled) {
			return;
		}
		const { currentTheme, currentColorScheme } = this.getThemeToApply();
		// @ts-ignore
		if (this.app.vault.getConfig("theme") != currentTheme) {
			this.setTheme(currentTheme, currentColorScheme);
		}
	}

	private setTheme(currentTheme: string, currentColorScheme: string) {
		// Set Color Scheme
		// @ts-ignore
		this.app.setTheme(currentColorScheme);
		this.settings.currentColorScheme = currentColorScheme;
		// @ts-ignore
		this.app.vault.setConfig("theme", currentColorScheme);

		// Set Theme
		//@ts-ignore
		this.app.customCss.setTheme(currentTheme);

		this.app.workspace.trigger("css-change");
	}

	private getThemeToApply(): {
		currentTheme: string;
		currentColorScheme: string;
	} {
		let dayDate: Date = moment(
			this.settings.dayTime,
			moment.HTML5_FMT.TIME
		).toDate();

		let nightDate: Date = moment(
			this.settings.nightTime,
			moment.HTML5_FMT.TIME
		).toDate();
		// @ts-ignore
		let currentTheme = this.app.vault.getConfig("theme");
		// @ts-ignore
		let currentColorScheme = this.app.customCss.theme;

		if (moment().isAfter(dayDate) && moment().isBefore(nightDate)) {
			currentTheme = this.settings.dayCommunityTheme;
			currentColorScheme = this.settings.dayColorScheme;
		} else if (
			moment().isSameOrAfter(nightDate) ||
			moment().isBefore(dayDate)
		) {
			currentTheme = this.settings.nightCommunityTheme;
			currentColorScheme = this.settings.nightColorScheme;
		}
		return { currentTheme, currentColorScheme };
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
	DARK_COLOR_SCHEME_KEY = "obsidian";
	LIGHT_COLOR_SCHEME_KEY = "moonstone";

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
			.setName("Night Color Scheme")
			.setDesc("Select a Night Color Scheme")
			.addDropdown((dropdown) =>
				dropdown
					.addOption(this.LIGHT_COLOR_SCHEME_KEY, "Light")
					.addOption(this.DARK_COLOR_SCHEME_KEY, "Dark")
					.setValue(this.plugin.settings.nightColorScheme)
					.onChange((value) => {
						this.plugin.settings.nightColorScheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName("Night Theme")
			.setDesc("Select a Night Theme")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(this.getAllCommunityThemes())
					.setValue(this.plugin.settings.nightCommunityTheme)
					.onChange((value) => {
						this.plugin.settings.nightCommunityTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);

		new Setting(this.containerEl)
			.setName("Night Start Time")
			.setDesc("24-hour format")
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
			.setName("Day Color Scheme")
			.setDesc("Select a Day Color Scheme")
			.addDropdown((dropdown) =>
				dropdown
					.addOption(this.LIGHT_COLOR_SCHEME_KEY, "Light")
					.addOption(this.DARK_COLOR_SCHEME_KEY, "Dark")
					.setValue(this.plugin.settings.dayColorScheme)
					.onChange((value) => {
						this.plugin.settings.dayColorScheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName("Day Theme")
			.setDesc("Select a Day Theme")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(this.getAllCommunityThemes())
					.setValue(this.plugin.settings.dayCommunityTheme)
					.onChange((value) => {
						this.plugin.settings.dayCommunityTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName("Day Start Time")
			.setDesc("24-hour format")
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

	private getAllCommunityThemes(): Record<string, string> {
		// @ts-ignore
		const themes = Object.keys(this.app.customCss.themes);

		const communityThemesRecord: Record<string, string> = { "": "" };
		for (const theme of themes) {
			communityThemesRecord[theme] = theme;
		}
		return communityThemesRecord;
	}
}
