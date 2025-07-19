package com.knotbot.practiceapp;

import org.firstinspires.ftc.robotcore.internal.system.AppUtil;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import android.util.Log;

public class DataStorage {
	private static final String TAG = "PracticeApp";
	// TODO: Make protected
	public static void writeString(String name, String data) {
		Log.d(TAG, "Started writing file");
		final File path = new File(AppUtil.ROOT_FOLDER, "Practice/data");

		File file = new File(path, name + ".json");
		try {
			if (!path.exists()) {
				path.mkdirs();
			}
			file.createNewFile();
			FileOutputStream stream = new FileOutputStream(file);
			try {
				stream.write(data.getBytes());
				stream.close();
				Log.i(TAG, "Successfully wrote to file \"" + file.getAbsolutePath() + "\"");
				if (PracticeApp.instance != null) {
					PracticeApp.instance.attachDataWebHandler(file);
				}
			} catch (IOException err) {
				Log.e(TAG, "Error writing to file \"" + file.getAbsolutePath() + "\"", err);
			} 
		} catch (IOException err) {
			Log.e(TAG, "Error writing to file", err);
		}
	}


}
