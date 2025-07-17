export type Message = {
	event: string;
	name?: string;
	value?: number;
};

export type Data = {
	[key: string]: {
		time: number;
		score: number;
	};
};

export type RunData = {
	name: string;
	timestamp: number;
	info: {
		[key: string]: number;
	};
	cycles: {
		time: number;
		type: string;
	}[];
};
