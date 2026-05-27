import { Settings } from "./types";

const DEFAULT_SETTINGS: Settings = {
	layout: "Modern",
	timerValues: {
		auto: 30,
		transition: 8,
		teleop: 120,
		endgame: 20,
	},
	mode: "view",
	manualScoringPresets: [],
};
const SETTINGS_STORAGE_KEY = "settings";

export function getSetting<settingKey extends keyof Settings>(
	setting: settingKey,
): Settings[settingKey] {
	const currentSettings = localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}";
	let parsedCurrentSettings: Settings | null = null;
	if (currentSettings) {
		try {
			parsedCurrentSettings = JSON.parse(currentSettings);
		} catch {
			console.error("Invalid stored settings! Resetting settings");
			localStorage.clear();
		}
	}

	return (
		(parsedCurrentSettings ?? DEFAULT_SETTINGS)[setting] ??
		DEFAULT_SETTINGS[setting]
	);
}

export function saveSettings(settings: Settings) {
	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function updateSetting<settingKey extends keyof Settings>(
	setting: settingKey,
	value: Settings[settingKey],
) {
	const currentSettings = localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}";
	let parsedSettings: Settings | null = null;
	if (currentSettings) {
		try {
			parsedSettings = JSON.parse(currentSettings);
		} catch {
			console.error("Invalid stored settings! Resetting settings");
			localStorage.clear();
		}
	}

	parsedSettings ??= DEFAULT_SETTINGS;
	parsedSettings[setting] = value;

	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsedSettings));
}
