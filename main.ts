import moment from "moment";
import { Plugin } from "obsidian";
import { DayAndNightSettings } from "./DayAndNightSettings";
import { DayAndNightSettingTab } from "./DayAndNightSettingTab";
import { DefaultSettings } from "DefaultSettings";

export default class DayAndNight extends Plugin {
	settings: DayAndNightSettings;

	async onload() {
		await this.loadSettings();
		await this.updateTheme();
		await this.addRibbonIconToToolbar();

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

		if (
			// @ts-ignore
			this.app.customCss.theme != currentTheme ||
			// @ts-ignore
			this.app.vault.getConfig("theme") != currentColorScheme
		) {
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
		const dayDate: Date = moment(
			this.settings.dayTime,
			moment.HTML5_FMT.TIME
		).toDate();

		const nightDate: Date = moment(
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
			DefaultSettings,
			await this.loadData()
		);
	}

	async addRibbonIconToToolbar() {
		this.addRibbonIcon(this.getRibbonIconName(), "Add Ribbon Icon", () => {
			console.log("Added Ribbon Icon");
		});
	}

	private getRibbonIconName() {
		return "sun";
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
