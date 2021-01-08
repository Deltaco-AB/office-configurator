export class Modal {

	static transitionDuration = 300;
	static closeIcon = "<svg onclick='this.closest(\".modal\").close()' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M0 0h24v24H0z' fill='none'/><path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/></svg>";

	constructor(title = false) {
		this.wrapper = Modal.createDiv("modal center");
		this.inner = Modal.createDiv("inner");

		if(title) {
			this.appendHeader(title);
			this.wrapper.addEventListener("click",(event) => this.close(event));
		}
		
		this.wrapper.close = () => this.close();
	}

	// Create a div with classes
	static createDiv(classes) {
		let element = document.createElement("div");
		element.classList = classes;

		return element;
	}

	// Add modal content from node or HTML
	append(content) {
		content = content.outerHTML ?? content;
		this.inner.insertAdjacentHTML("beforeend",content);
	}

	// Helper functions for modal header
	appendHeader(title) {
		let header = Modal.createDiv("header center");

		function heading() {
			let heading = document.createElement("h1");
			heading.innerText = title;

			return heading;
		}

		// Close button
		function close() {
			let close = Modal.createDiv("close center");
			close.setAttribute("onclick","this.closest('.modal').close()");
	
			close.appendChild(Modal.createDiv("line"));
			close.appendChild(Modal.createDiv("line"));
	
			return close;
		}
		
		header.appendChild(heading());
		header.appendChild(close());

		this.append(header);
	}
	
	// ----

	open(content = false) {
		if(content) {
			this.append(content);
		}

		this.wrapper.appendChild(this.inner);
		document.body.appendChild(this.wrapper);

		setTimeout(() => this.wrapper.classList.add("active"),0);
	}

	close(event) {
		// Ignore clicks inside wrapper
		if(event && event.target != this.wrapper) {
			return false;
		}
		
		this.wrapper.classList.remove("active");
		setTimeout(() => this.wrapper.remove(), Modal.transitionDuration);
	}

}

export class Summary extends Modal {

	constructor(selected,products) {
		super("Summary");

		if(Object.keys(selected).length === 0) {
			this.open("<h2>Your configuration is empty</h2><p>Select at least one product to proceed</p>");
			return;
		}

		this.inner.classList.add("summary");
		this.products = products;

		this.appendProducts(selected);

		this.open();
	}

	createListItem(icon,text,id) {
		function textElement(text) {
			let element = document.createElement("p");
			element.innerText = text;

			return element;
		}

		let item = Modal.createDiv("item center");
		item.setAttribute("data",id);

		item.appendChild(textElement(icon));
		item.appendChild(textElement(text));

		return item;
	}

	appendProducts(selected) {
		let list = Modal.createDiv("list");

		for(const [id,index] of Object.entries(selected)) {
			let data = this.products[id];

			if(data.add.length === 0) {
				data.add[0] = id;
			}

			data.add.forEach(id => {
				list.appendChild(this.createListItem(id,index));
			});
		}

		this.append(list);
	}

}

export class Categories extends Modal {

	constructor(categories) {
		super("Categories");
		this.inner.classList.add("categories");

		this.appendCategories(categories);
		this.appendSummary();
		this.bind();

		this.open();
	}

	click(event) {
		const target = event.target.closest(".item") ?? false;
		if(!target) {
			return false;
		}

		let value = parseInt(target.getAttribute("data"));

		if(value === 0) {
			value = "summary";
		}

		window._configCategory(value);
		this.close();
	}

	bind() {
		this.inner.addEventListener("click",event => this.click(event));
	}

	// ----

	createListItem(icon,text,id) {
		function textElement(text) {
			let element = document.createElement("p");
			element.innerText = text;

			return element;
		}

		let item = Modal.createDiv("item center");
		item.setAttribute("data",id);

		item.appendChild(textElement(icon));
		item.appendChild(textElement(text));

		return item;
	}

	appendCategories(categories) {
		let list = Modal.createDiv("list");

		let i = 1;
		for(let [id,data] of Object.entries(categories)) {
			if(!data.enabled) {
				continue;
			}

			list.appendChild(this.createListItem(i,data.name,id));
			i++;
		}

		this.append(list);
	}

	appendSummary() {
		const list = this.inner.getElementsByClassName("list")[0];

		list.appendChild(this.createListItem("i","Summary",0));
	}

}