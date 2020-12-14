import { Configurator, Modal } from "./module/Configurator.mjs";

const searchParams = new URLSearchParams(window.location.search);
const loadingScreen = new Modal("<img src='assets/img/loading.gif'/>");

function coercive(param) {
	switch(param) {
		case "true": case "1": case "yes": return true;
		default: return false;
	}
}

// Prompt user to log in before initializing the configurator
if(searchParams.has("loggedIn")) {
	if(!coercive(searchParams.get("loggedIn"))) {
		new Modal("<p>Please log in to use this configurator</p>");
	}
}

// Wait for external config or fetch default
if(!coercive(searchParams.get("awaitConfig"))) {
	fetch("config.json").then(response => response.text()).then(config => {
		window.postMessage({
			type: "config",
			payload: config
		},location.origin);
	});
}

window.addEventListener("message",event => {
	if(event.origin !== top.location.origin || event.data.type !== "config") {
		return;
	}
	
	// Initialize configurator with event payload
	new Configurator(JSON.parse(event.data.payload));

	loadingScreen.close();
	window.removeEventListener("message");
});

window.postMessage({type:"ready"},window.parent);