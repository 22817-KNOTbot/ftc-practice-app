export type Message = {
	event: string;
	name?: string;
	value?: number;
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
	cycles: {
		time: number;
		type: string;
		score: number;
	}[];
};
