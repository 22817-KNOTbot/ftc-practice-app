package com.knotbot.practiceapp;

public class RobotEvent {
	private static PracticeApp.WsHandler wsHandler;
	public static int score = 0;
	protected static void registerWsHandler(PracticeApp.WsHandler wsHandler) {
		RobotEvent.wsHandler = wsHandler;
	}

	public static void start() {
		wsHandler.sendMessage(new PracticeApp.Message("start"));
	}

	public static void abort() {
		wsHandler.sendMessage(new PracticeApp.Message("abort"));
	}

	public static void resetTimer() {
		wsHandler.sendMessage(new PracticeApp.Message("resetTimer"));
	}

	public static void resetCycle() {
		wsHandler.sendMessage(new PracticeApp.Message("resetCycle"));
	}

	public static void setScore(int score) {
		wsHandler.sendMessage(new PracticeApp.Message("setScore", score));
	}

	public static int addScore(int score) {
		RobotEvent.score += score;
		wsHandler.sendMessage(new PracticeApp.Message("setScore", RobotEvent.score));
		return RobotEvent.score;
	}

	public static void playSound(String sound) {
		wsHandler.sendMessage(new PracticeApp.Message("playSound", sound));
	}

	public static void error(String error) {
		wsHandler.sendMessage(new PracticeApp.Message("error", error));
	}
}