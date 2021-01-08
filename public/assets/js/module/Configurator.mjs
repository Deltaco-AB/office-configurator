import { FunctionExtended } from "./Extensions.mjs";
import { EventHandler } from "./Events.mjs";
import { Modal } from "./Modal.mjs"; 

export { Modal, FunctionExtended };

class Configurator {

	static selectedHTML = "<svg class='selected' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 168 165'><title>Remove product</title><path d='M607.62,303.22h151a7,7,0,0,1,7,7v148a7,7,0,0,1-7,7h-151a7,7,0,0,1-7-7v-148A7,7,0,0,1,607.62,303.22Z' transform='translate(-599.12 -301.72)'/><path d='M705.05,367.48h-7.66V360.4a4.71,4.71,0,0,0-4.72-4.71H673.81a4.71,4.71,0,0,0-4.72,4.71v7.08h-7.66a2.95,2.95,0,1,0,0,5.89h1.77v34.19a4.71,4.71,0,0,0,4.71,4.72h30.66a4.71,4.71,0,0,0,4.71-4.72V373.37h1.77a2.95,2.95,0,1,0,0-5.89Zm-13.56,0H675v-3.3a2.59,2.59,0,0,1,2.59-2.6H688.9a2.59,2.59,0,0,1,2.59,2.6v3.3ZM675,375.73V404a2.36,2.36,0,1,1-4.72,0v-28.3a2.36,2.36,0,1,1,4.72,0Zm10.61,0V404a2.36,2.36,0,0,1-4.72,0v-28.3a2.36,2.36,0,0,1,4.72,0Zm10.61,0V404a2.36,2.36,0,1,1-4.72,0v-28.3a2.36,2.36,0,1,1,4.72,0Z' transform='translate(-599.12 -301.72)'/></svg>";

	constructor(config) {
		this.config = config;

		// Current configurator states
		this.active = {
			categories: 0,
			category: 0,
			pages: 0,
			page: 0
		}

		this.evt = new EventHandler(this.config,this.active);
	}

	page(index) {
		if(!FunctionExtended.range(index,1,this.active.pages)) {
			throw new Error("Page index out of range");
		}

		const paging = document.getElementById("paging");
		const prev = paging.firstElementChild; // Previous page button
		const next = paging.lastElementChild; // Next page button

		prev.classList.remove("active");
		next.classList.remove("active");

		if(index > 1) {
			prev.classList.add("active");
		}

		if(this.active.pages > 1 && index < this.active.pages) {
			next.classList.add("active");
		}

		document.getElementById("select").style.setProperty("--page",index - 1);
		document.getElementById("currentPage").innerText = index;

		this.active.page = index;
	}

	category(index) {
		if(index === "summary") {
			this.evt.summary();
			return;
		}

		if(!FunctionExtended.range(index,1,this.config.categories)) {
			throw new Error("Category index out of range");
		}

		const wrapper = document.getElementById("select");
		const category = this.config.categories[index]; // Isolated object
		
		const gridLength = 4; // Number of items per page
		
		// Number of pages
		const pages = Math.ceil(FunctionExtended.len(category.products) / gridLength);
		document.getElementById("configure").style.setProperty("--page-count",pages);
		document.getElementById("totalPages").innerText = pages;

		FunctionExtended.removeChildren(wrapper);

		// Populate pages with products
		for(let i = 0;i < (pages * gridLength);i++) {
			// Create a new page
			if(i % gridLength == 0) {
				let page = document.createElement("div");
				let grid = document.createElement("div");

				page.classList = "page";
				grid.classList = "grid";

				page.appendChild(grid);
				wrapper.appendChild(page);
			}

			const grid = wrapper.lastChild.lastChild; // #select .page .grid
			const productID = Object.values(category.products)[i];

			// Create blank item
			let item = document.createElement("div");
			item.classList = "item center";

			// Add product data to item
			if(productID !== undefined) {
				item.classList.add("active");
				item.setAttribute("data",Object.keys(this.config.products)[productID]);

				let thumbnail = document.createElement("div");

				thumbnail.style.setProperty("background-position-y",`calc(var(--sprite-thumbnail-height) * -${productID})`);
				
				item.appendChild(thumbnail);
				item.insertAdjacentHTML("beforeend",Configurator.selectedHTML);
				item.addEventListener("click",event => this.evt.toggleProduct(event),false);
			}

			grid.appendChild(item);
		}

		this.active.category = index;
		this.active.pages = pages;
		this.page(1);
		this.evt.sync(category.products);
	}

	reset() {
		this.evt.reset();
		this.category(1);
	}

}

export class Init extends Configurator {

	constructor(config) {
		super(config);

		if(this.config.origin && this.config.origin != window.top.origin) {
			throw new Error("Config not supported by origin");
		}

		//document.getElementById("configName").innerText = this.config.defaultName;

		this.initProducts();
		this.initPagination();
		this.initCategories();
		this.initViewfinder();
		this.initActions();

		// Start the configurator
		this.category(1);
	}

	// Bind pagination event listeners
	initPagination() {
		const paging = document.getElementById("paging");

		// Previous page button
		paging.firstElementChild.addEventListener("click",event => {
			if(FunctionExtended.isActive(event.target.closest(".pageButton"))) {
				this.page(this.active.page - 1);
			}
		});
		// Next page button
		paging.lastElementChild.addEventListener("click",event => {
			if(FunctionExtended.isActive(event.target.closest(".pageButton"))) {
				this.page(this.active.page + 1);
			}
		});
	}

	// Bind category event listeners
	initCategories() {
		const category = document.getElementById("category");

		// Category interface
		window._configCategory = (category) => this.category(category);

		// All categories button
		category.firstElementChild.addEventListener("click",() => this.evt.categories());

		// Next category button
		category.lastElementChild.addEventListener("click",event => {
			if(this.active.category >= this.active.categories) {
				this.evt.summary();
				return;
			}

			this.category(this.active.category + 1);
		});
	}

	// Create viewfinder elements from config
	initViewfinder() {
		const viewfinder = document.getElementById("viewfinder");

		FunctionExtended.removeChildren(viewfinder);

		let i = 0;
		for(const id in this.config.products) {
			let element = document.createElement("div");

			element.classList = "item";
			element.style.setProperty("background-position-y",`calc(var(--sprite-viewfinder-height) * -${i})`);
			element.setAttribute("data",id);

			if(this.config.products[id].flags.outlined) {
				element.classList.add("outlined");
			}

			viewfinder.appendChild(element);
			i++;
		}
	}

	// Populate categories with products
	initProducts() {
		for(const [id,data] of Object.entries(this.config.categories)) {
			this.config.categories[id].products = {}; // Prepare categories to receive products

			if(data.enabled) {
				this.active.categories++;
			}
		}

		// Assign each product to its category by index in config
		let i = -1;
		for(const [id,data] of Object.entries(this.config.products)) {
			i++;
			if(data.category == 0) {
				continue;
			}

			this.config.categories[data.category].products[id] = i;
		}
	}

	initActions() {
		document.getElementById("configReset")?.addEventListener("click",() => this.reset()); // Reset button
	}

}