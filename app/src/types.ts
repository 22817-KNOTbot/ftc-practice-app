export type Message = {
	event: string;
	name?: string;
	value?: number;
};

export type Data = {
	data: {
		name: string;
		time: number;
		score: number;
		filename: string;
	}[];
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
