interface Audios {
	[details: string]: HTMLAudioElement;
}

export class Sounds {
	audios: Audios = {};
	preload() {
		this.audios["abort"] = new Audio("./src/assets/sfx/abort.wav");
		this.audios["autobegin"] = new Audio("./src/assets/sfx/autobegin.wav");
		this.audios["autoend"] = new Audio("./src/assets/sfx/autoend.wav");
		this.audios["countdown"] = new Audio("./src/assets/sfx/countdown.wav");
		this.audios["endgame"] = new Audio("./src/assets/sfx/endgame.wav");
		this.audios["endmatch"] = new Audio("./src/assets/sfx/endmatch.wav");
		this.audios["teleopbegin"] = new Audio(
			"./src/assets/sfx/teleopbegin.wav"
		);
		this.audios["pickupcontrollers"] = new Audio(
			"./src/assets/sfx/pickupcontrollers.wav"
		);
		this.audios["results"] = new Audio("./src/assets/sfx/results.wav");
	}

	playSound(sound: string) {
		if (this.audios[sound]) {
			this.audios[sound].play();
		}
	}
}
