import { Data, RunData } from "../types";

export async function getData(): Promise<Data> {
	const request = fetch(`/practice/data/main.json`, {
		headers: {
			Accept: "application/json",
		},
	});

	return new Promise<Data>((resolve, reject) => {
		request
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`${response.status} ${response.statusText}`
					);
				}
				response.json().then((data) => {
					resolve(data);
				});
			})
			.catch((error: Error) => {
				reject(error.message);
			});
	});
}

export async function getRunData(run: string): Promise<RunData> {
	const request = fetch(`/practice/data/${run}`, {
		headers: {
			Accept: "application/json",
		},
	});

	return new Promise<RunData>((resolve, reject) => {
		request
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`${response.status} ${response.statusText}`
					);
				}
				response.json().then((data) => {
					resolve(data);
				});
			})
			.catch((error: Error) => {
				reject(error.message);
			});
	});
}
