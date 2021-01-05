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
		setTimeout(() => this.wrapper.remove(),Modal.transitionDuration);
	}

}

export class Categories extends Modal {

	constructor(categories) {
		super("Categories");
		this.inner.classList.add("categories");

		this.appendCategories(categories);

		this.open();
	}

	appendCategories(categories) {
		let list = Modal.createDiv("list");

		function textElement(text) {
			let element = document.createElement("p");
			element.innerText = text;

			return element;
		}

		let i = 1;
		for(let [id,data] of Object.entries(categories)) {
			if(!data.enabled) {
				continue;
			}

			let item = Modal.createDiv("center");
			item.setAttribute("data",id);

			item.appendChild(textElement(i));
			item.appendChild(textElement(data.name));

			list.appendChild(item);
			i++;
		}

		this.append(list);
	}

}