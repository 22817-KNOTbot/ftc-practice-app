package com.knotbot.practiceapp;

import org.firstinspires.ftc.robotcore.internal.system.AppUtil;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

import android.util.Log;

public class DataStorage {
	private static final String TAG = "PracticeApp";

	protected static File writeString(String name, String data) {
		Log.d(TAG, "Started writing file");
		final File path = new File(AppUtil.ROOT_FOLDER, "Practice/data");

		File file = new File(path, name + ".json");
		try {
			if (!path.exists()) {
				path.mkdirs();
			}
			file.createNewFile();
			try (FileOutputStream stream = new FileOutputStream(file)) {
				stream.write(data.getBytes());
				stream.close();
				Log.i(TAG, "Successfully wrote to file \"" + file.getAbsolutePath() + "\"");
				if (PracticeApp.instance != null) {
					PracticeApp.instance.attachDataWebHandler(file);
				}
			} catch (IOException err) {
				Log.e(TAG, "Error writing to file \"" + file.getAbsolutePath() + "\"", err);
			} 
		} catch (Exception err) {
			Log.e(TAG, "Error writing to file", err);
		}
		return file;
	}

	protected static String readString(File file) {
		if (!file.exists() || !file.canRead()) return null;
		String text = "";
		try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
			String line = reader.readLine();
			while (line != null) {
				text += line;
				line = reader.readLine();
			}
		} catch (IOException err) {
			Log.e(TAG, "Error reading file \"" + file.getAbsolutePath() + "\"", err);
		}
		return text;
	}

	protected static void saveRun(Data.RunData runData) {
		if (runData.timestamp == null) {
			saveRun(runData, "null");
		} else {
			saveRun(runData, Integer.toString(runData.timestamp));
		}
	}

	protected static void saveRun(Data.RunData runData, String name) {
		String json = Data.runDataToJson(runData);
		File file = writeString(name, json);

		String fileName = file.getName();

		addRunToMain(runData, fileName);
	}

	protected static void tempSaveRun(Data.RunData runData, String name) {
		String json = Data.runDataToJson(runData);
		File file = writeString(name, json);
	}

	protected static void addRunToMain(Data.RunData runData, String fileName) {
		Log.v(TAG, "Started adding run to main");
		File path = new File(AppUtil.ROOT_FOLDER, "Practice/Data");
		File file = new File(path, "main.json");

		if (!path.exists() || !file.exists() || !file.isFile()) {
			try {
				Log.d(TAG, "main.json file does not exist, creating file");
				path.mkdirs();
				boolean newFile = file.createNewFile();
				Log.d(TAG, "Successfully created main.json with value " + newFile);
			} catch (IOException err) {
				Log.e(TAG, "Error writing to file \"" + file.getAbsolutePath() + "\"", err);
			}
		}

		final String existingText = readString(file);
		Data.MainData data = Data.jsonToMainData(existingText);

		Data.MainData.RunOverview newOverview = new Data.MainData.RunOverview();
		newOverview.name = runData.name;
		newOverview.timestamp = runData.timestamp;
		newOverview.score = runData.score;
		newOverview.filename = fileName;
		if (data.data == null) {
			data.data = new ArrayList<Data.MainData.RunOverview>();
		}
		data.data.add(newOverview);

		String newText = Data.mainDataToJson(data);

		writeString(file.getName().replaceFirst("[.][^.]+$", ""), newText);
	}
}
