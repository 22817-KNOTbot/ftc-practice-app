package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

import com.knotbot.practiceapp.RobotEvent;

@TeleOp
public class Test extends LinearOpMode {
	@Override
	public void runOpMode() {
		waitForStart();
		RobotEvent.start();
		while (opModeIsActive()) {
			if (gamepad1.b) {
				RobotEvent.abort();
				break;
			}
			if (gamepad1.a) {
				RobotEvent.addScore(1);
				RobotEvent.resetCycle();
			}
			if (gamepad1.x) {
				RobotEvent.setScore(0);
			}
			if (gamepad1.y) {
				RobotEvent.error("Test error");
			}
		}
	}
}
