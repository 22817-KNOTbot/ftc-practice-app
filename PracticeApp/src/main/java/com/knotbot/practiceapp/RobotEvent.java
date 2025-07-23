package com.knotbot.practiceapp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.eventloop.opmode.OpModeManagerImpl;

public class RobotEvent implements OpModeManagerImpl.Notifications {
	protected static RobotEvent instance;
	private static PracticeApp.WsHandler wsHandler;
	protected static OpModeManagerImpl opModeManager;
	public static boolean running = false;
	public static ElapsedTime runTimer = new ElapsedTime();
	public static ElapsedTime cycleTimer = new ElapsedTime();
	public static int score = 0;
	public static Data.RunData runData;

	protected static void registerWsHandler(PracticeApp.WsHandler wsHandler) {
		RobotEvent.wsHandler = wsHandler;
	}

	protected static void unregisterWsHandler() {
		RobotEvent.wsHandler = null;
	}

	public static void start() {
		running = true;
		runTimer.reset();
		cycleTimer.reset();
		score = 0;
		runData = new Data.RunData(null, null, 0, new HashMap<>(), new ArrayList<>());
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("start"));
		}
	}

	public static void abort() {
		running = false;
		runData = null;
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("abort"));
		}
	}

	public static void setScore(int score) {
		RobotEvent.score = score;
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("setScore", score));
		}
	}

	public static int addScore(int score) {
		return addScore(score, "Score");
	}

	public static int addScore(int score, String type) {
		RobotEvent.score += score;
		if (runData != null) {
			runData.score = RobotEvent.score;

			int count = runData.info.getOrDefault(type, 0);
			count++;
			runData.info.put(type, count);

			float time = (float) runTimer.time();
			Data.Cycle cycle = new Data.Cycle(time, type, score);
			runData.cycles.add(cycle);
		}
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("setScore", type, RobotEvent.score));
			wsHandler.sendMessage(new PracticeApp.Message("resetCycle"));
		}
		return RobotEvent.score;
	}

	public static void playSound(String sound) {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("playSound", sound));
		}
	}

	public static void error(String error) {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("error", error));
		}
	}

	public static void runEnd() {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("end"));
		}
		DataStorage.tempSaveRun(runData, "unsaved");
	}

	@Override
	public void onOpModePreInit(OpMode opMode) {}
	
	@Override
	public void onOpModePreStart(OpMode opMode) {}

	@Override
	public void onOpModePostStop(OpMode opMode) {
		if (running) {
			runEnd();
		}
		running = false;
	}
}