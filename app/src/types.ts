export type Message = {
	event: string;
	name?: string;
	value?: number;
};

export type RunState =
	| {
			running: false;
	  }
	| {
			running: true;
			matchPeriod: MatchPeriod;
			periodTime: number;
			score: number;
			cycles: Cycle[];
			cycleTime: number;
	  };

export enum MatchPeriod {
	AUTO = "AUTO",
	TRANSITION = "TRANSITION",
	TELEOP = "TELEOP",
	NONE = "NONE",
}

export type Data = {
	data: {
		name: string;
		timestamp: number;
		score: number;
		filename: string;
	}[];
};

export interface RunData {
	name: string;
	timestamp: number;
	score: number;
	info: {
		[key: string]: number;
	};
	cycles: Cycle[];
	teleopTimes: (number | null)[];
	startingMatchPeriod: MatchPeriod;
}

export interface SaveRunData extends RunData {
	periodTimes: (number | null)[];
}

export type Cycle = {
	time: number;
	type: string;
	score: number;
};

export type Layout = {
	name: string;
	imagePath: string;
	layoutDataGetter: () => LayoutData;
};

export type LayoutData = {
	stylePath: string | string[];
	html: {
		timer: string;
		stats: string;
		settings: string;
		about: string;
		edit: string;
	};
};

export type Settings = {
	layout: string;
	timerValues: {
		[key: string]: number;
	};
	mode: "view" | "edit";
};
