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
	private static boolean autoEnd = true;
	protected static ElapsedTime runTimer = new ElapsedTime();
	protected static ElapsedTime periodTimer = new ElapsedTime();
	protected static double periodTimerOffset = 0;
	protected static ElapsedTime cycleTimer = new ElapsedTime();
	public static int score = 0;
	public static Data.RunData runData;
	protected static Data.RunState.MatchPeriod startingMatchPeriod = Data.RunState.MatchPeriod.NONE;
	protected static Data.RunState.MatchPeriod matchPeriod = Data.RunState.MatchPeriod.NONE;

	protected static void registerWsHandler(PracticeApp.WsHandler wsHandler) {
		RobotEvent.wsHandler = wsHandler;
	}

	protected static void unregisterWsHandler() {
		RobotEvent.wsHandler = null;
	}

	public static void start() { 
		startAuto();
	}

	public static void startAuto() {
		running = true;
		startingMatchPeriod = Data.RunState.MatchPeriod.AUTO;
		matchPeriod = Data.RunState.MatchPeriod.AUTO;
		runTimer.reset();
		periodTimer.reset();
		periodTimerOffset = 0;
		cycleTimer.reset();
		score = 0;
		runData = new Data.RunData(null, null, 0, new HashMap<>(), new ArrayList<>());
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startAuto", System.currentTimeMillis()));
		}
	}
	
	public static void startTransition() {
		running = true;
		startingMatchPeriod = Data.RunState.MatchPeriod.TRANSITION;
		matchPeriod = Data.RunState.MatchPeriod.TRANSITION;
		runTimer.reset();
		periodTimer.reset();
		periodTimerOffset = 0;
		cycleTimer.reset();
		score = 0;
		runData = new Data.RunData(null, null, 0, new HashMap<>(), new ArrayList<>());
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startTransition", System.currentTimeMillis()));
		}
	}

	public static void startTeleop() {
		boolean previouslyRunning = running;
		running = true;
		matchPeriod = Data.RunState.MatchPeriod.TELEOP;
		periodTimer.reset();
		periodTimerOffset = 0;
		if (!previouslyRunning) {
			startingMatchPeriod = Data.RunState.MatchPeriod.TELEOP;
			runTimer.reset();
			cycleTimer.reset();
			score = 0;
			runData = new Data.RunData(null, null, 0, new HashMap<>(), new ArrayList<>());
		}
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startTeleop", System.currentTimeMillis()));
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
		int timeMs = (int) cycleTimer.milliseconds();
		cycleTimer.reset();
		RobotEvent.score += score;
		if (runData != null) {
			runData.score = RobotEvent.score;

			int count = runData.info.getOrDefault(type, 0);
			count++;
			runData.info.put(type, count);

			Data.Cycle cycle = new Data.Cycle(timeMs/1000f, type, score);
			runData.cycles.add(cycle);
		}
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("setScore", RobotEvent.score));
			wsHandler.sendMessage(new PracticeApp.Message("resetCycle", type, timeMs));
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

	public static void setAutoEnd(boolean autoEnd) {
		RobotEvent.autoEnd = autoEnd;
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
		if (running && autoEnd) {
			runEnd();
			running = false;
		}
	}
}