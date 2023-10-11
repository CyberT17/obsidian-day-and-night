import { App, MomentFormatComponent, PluginSettingTab, Setting } from 'obsidian';
import DayAndNight from './main';

export class DayAndNightSettingTab extends PluginSettingTab {
	DARK_COLOR_SCHEME_KEY = 'obsidian';
	LIGHT_COLOR_SCHEME_KEY = 'moonstone';

	plugin: DayAndNight;

	constructor(app: App, plugin: DayAndNight) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', {
			text: 'Settings for Day and Night plugin.'
		});

		this.addPluginToggleSetting();
		if (this.plugin.settings.pluginEnabled) {
			this.addDaySettings();
			this.addNightSettings();
		}
	}

	private addPluginToggleSetting(): void {
		new Setting(this.containerEl).setName('Enable Day and Night').addToggle((value) => {
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
			.setName('Night Color Scheme')
			.setDesc('Select a Night Color Scheme')
			.addDropdown((dropdown) =>
				dropdown
					.addOption(this.LIGHT_COLOR_SCHEME_KEY, 'Light')
					.addOption(this.DARK_COLOR_SCHEME_KEY, 'Dark')
					.setValue(this.plugin.settings.nightColorScheme)
					.onChange((value) => {
						this.plugin.settings.nightColorScheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName('Night Theme')
			.setDesc('Select a Night Theme')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(this.getAllCommunityThemes())
					.setValue(this.plugin.settings.nightTheme)
					.onChange((value) => {
						this.plugin.settings.nightTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);

		new Setting(this.containerEl)
			.setName('Night Start Time')
			.setDesc('24-hour format')
			.addMomentFormat((format: MomentFormatComponent) => {
				format
					.setDefaultFormat('HH:mm')
					.setPlaceholder('HH:mm')
					.setValue(this.plugin.settings.nightTime)
					.onChange((value) => {
						this.plugin.settings.nightTime = value;
						this.plugin.saveData(this.plugin.settings);
					});
			});
	}

	private addDaySettings(): void {
		new Setting(this.containerEl)
			.setName('Day Color Scheme')
			.setDesc('Select a Day Color Scheme')
			.addDropdown((dropdown) =>
				dropdown
					.addOption(this.LIGHT_COLOR_SCHEME_KEY, 'Light')
					.addOption(this.DARK_COLOR_SCHEME_KEY, 'Dark')
					.setValue(this.plugin.settings.dayColorScheme)
					.onChange((value) => {
						this.plugin.settings.dayColorScheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName('Day Theme')
			.setDesc('Select a Day Theme')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(this.getAllCommunityThemes())
					.setValue(this.plugin.settings.dayTheme)
					.onChange((value) => {
						this.plugin.settings.dayTheme = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		new Setting(this.containerEl)
			.setName('Day Start Time')
			.setDesc('24-hour format')
			.addMomentFormat((format: MomentFormatComponent) => {
				format
					.setDefaultFormat('HH:mm')
					.setPlaceholder('HH:mm')
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

		const communityThemesRecord: Record<string, string> = { '': '' };
		for (const theme of themes) {
			communityThemesRecord[theme] = theme;
		}
		return communityThemesRecord;
	}
}
