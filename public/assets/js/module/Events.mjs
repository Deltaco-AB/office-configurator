import { Categories, Summary } from "./Modal.mjs";

// Dispatch a message event to parent window
export function message(type,payload = null) {
	payload = JSON.stringify(payload);
	window.parent.postMessage(`{"type":"${type}","payload":${payload}}`);
}

export class EventHandler {

	constructor(config,active) {
		this.config = config;
		this.active = active;

		this.selected = {};
	}

	// Add product to user configuration
	addProduct(id) {
		const elements = document.querySelectorAll(`[data='${id}']`);
		const data = this.config.products[id];

		// Remove incompatible products
		data.incompatible.forEach(id => {
			this.removeProduct(id,false);
		});

		if(data.flags.enableCategory) {
			this.config.categories[data.flags.enableCategory].enabled = true;
			this.active.categories++;
		}

		for(const element of elements) {
			element.classList.add("selected");
		}

		// Add product ID and its index (from current category config) to user configuration
		this.selected[id] = this.config.categories[this.active.category].products[id] ?? null;
		message("productAdded",id);
	}

	// Remove product from user configuration
	removeProduct(id,recursive = true) {
		const elements = document.querySelectorAll(`[data='${id}']`);
		const data = this.config.products[id];

		if(recursive) {
			// Disable category
			if(data.flags.enableCategory) {
				this.config.categories[data.flags.enableCategory].enabled = false;
				this.active.categories -= 2;

				// Remove all products from that category
				for(const product in this.selected) {
					if(this.config.products[product].category == data.flags.enableCategory) {
						this.removeProduct(product,false);
					}
				}
			}
		}

		for(const element of elements) {
			element.classList.remove("selected");
		}

		delete this.selected[id];
		message("productRemoved",id);
	}

	// Toggle addProduct() and removeProduct()
	toggleProduct(event) {
		const target = event.target.closest("div[data]");
		const id = target.getAttribute("data");

		if(target.classList.contains("selected")) {
			this.removeProduct(id);
			return;
		}

		this.addProduct(id);
	}

	// Open categories selector (Modal)
	categories() {
		new Categories(this.config.categories);
		return true;
	}

	// Open summary (Modal)
	summary() {
		new Summary(this.selected,this.config.products);
		return true;
	}

	// Add selected items to viewfinder (reconstruct)
	sync(products) {
		for(const product in products) {
			if(this.selected[product]) {
				this.addProduct(product);
				continue;
			}
		}
	}

	reset() {
		for(const id in this.selected) {
			this.removeProduct(id);
		}
	}

}
