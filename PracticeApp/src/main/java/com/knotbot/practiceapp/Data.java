package com.knotbot.practiceapp;

import com.squareup.moshi.Moshi;
import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.JsonDataException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import android.util.Log;

public class Data {
	private static final String TAG = "PracticeApp";

	public static class MainData {
		public List<RunOverview> data;

		public static class RunOverview {
			public String name;
			public int timestamp;
			public int score;
			public String filename;

			@Override
			public String toString() {
				return "RunOverview [name=" + name + ", timestamp=" + timestamp + ", score=" + score + ", filename=" + filename
						+ "]";
			}
		}

		@Override
		public String toString() {
			return "MainData [data=" + data + "]";
		}
	}

	public static MainData jsonToMainData(String json) {
		Moshi moshi = new Moshi.Builder().build();
		JsonAdapter<MainData> jsonAdapter = moshi.adapter(MainData.class);

		if (!json.startsWith("{")) {
			Log.i(TAG, "Initialized MainData");
			MainData data = new MainData();
			data.data = new ArrayList<MainData.RunOverview>();
			return data;
		}

		try {
			MainData mainData = jsonAdapter.fromJson(json);
			// Log.v(TAG, mainData.toString());
			return mainData;
		} catch (IOException | JsonDataException err) {
			Log.e(TAG, "Error deserializing JSON", err);
		}
		return null;
	}

	public static String mainDataToJson(MainData mainData) {
		Moshi moshi = new Moshi.Builder().build();
		JsonAdapter<MainData> jsonAdapter = moshi.adapter(MainData.class);

		String json = jsonAdapter.toJson(mainData);
		// Log.v(TAG, json);
		return json;
	}

	public static class RunData {
		public String name;
		public Integer timestamp;
		public int score;
		public Map<String, Integer> info;
		public List<Cycle> cycles;

		public static class Cycle {
			public float time;
			public String type;
			public int score;

			public Cycle(float time, String type, int score) {
				this.time = time;
				this.type = type;
				this.score = score;
			}

			@Override
			public String toString() {
				return "Cycle [time=" + time + ", type=" + type + ", score=" + score + "]";
			}
		}

		public RunData(String name, Integer timestamp, int score, Map<String, Integer> info, List<Cycle> cycles) {
			this.name = name;
			this.timestamp = timestamp;
			this.score = score;
			this.info = info;
			this.cycles = cycles;
		}

		@Override
		public String toString() {
			return "RunData [name=" + name + ", timestamp=" + timestamp + ", score=" + score + ", info=" + info
					+ ", cycles=" + cycles + "]";
		}
	}

	public static RunData jsonToRunData(String json) {
		Moshi moshi = new Moshi.Builder().build();
		JsonAdapter<RunData> jsonAdapter = moshi.adapter(RunData.class);

		try {
			RunData runData = jsonAdapter.fromJson(json);
			// Log.v(TAG, runData.toString());
			return runData;
		} catch (IOException | JsonDataException err) {
			Log.e(TAG, "Error deserializing JSON", err);
		}
		return null;
	}

	public static String runDataToJson(RunData runData) {
		Moshi moshi = new Moshi.Builder().build();
		JsonAdapter<RunData> jsonAdapter = moshi.adapter(RunData.class);

		String json = jsonAdapter.toJson(runData);
		// Log.v(TAG, json);
		return json;
	}
}