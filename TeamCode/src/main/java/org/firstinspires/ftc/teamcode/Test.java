package org.firstinspires.ftc.teamcode;

import com.knotbot.practiceapp.Practice;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

import com.acmerobotics.dashboard.config.Config;

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
				Practice.startAuto();
				break;
			case TRANSITION:
				Practice.startTransition();
				break;
			case TELEOP:
				Practice.startTeleop();
				break;
		}
		while (opModeIsActive()) {
			if (gamepad1.b) {
				Practice.abort();
				break;
			}
			if (gamepad1.a) {
				Practice.addScore(1);
			}
			if (send) {
				switch (action) {
					case START:
						Practice.start();
						break;
					case ABORT:
						Practice.abort();
						break;
					case ADD_SCORE:
						Practice.addScore(value, name);
						break;
					case ADD_DOUBLE_SCORE:
						Practice.addScore(value, name);
						Practice.addScore(value, name);
						break;
					case ERROR:
						Practice.error("Test error");
						break;
					case LOG:
						System.out.println(Practice.runData);
						break;
					case START_PERIOD:
						switch (period) {
							case AUTO:
								Practice.startAuto();
								break;
							case TRANSITION:
								Practice.startTransition();
								break;
							case TELEOP:
								Practice.startTeleop();
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
