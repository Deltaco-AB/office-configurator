export class EventHandler {

	constructor(config) {
		this.config = config;
	}

	// Dispatch a message event to parent window
	postMessage(type,payload = null) {
		if(payload) {
			payload = `,"payload":"${payload}"`;
		}
		window.parent.postMessage(`{"type":"${type}"${payload}}`,window.parent.origin);
	}

	setCompatability(id) {
		console.log(this.config);
	}

	// Add product to global configuration
	addProduct(id) {
		const elements = document.querySelectorAll(`[data='${id}']`);

		this.setCompatability(id);

		for(const element of elements) {
			element.classList.add("selected");
		}

		this.postMessage("addedProduct",id);
	}

}

export class ClickEvent extends EventHandler {

	constructor(config = null) {
		super(config);
	}

	// Item grid template
	product(event) {
		function closestProductID(event) {
			const target = event.target.closest("div[data]");
			return target.getAttribute("data");
		}

		const id = closestProductID(event);

		this.addProduct(id);
	}

}