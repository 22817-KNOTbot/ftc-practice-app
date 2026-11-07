package com.knotbot.practiceapp;

import java.util.List;

import com.qualcomm.robotcore.util.ElapsedTime;
import com.knotbot.practiceapp.Data.Cycle;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.eventloop.opmode.OpModeManagerImpl;

// This is the primary user-facing class. As such, it does not have a descriptive name in favour of
// a more reasonable name for users. Previously called RobotEvent.

/**
 * The {@link Practice} class manages all events to be triggered by the user.
 * <p>
 * Most users will likely only need the following methods:
 *
 * <li>{@link #startAuto()}</li>
 * <li>{@link #startTransition()}</li>
 * <li>{@link #startTeleop()}</li>
 * <li>{@link #addScore(int String)}</li>
 * <li>{@link #endRun()}</li>
 * <li>{@link #setAutoEnd(boolean)}</li>
 */
public class Practice implements OpModeManagerImpl.Notifications {
	protected static Practice instance;
	private static PracticeApp.WsHandler wsHandler;
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
	protected static Long[] periodTimes = { null, null, null };

	protected static void registerWsHandler(PracticeApp.WsHandler wsHandler) {
		Practice.wsHandler = wsHandler;
	}

	protected static void unregisterWsHandler() {
		Practice.wsHandler = null;
	}

	/**
	 * Alias for {@link #startAuto()}
	 * @see #startAuto() 
	 */
	public static void start() {
		startAuto();
	}

	/**
	 * Starts a new run from the Autonomous period. This should be used in an Autonomous OpMode.
	 * <p>
	 * Note that the run will automatically end when the OpMode ends. If you want to do a full run,
	 * make sure to disable auto end with {@link #setAutoEnd(boolean)}.
	 * @see #setAutoEnd(boolean) 
	 * @see #startTeleop() 
	 */
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
		periodTimes = new Long[] { null, null, null };
		periodTimes[0] = System.currentTimeMillis();
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startAuto"));
		}
	}

	/**
	 * Starts a new run from the transition period. Do not use this if the run has already started
	 * from Autonomous. This method will start a new run and clear previous data. This should be
	 * used in the init section of a TeleOp OpMode.
	 * <p>
	 * Use {@link #startTeleop()} on TeleOp start to have accurate early/late tracking. If this is
	 * not desired, use only {@link #startTeleop()} on start without using this method on init.
	 * @see #startTeleop() 
	 */
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
		periodTimes = new Long[] { null, null, null };
		periodTimes[0] = System.currentTimeMillis();
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("startTransition"));
		}
	}

	/**
	 * Starts a new run from the TeleOp period. This can be used after the Autonomous or transition
	 * periods, or be the first period. To use the early/late tracking feature, the run must start
	 * with a previous period.
	 * <p>
	 * If auto end was disabled (for example, to have the run continue from Auto), make sure to end
	 * the run with {@link #endRun()} or re-enable auto end with {@link #setAutoEnd(boolean)}.
	 * @see #endRun() 
	 */
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
			periodTimes = new Long[] { null, null, null };
		}
		periodTimes[1] = System.currentTimeMillis();

		if (wsHandler != null) {
			if (periodTimes[0] != null) {
				wsHandler.sendMessage(new PracticeApp.Message("startTeleop", startingMatchPeriod.toString(),
						periodTimes[1] - periodTimes[0]));
			} else {
				wsHandler.sendMessage(new PracticeApp.Message("startTeleop"));
			}
		}
	}

	/**
	 * Ends the run without saving. Should not be necessary for most users.
	 */
	public static void abort() {
		running = false;
		runData = null;
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("abort"));
		}
	}

	/**
	 * Adds points to the score. This will count as a cycle, which resets the cycle timer and shows
	 * up on the changes box of the main timer page.
	 * <p>
	 * The 2 parameter version ({@link #addScore(int, String)} should be preferred, as it allows the
	 * type of score to be specified
	 * @param score The number of points to be added to the score. Will be labelled as "Score"
	 * @return The score after adding the new points
	 * @see #addScore(int, String)
	 */
	public static int addScore(int score) {
		return addScore(score, "Score");
	}

	/**
	 * Adds points to the score. This will count as a cycle, which resets the cycle timer and shows
	 * up on the changes box of the main timer page.
	 * @param score The number of points to be added to the score.
	 * @param type The type of score. Serves as a label on the timer page and stored records.
	 * @return The score after adding the new points
	 */
	public static int addScore(int score, String type) {
		int timeMs = (int) cycleTimer.milliseconds();
		cycleTimer.reset();
		Practice.score += score;
		if (runData != null) {
			runData.score = Practice.score;

			int count = runData.info.getOrDefault(type, 0);

			count++;
			runData.info.put(type, count);

			Data.Cycle cycle = new Data.Cycle(timeMs / 1000f, type, score);
			runData.cycles.add(cycle);
			if (wsHandler != null) {
				wsHandler.sendMessage(new PracticeApp.Message("addCycle", Data.Cycle.toJson(cycle), Practice.score));
			}
		}
		return Practice.score;
	}

	/**
	 * Plays a sound for clients on the timer page. Must be from one of the available options
	 * <li>{@code abort}</li>
	 * <li>{@code autobegin}</li>
	 * <li>{@code autoend}</li>
	 * <li>{@code countdown}</li>
	 * <li>{@code endgame}</li>
	 * <li>{@code endmatch}</li>
	 * <li>{@code teleopbegin}</li>
	 * <li>{@code pickupcontrollers}</li>
	 * <li>{@code results}</li>
	 * @param sound The sound to be played. Must be from one of the available options
	 */
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

	/**
	 * Enables or disables auto-ending the run when any OpMode stops. Default behaviour is enabled.
	 * @param autoEnd Whether auto-end is enabled of disabled. True = enabled, false = disabled.
	 * @see #endRun()
	 */
	public static void setAutoEnd(boolean autoEnd) {
		Practice.autoEnd = autoEnd;
	}

	/**
	 * Ends the current run and saves all run data. The save process happens on the web app.
	 * @see #setAutoEnd(boolean) 
	 */
	public static void endRun() {
		if (matchPeriod == Data.RunState.MatchPeriod.TELEOP) {
			periodTimes[2] = System.currentTimeMillis();
		}
		runData.startingMatchPeriod = startingMatchPeriod;
		Data.SaveRunData saveRunData = new Data.SaveRunData(runData.name, runData.timestamp, runData.score, runData.info,
				runData.cycles, runData.teleopTimes, runData.startingMatchPeriod, periodTimes);

		if (wsHandler != null) {
			String json = Data.SaveRunData.toJson(saveRunData);
			wsHandler.sendMessage(new PracticeApp.Message("end", json));
		}

		DataStorage.tempSaveRun(runData, "unsaved");
	}

	public static void editCycles(List<Cycle> cycles) {
		if (!running) return;

		runData.cycles = cycles;

		score = 0;
		for (Cycle cycle : cycles) {
			score += cycle.score;
		}
	}

	public static void addCycle(Cycle cycle) {
		if (!running) return;

		runData.cycles.add(cycle);
		score += cycle.score;
	}

	/**
	 * Not for usage by users.
	 * @param opMode N/A
	 */
	@Override
	public void onOpModePreInit(OpMode opMode) {
	}

	/**
	  Not for usage by users.
	 * @param opMode N/A
	 */
	@Override
	public void onOpModePreStart(OpMode opMode) {
	}

	/**
	  Not for usage by users.
	 * @param opMode N/A
	 */
	@Override
	public void onOpModePostStop(OpMode opMode) {
		if (running && autoEnd) {
			endRun();
			running = false;
		}
	}
}