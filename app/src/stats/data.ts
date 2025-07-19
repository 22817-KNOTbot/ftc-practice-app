import { Data, RunData } from "../types";

export async function getData(): Promise<Data> {
	// GET request?
	return {
		data: [
			{
				name: "Run #1",
				time: 1,
				score: 500,
				filename: "placeholder",
			},
			{
				name: "Run #2",
				time: 2,
				score: 100,
				filename: "placeholder",
			},
			{
				name: "Run #3",
				time: 20,
				score: 106,
				filename: "placeholder",
			},
			{
				name: "Run #4",
				time: 50,
				score: 130,
				filename: "placeholder",
			},
			{
				name: "Run #6",
				time: 1748228182,
				score: 200,
				filename: "placeholder",
			},
		],
	};
}

export function getRunData(run: string): RunData {
	if (run != run) {
		console.log("");
	}
	// GET request?
	// Stored in .json, folder with many .json of cycle times. Individual .json named same as key in main .json
	const runData: RunData = {
		name: `Run #${run}`,
		timestamp: Math.floor(Math.random() * 1848228182),
		info: {
			// Keys are dynamically generated based on name given by user
			// Count created by counting from cycles
			Sample: 20,
			Specimen: 10,
		},
		cycles: [
			{
				time: 1,
				type: "Sample",
			},
			{
				time: 2,
				type: "Specimen",
			},
			{
				time: 10,
				type: "Specimen",
			},
			{
				time: 15,
				type: "Specimen",
			},
			{
				time: 20,
				type: "Specimen",
			},
			{
				time: 27,
				type: "Specimen",
			},
			{
				time: 29,
				type: "Specimen",
			},
			{
				time: 33,
				type: "Sample",
			},
			{
				time: 33,
				type: "Specimen",
			},
			{
				time: 50,
				type: "Sample",
			},
		],
	};

	return runData;
}
