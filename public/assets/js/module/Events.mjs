export class EventHandler {

	static localStorageObject = "deltaconfigUserConf";

	constructor(config) {
		this.config = config;
	}

	static save(data) {
		data += window.localStorage.getItem(EventHandler.localStorageObject);
		window.localStorage.setItem(EventHandler.localStorageObject,data);
	}

	static load() {
		return window.localStorage.getItem(EventHandler.localStorageObject);
	}

	getMultipack(id) {
		return this.config.products[id].add;
	}

	// Add product to global configuration
	addProduct(id) {
		const elements = document.querySelectorAll(`[data='${id}']`);

		for(const element of elements) {
			element.classList.add("selected");
		}
	}

	removeProduct(id) {
		const elements = document.querySelectorAll(`[data='${id}']`);

		for(const element of elements) {
			element.classList.remove("selected");
		}
	}

	// Item grid template
	product(event) {
		const target = event.target.closest("div[data]");
		const id = target.getAttribute("data");

		if(target.classList.contains("selected")) {
			this.removeProduct(id);
			return;
		}

		this.addProduct(id);
	}

}