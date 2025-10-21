package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

import com.acmerobotics.dashboard.config.Config;

import com.knotbot.practiceapp.Data;
import com.knotbot.practiceapp.DataStorage;
import com.knotbot.practiceapp.RobotEvent;
import com.knotbot.practiceapp.PracticeApp;

@TeleOp
@Config
public class Test extends LinearOpMode {
	public static boolean send = false;
	public static Actions action = Actions.NONE;
	public static String name = "test1";
	public static String text = "{\"key\":\"value\"}";
	public static int value = 1;
	public static Period period = Period.AUTO;

	public enum Actions {
		NONE,
		START,
		ABORT,
		ADD_SCORE,
		ADD_DOUBLE_SCORE,
		RESET_SCORE,
		ERROR,
		START_PERIOD,
		LOG,
	}

	public enum Period {
		AUTO,
		TRANSITION,
		TELEOP,
	}

	@Override
	public void runOpMode() {
		waitForStart();
		switch (period) {
			case AUTO:
				RobotEvent.startAuto();
				break;
			case TRANSITION:
				RobotEvent.startTransition();
				break;
			case TELEOP:
				RobotEvent.startTeleop();
				break;
		}
		while (opModeIsActive()) {
			if (gamepad1.b) {
				RobotEvent.abort();
				break;
			}
			if (gamepad1.a) {
				RobotEvent.addScore(1);
			}
			if (gamepad1.x) {
				RobotEvent.setScore(0);
			}
			if (send) {
				switch (action) {
					case START:
						RobotEvent.start();
						break;
					case ABORT:
						RobotEvent.abort();
						break;
					case ADD_SCORE:
						RobotEvent.addScore(value, name);
						break;
					case ADD_DOUBLE_SCORE:
						RobotEvent.addScore(value, name);
						RobotEvent.addScore(value, name);
						break;
					case RESET_SCORE:
						RobotEvent.setScore(0);
						break;
					case ERROR:
						RobotEvent.error("Test error");
						break;
					case LOG:
						System.out.println(RobotEvent.runData);
						break;
					case START_PERIOD:
						switch (period) {
							case AUTO:
								RobotEvent.startAuto();
								break;
							case TRANSITION:
								RobotEvent.startTransition();
								break;
							case TELEOP:
								RobotEvent.startTeleop();
								break;
						}
						break;
					case NONE:
						break;
				}
			}
			Test.send = false;
		}
	}
}
