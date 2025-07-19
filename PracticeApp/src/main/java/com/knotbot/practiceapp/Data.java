package com.knotbot.practiceapp;

import com.squareup.moshi.Moshi;
import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.JsonDataException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import android.util.Log;

public class Data {
	private static final String TAG = "PracticeApp";
	private static RunData runData;
	
	public static class RunData {
		public String name;
		public int timestamp;
		public Map<String, Integer> info;
		public List<Cycle> cycles;

		public static class Cycle {
			public int time;
			public String type;

			@Override
			public String toString() {
				return "Cycle [time=" + time + ", type=" + type + "]";
			}
		}

		@Override
		public String toString() {
			return "RunData [name=" + name + ", timestamp=" + timestamp + ", info=" + info + ", cycles=" + cycles + "]";
		}
	}

	public static void jsonToRunData(String json) {
		Moshi moshi = new Moshi.Builder().build();
		JsonAdapter<RunData> jsonAdapter = moshi.adapter(RunData.class);

		try {
			RunData runData = jsonAdapter.fromJson(json);
			Data.runData = runData;
			Log.i(TAG, runData.toString());
		} catch (IOException | JsonDataException err) {
			Log.e(TAG, "Error deserializing JSON", err);
		}
	}

	public static void runDataToJson(RunData runData) {
		if (Data.runData == null) return;
		runData = Data.runData;

		Moshi moshi = new Moshi.Builder().build();
		JsonAdapter<RunData> jsonAdapter = moshi.adapter(RunData.class);

		String json = jsonAdapter.toJson(runData);
		Log.i(TAG, json);
	}
}