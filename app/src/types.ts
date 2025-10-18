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
			matchPeriod: "AUTO" | "TRANSITION" | "TELEOP" | "NONE";
			periodTime: number;
			score: number;
			cycles: Cycle[];
			cycleTime: number;
	  };

export type Data = {
	data: {
		name: string;
		timestamp: number;
		score: number;
		filename: string;
	}[];
};

export type RunData = {
	name: string;
	timestamp: number;
	score: number;
	info: {
		[key: string]: number;
	};
	cycles: Cycle[];
	teleopTimes: number[];
};

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
	stylePath: string;
	html: {
		timer: string;
		stats: string;
		settings: string;
		about: string;
	};
};

export type Settings = {
	layout: string;
	timerValues: {
		[key: string]: number;
	};
};
