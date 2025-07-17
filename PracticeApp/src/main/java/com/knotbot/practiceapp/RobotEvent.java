package com.knotbot.practiceapp;

public class RobotEvent {
	private static PracticeApp.WsHandler wsHandler;
	public static int score = 0;
	protected static void registerWsHandler(PracticeApp.WsHandler wsHandler) {
		RobotEvent.wsHandler = wsHandler;
	}

	public static void start() {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("start"));
		}
	}

	public static void abort() {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("abort"));
		}
	}

	public static void resetTimer() {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("resetTimer"));
		}
	}

	public static void resetCycle() {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("resetCycle"));
		}
	}

	public static void setScore(int score) {
		if (wsHandler != null) {
			wsHandler.sendMessage(new PracticeApp.Message("setScore", score));
		}
	}

	public static int addScore(int score) {
		if (wsHandler != null) {
			RobotEvent.score += score;
			wsHandler.sendMessage(new PracticeApp.Message("setScore", RobotEvent.score));
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
}