import { Init as Configurator, Modal, QoL } from "./module/Configurator.mjs";

const searchParams = new URLSearchParams(window.location.search);
const loadingScreen = new Modal();
loadingScreen.open("<img src='assets/img/loading.gif'/>");

// Prompt user to log in before initializing the configurator
if(searchParams.has("loggedIn")) {
	if(!QoL.coercive(searchParams.get("loggedIn"))) {
		new Modal().open("<p>Please log in to use this configurator</p>");
	}
}

// Wait for external config or fetch default
if(!QoL.coercive(searchParams.get("awaitConfig"))) {
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
	window.guide = new Configurator(JSON.parse(event.data.payload));

	loadingScreen.close();
});

window.parent.postMessage({type:"ready"},window.parent.origin);