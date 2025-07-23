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
			runTime: number;
			score: number;
			cycles: Cycle[];
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
};

export type Cycle = {
	time: number;
	type: string;
	score: number;
};
