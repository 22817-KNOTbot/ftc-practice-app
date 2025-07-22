import { Data, RunData } from "../types";

export async function getData(): Promise<Data> {
	const response = await fetch(`/practice/data/main.json`, {
		headers: {
			Accept: "application/json",
		},
		mode: "no-cors",
	});
	return new Promise<Data>((resolve, reject) => {
		if (!response.ok) {
			reject();
		} else {
			response.json().then((data) => {
				let receivedData: Data;
				try {
					receivedData = data as Data;
				} catch {
					reject("Malformed data");
					return;
				}
				resolve(receivedData);
			});
		}
	});
}

export async function getRunData(run: string): Promise<RunData> {
	const response = await fetch(`/practice/data/${run}`, {
		headers: {
			Accept: "application/json",
		},
		mode: "no-cors",
	});
	return new Promise<RunData>((resolve, reject) => {
		if (!response.ok) {
			reject();
		} else {
			response.json().then((data) => {
				let receivedData: RunData;
				try {
					receivedData = data as RunData;
				} catch {
					reject("Malformed data");
					return;
				}
				resolve(receivedData);
			});
		}
	});
}
