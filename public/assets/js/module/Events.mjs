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
		}

		for(const element of elements) {
			element.classList.add("selected");
		}

		// Add product ID and it's index (from current category config) to user configuration
		this.selected[id] = this.config.categories[this.active.category].products[id] ?? null;
	}

	// Remove product from user configuration
	removeProduct(id,recursive = true) {
		const elements = document.querySelectorAll(`[data='${id}']`);
		const data = this.config.products[id];

		if(recursive) {
			// Disable category
			if(data.flags.enableCategory) {
				this.config.categories[data.flags.enableCategory].enabled = false;
			}
		}

		for(const element of elements) {
			element.classList.remove("selected");
		}

		delete this.selected[id];
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

	reset() {
		for(const id in this.selected) {
			this.removeProduct(id);
		}
	}

}