import { coercive } from "./module/Extensions.mjs";
import { message } from "./module/Events.mjs";
import { Init as Configurator, Modal } from "./module/Configurator.mjs";

const searchParams = new URLSearchParams(window.location.search);
const awaitConfig = coercive(searchParams.get("awaitConfig"));

let ping = {
	ready: {
		interval: null,
		timeout: null,
		failed: () => {
			// No config was received in sufficient time
			clearInterval(ping.ready.interval);
			loadingScreen.close();

			const error = new Modal();
			error.open("<h2>Failed to load configuration</h2><p>Request timed out</p>");
		}
	}
}

const loadingScreen = new Modal();
loadingScreen.inner.style.setProperty("width","unset");
loadingScreen.open("<img src='assets/img/loading.gif'/>");

// Prompt user to log in before initializing the configurator
if(searchParams.has("loggedIn")) {
	if(!coercive(searchParams.get("loggedIn"))) {
		new Modal().open("<p>Please log in to use this configurator</p>");
	}
}

// Initialize with default config if awaitConfig is false
if(!awaitConfig) {
	fetch("config.json").then(response => response.text()).then(config => {
		window.postMessage({
			type: "config",
			payload: config
		},location.origin);
	});
}

window.addEventListener("message",event => {
	if(event.data.type !== "config") {
		return;
	}
	
	// Initialize configurator with event payload
	window.guide = new Configurator(JSON.parse(event.data.payload));

	loadingScreen.close();
	clearInterval(ping.ready.interval);
	clearTimeout(ping.ready.timeout);
});

// Ping parent window until a config is received
if(awaitConfig) {
	ping.ready.interval = setInterval(() => message("ready"),2000); // Ping every 2 seconds
	ping.ready.timeout = setTimeout(ping.ready.failed,5000); // Give up after 5 seconds
}
