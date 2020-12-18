import { ProductMeta } from "./Extensions.mjs";

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

	// Dispatch a message event to parent window
	postMessage(type,payload = null) {
		if(payload) {
			payload = `,"payload":"${payload}"`;
		}
		window.parent.postMessage(`{"type":"${type}"${payload}}`,window.parent.origin);
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

		this.postMessage("addedProduct",id);

		if(ProductMeta.hasMultipack(id)) {
			
		}
	}

	removeProduct(id) {
		const elements = document.querySelectorAll(`[data='${id}']`);

		for(const element of elements) {
			element.classList.remove("selected");
		}

		this.postMessage("removedProduct",id);
	}

}

export class ClickEvent extends EventHandler {

	constructor(config = null) {
		super(config);
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

	nextPage(event) {
		const target = event.target.closest(".next");

		if(!target.classList.contains("active")) {
			return this.config.page;
		}

		return this.config.page + 1;
	}

	prevPage(event) {
		const target = event.target.closest(".prev");

		if(!target.classList.contains("active")) {
			return this.config.page;
		}

		return this.config.page - 1;
	}

	nextCategory(event) {
		if(this.config.category == this.config.categories) {
			return "summary";
		}

		return this.config.category + 1;
	}

}