package com.knotbot.practiceapp;

import java.util.ArrayList;
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
	protected static Data.PeriodTime teleopTime = new Data.PeriodTime();

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
		runData = new Data.RunData();
		teleopTime = new Data.PeriodTime();
		teleopTime.expectedStartTime = System.currentTimeMillis() + 38000;
		teleopTime.expectedEndTime = System.currentTimeMillis() + 158000;
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startAuto"));
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
		runData = new Data.RunData();
		teleopTime = new Data.PeriodTime();
		teleopTime.expectedStartTime = System.currentTimeMillis() + 8000;
		teleopTime.expectedEndTime = System.currentTimeMillis() + 128000;
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startTransition"));
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
			runData = new Data.RunData();
			teleopTime = new Data.PeriodTime();
			teleopTime.expectedEndTime = System.currentTimeMillis() + 120000;
		} else {
			teleopTime.realStartTime = System.currentTimeMillis();
			runData.teleopTimes[0] = teleopTime.getStartDifference();
		}

		if (wsHandler != null) {
			if (runData.teleopTimes[0] != null) {
				wsHandler.sendMessage(new PracticeApp.Message("startTeleop", runData.teleopTimes[0]));
			} else {
				wsHandler.sendMessage(new PracticeApp.Message("startTeleop"));
			}
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
		if (matchPeriod == Data.RunState.MatchPeriod.TELEOP) {
			teleopTime.realEndTime = System.currentTimeMillis();
			runData.teleopTimes[1] = teleopTime.getEndDifference();
		} else {
			runData.teleopTimes[1] = null;
		}

		if (wsHandler != null) {
			if (runData.teleopTimes[1] != null) {
				wsHandler.sendMessage(new PracticeApp.Message("end", runData.teleopTimes[1]));
			} else {
				wsHandler.sendMessage(new PracticeApp.Message("end"));
			}
		}

		if (startingMatchPeriod == Data.RunState.MatchPeriod.TELEOP) {
			runData.teleopTimes[0] = null;
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