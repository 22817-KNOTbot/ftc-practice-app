package com.knotbot.practiceapp;

import com.squareup.moshi.Moshi;
import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.JsonDataException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import android.util.Log;

public class Data {
	private static final String TAG = "PracticeApp";

	protected static class MainData {
		public List<RunOverview> data;

		public static class RunOverview {
			public String name;
			public long timestamp;
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

		protected static MainData toData(String json) {
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

		protected static String toJson(MainData mainData) {
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<MainData> jsonAdapter = moshi.adapter(MainData.class);

			String json = jsonAdapter.toJson(mainData);
			// Log.v(TAG, json);
			return json;
		}
	}

	protected static class RunData {
		public String name;
		public Long timestamp;
		public int score;
		public Map<String, Integer> info;
		public List<Cycle> cycles;
		public Integer[] teleopTimes;

		public RunData() {
			this(null, null, 0, new HashMap<>(), new ArrayList<>(), new Integer[] {null, null});
		}

		public RunData(String name, Long timestamp, int score, Map<String, Integer> info, List<Cycle> cycles, Integer[] teleopTimes) {
			this.name = name;
			this.timestamp = timestamp;
			this.score = score;
			this.info = info;
			this.cycles = cycles;
			this.teleopTimes = teleopTimes;
		}

		@Override
		public String toString() {
			return "RunData [name=" + name + ", timestamp=" + timestamp + ", score=" + score + ", info=" + info
					+ ", cycles=" + cycles + ", teleopTimes=" + Arrays.toString(teleopTimes) + "]";
		}

		protected static RunData toData(String json) {
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

		protected static String toJson(RunData runData) {
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<RunData> jsonAdapter = moshi.adapter(RunData.class);

			String json = jsonAdapter.toJson(runData);
			// Log.v(TAG, json);
			return json;
		}
	}

	protected static class Cycle {
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

	protected static class PeriodTime {
		protected Long expectedStartTime;
		protected Long realStartTime;
		protected Long expectedEndTime;
		protected Long realEndTime;

		public Integer getStartDifference() {
			if (expectedStartTime != null && realStartTime != null) {
				return (int) (realStartTime - expectedStartTime);
			} else {
				return null;
			}
		}

		public Integer getEndDifference() {
			if (expectedEndTime != null && realEndTime != null) {
				return (int) (realEndTime - expectedEndTime);
			} else {
				return null;
			}
		}

		protected static String toJson(PeriodTime runState) {
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<PeriodTime> jsonAdapter = moshi.adapter(PeriodTime.class);

			String json = jsonAdapter.toJson(runState);
			// Log.v(TAG, json);
			return json;
		}

	}

	protected static class RunState {
		public boolean running;
		public MatchPeriod matchPeriod;
		public Float periodTime;
		public Integer score;
		public List<Cycle> cycles;
		public float cycleTime;

		public static enum MatchPeriod {
			AUTO,
			TRANSITION,
			TELEOP,
			NONE,
		}

		public RunState(boolean running) {
			this.running = false;
		}

		public RunState(boolean running, MatchPeriod matchPeriod, Float periodTime, Integer score, List<Cycle> cycles, Float cycleTime) {
			this.running = running;
			this.matchPeriod = matchPeriod;
			this.periodTime = periodTime;
			this.score = score;
			this.cycles = cycles;
			this.cycleTime = cycleTime;
		}

		protected static RunState toData(String json) {
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<RunState> jsonAdapter = moshi.adapter(RunState.class);

			try {
				RunState runState = jsonAdapter.fromJson(json);
				// Log.v(TAG, runState.toString());
				return runState;
			} catch (IOException | JsonDataException err) {
				Log.e(TAG, "Error deserializing JSON", err);
			}
			return null;
		}

		protected static String toJson(RunState runState) {
			Moshi moshi = new Moshi.Builder().build();
			JsonAdapter<RunState> jsonAdapter = moshi.adapter(RunState.class);

			String json = jsonAdapter.toJson(runState);
			// Log.v(TAG, json);
			return json;
		}
	}
}