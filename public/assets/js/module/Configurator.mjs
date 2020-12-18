import { QoL } from "./Extensions.mjs"; // Quality of Life monkey-functions
import { EventHandler, ClickEvent } from "./Events.mjs";
import { Modal } from "./Modal.mjs"; 

export { Modal, QoL };

export class Configurator {

	static selectedHTML = "<svg class='selected' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 168 165'><title>Remove product</title><path d='M607.62,303.22h151a7,7,0,0,1,7,7v148a7,7,0,0,1-7,7h-151a7,7,0,0,1-7-7v-148A7,7,0,0,1,607.62,303.22Z' transform='translate(-599.12 -301.72)'/><path d='M705.05,367.48h-7.66V360.4a4.71,4.71,0,0,0-4.72-4.71H673.81a4.71,4.71,0,0,0-4.72,4.71v7.08h-7.66a2.95,2.95,0,1,0,0,5.89h1.77v34.19a4.71,4.71,0,0,0,4.71,4.72h30.66a4.71,4.71,0,0,0,4.71-4.72V373.37h1.77a2.95,2.95,0,1,0,0-5.89Zm-13.56,0H675v-3.3a2.59,2.59,0,0,1,2.59-2.6H688.9a2.59,2.59,0,0,1,2.59,2.6v3.3ZM675,375.73V404a2.36,2.36,0,1,1-4.72,0v-28.3a2.36,2.36,0,1,1,4.72,0Zm10.61,0V404a2.36,2.36,0,0,1-4.72,0v-28.3a2.36,2.36,0,0,1,4.72,0Zm10.61,0V404a2.36,2.36,0,1,1-4.72,0v-28.3a2.36,2.36,0,1,1,4.72,0Z' transform='translate(-599.12 -301.72)'/></svg>";

	constructor(config) {
		this.config = config;

		this.active = {
			categories: 0,
			category: 0,
			pages: 0,
			page: 0
		}
		
		this.init();
	}

	page(index) {
		if(!QoL.range(index,1,this.active.pages)) {
			throw new Error("Page index out of range");
		}

		const paging = document.getElementById("paging");
		const prev = paging.firstElementChild;
		const next = paging.lastElementChild;

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
		const categories = this.config.categories;

		if(!QoL.range(index,1,categories)) {
			throw new Error("Category index out of range");
		}

		const wrapper = document.getElementById("select");
		const category = categories[index]; // Isolated object
		
		const gridLength = 4; // Number of items per page
		
		// Number of pages
		const pages = Math.ceil(QoL.len(category.products) / gridLength);
		document.getElementById("configure").style.setProperty("--page-count",pages);
		document.getElementById("totalPages").innerText = pages;

		QoL.removeChildren(wrapper);

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
			const productID = category.products[i];

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
				item.addEventListener("click",event => new ClickEvent(this.config).product(event),false);
			}

			grid.appendChild(item);
		}

		this.active.category = index;
		this.active.pages = pages;
		this.page(1);
	}

	init() {
		const config = this.config;

		if(config.origin && config.origin != window.top.origin) {
			throw new Error("Config not supported by origin");
		}

		// Populate viewfinder with products
		function viewfinder(products) {
			const viewfinder = document.getElementById("viewfinder");

			QoL.removeChildren(viewfinder);

			let i = 0;
			for(const id in products) {
				let element = document.createElement("div");

				element.classList = "item";
				element.style.setProperty("background-position-y",`calc(var(--sprite-viewfinder-height) * -${i})`);
				element.setAttribute("data",id);

				viewfinder.appendChild(element);
				i++;
			}
		}

		document.getElementById("configName").innerText = config.defaultName;

		// Prepare categories to receive products
		for(const i in config.categories) {
			config.categories[i].products = [];
		}

		// Assign each product to its category by index in config
		let i = -1;
		for(const [id,data] of Object.entries(config.products)) {
			i++;
			if(data.category == 0) {
				continue;
			}

			config.categories[data.category].products.push(i);
		}
		
		// Pagination buttons
		const paging = document.getElementById("paging");

		paging.firstElementChild.addEventListener("click",event => this.page(
			new ClickEvent(this.active).prevPage(event)
		));
		paging.lastElementChild.addEventListener("click",event => this.page(
			new ClickEvent(this.active).nextPage(event)
		));

		// Category buttons
		const category = document.getElementById("category");

		category.firstElementChild.addEventListener("click",event => this.category(
			new ClickEvent(this.config).categories()
		));
		category.lastElementChild.addEventListener("click",event => {
			const category = new ClickEvent(this.active).nextCategory();

			if(category == "summary") {
				this.summary();
				return;
			}

			this.category(category);
		});

		this.active.categories = QoL.len(config.categories);

		viewfinder(config.products);
		this.category(1);
	}

}