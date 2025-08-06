import abort from "./assets/sfx/abort.mp3";
import autobegin from "./assets/sfx/autobegin.mp3";
import autoend from "./assets/sfx/autoend.mp3";
import countdown from "./assets/sfx/countdown.mp3";
import endgame from "./assets/sfx/endgame.mp3";
import endmatch from "./assets/sfx/endmatch.mp3";
import teleopbegin from "./assets/sfx/teleopbegin.mp3";
import pickupcontrollers from "./assets/sfx/pickupcontrollers.mp3";
import results from "./assets/sfx/results.mp3";

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
