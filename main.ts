import moment from 'moment';
import { Plugin, setIcon } from 'obsidian';
import { DayAndNightSettings } from './DayAndNightSettings';
import { DayAndNightSettingTab } from './DayAndNightSettingTab';
import { DefaultSettings } from 'DefaultSettings';

export default class DayAndNight extends Plugin {
	settings: DayAndNightSettings;

	async onload() {
		await this.loadSettings();

		this.settings.pauseThemeToggle = false;
		this.saveSettings();

		await this.updateTheme();
		await this.addRibbonIconToToolbar();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DayAndNightSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
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
		const { themeToApply, colorSchemeToApply } = this.getThemeToApply();

		if (!this.settings.pauseThemeToggle && (this.getCurrentTheme() != themeToApply || this.getCurrentColorScheme() != colorSchemeToApply)) {
			this.setTheme(themeToApply, colorSchemeToApply);
		} else if (this.getCurrentTheme() == themeToApply || this.getCurrentColorScheme() == colorSchemeToApply) {
			this.settings.pauseThemeToggle = false;
			this.saveSettings();
		}
	}

	private setTheme(currentTheme: string, currentColorScheme: string) {
		this.setCurrentColorScheme(currentColorScheme);
		this.setCurrentTheme(currentTheme);

		this.app.workspace.trigger('css-change');

		this.saveSettings();
	}

	private getThemeToApply(): { themeToApply: string; colorSchemeToApply: string } {
		const dayDate: Date = moment(this.settings.dayTime, moment.HTML5_FMT.TIME).toDate();
		const nightDate: Date = moment(this.settings.nightTime, moment.HTML5_FMT.TIME).toDate();

		let themeToApply = this.getCurrentTheme();
		let colorSchemeToApply = this.getCurrentColorScheme();

		if (moment().isAfter(dayDate) && moment().isBefore(nightDate)) {
			themeToApply = this.settings.dayTheme;
			colorSchemeToApply = this.settings.dayColorScheme;
		} else if (moment().isSameOrAfter(nightDate) || moment().isBefore(dayDate)) {
			themeToApply = this.settings.nightTheme;
			colorSchemeToApply = this.settings.nightColorScheme;
		}
		return { themeToApply, colorSchemeToApply };
	}

	async loadSettings() {
		this.settings = Object.assign({}, DefaultSettings, await this.loadData());
	}

	async addRibbonIconToToolbar() {
		const ribbonIcon = this.addRibbonIcon(this.getRibbonIconName(), 'Toggle Theme', () => {
			this.toggleTheme();
			this.settings.pauseThemeToggle = true;
			this.saveSettings();

			// This lets us change the icon of the ribbon button on the fly based on what theme is active
			setIcon(ribbonIcon, this.getRibbonIconName());
		});
	}

	private getRibbonIconName() {
		return this.isCurrentThemeNightTheme() ? 'sun' : 'moon';
	}

	private toggleTheme() {
		if (this.isCurrentThemeNightTheme()) {
			this.setTheme(this.settings.dayTheme, this.settings.dayColorScheme);
		} else {
			this.setTheme(this.settings.nightTheme, this.settings.nightColorScheme);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private getCurrentTheme(): string {
		// @ts-ignore
		return this.app.customCss.theme;
	}

	private setCurrentTheme(currentTheme: string) {
		//@ts-ignore
		this.app.customCss.setTheme(currentTheme);
		this.settings.currentTheme = currentTheme;
	}

	private getCurrentColorScheme(): string {
		// @ts-ignore
		return this.app.vault.getConfig('theme');
	}

	private setCurrentColorScheme(currentColorScheme: string) {
		// @ts-ignore
		this.app.setTheme(currentColorScheme);
		this.settings.currentColorScheme = currentColorScheme;
		// @ts-ignore
		this.app.vault.setConfig('theme', currentColorScheme);
	}

	private isCurrentThemeNightTheme(): boolean {
		const currentTheme = this.getCurrentTheme();
		const currentColorScheme = this.getCurrentColorScheme();

		return currentTheme == this.settings.nightTheme && currentColorScheme == this.settings.nightColorScheme;
	}
}
