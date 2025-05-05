import abort from "./assets/sfx/abort.wav";
import autobegin from "./assets/sfx/autobegin.wav";
import autoend from "./assets/sfx/autoend.wav";
import countdown from "./assets/sfx/countdown.wav";
import endgame from "./assets/sfx/endgame.wav";
import endmatch from "./assets/sfx/endmatch.wav";
import teleopbegin from "./assets/sfx/teleopbegin.wav";
import pickupcontrollers from "./assets/sfx/pickupcontrollers.wav";
import results from "./assets/sfx/results.wav";

interface Audios {
	[details: string]: HTMLAudioElement;
}

export class Sounds {
	audios: Audios = {};
	preload() {
		this.audios["abort"] = new Audio(abort);
		this.audios["autobegin"] = new Audio(autobegin);
		this.audios["autoend"] = new Audio(autoend);
		this.audios["countdown"] = new Audio(countdown);
		this.audios["endgame"] = new Audio(endgame);
		this.audios["endmatch"] = new Audio(endmatch);
		this.audios["teleopbegin"] = new Audio(teleopbegin);
		this.audios["pickupcontrollers"] = new Audio(pickupcontrollers);
		this.audios["results"] = new Audio(results);
	}

	playSound(sound: string) {
		if (this.audios[sound]) {
			this.audios[sound].play();
		}
	}
}
