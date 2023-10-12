export interface DayAndNightSettings {
	// General Settings
	pluginEnabled: boolean;
	currentTheme: string;
	currentColorScheme: string;

	// Day Settings
	dayColorScheme: string;
	dayTime: string;
	dayTheme: string;

	// Night Settings
	nightColorScheme: string;
	nightTime: string;
	nightTheme: string;

	// Ribbon Icon
	pauseThemeToggle: boolean;
}
