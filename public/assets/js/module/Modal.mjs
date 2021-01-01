export class Modal {

	static transitionDuration = 300;

	constructor(content,title = false) {
		this.element = Modal.createDiv("modal center");
		this.element.addEventListener("click",(event) => this.close(event));
		this.element.close = () => this.close();

		this.appendContent(content,title);
		this.open();
	}

	// Create a div with classes
	static createDiv(classes) {
		let element = document.createElement("div");
		element.classList = classes;

		return element;
	}

	appendContent(content,title) {
		let inner = Modal.createDiv("inner");

		// Modal header
		if(title) {
			inner.insertAdjacentHTML("afterbegin",`<div class='header center'><h1>${title}</h1><img onclick='this.closest(".modal").close()' src='assets/img/icon_close.svg'/></div>`);
		}

		// Insert modal "inner" content
		inner.insertAdjacentHTML("beforeend",content);

		this.element.appendChild(inner);
	}
	
	// ----

	open() {
		document.body.appendChild(this.element);
		setTimeout(() => this.element.classList.add("active"),0);
	}

	close(event = false) {
		// Don't close modals without a header (close button)
		if(event && this.element.getElementsByClassName(".header") != undefined) {
			return false;
		}

		this.element.classList.remove("active");
		setTimeout(() => this.element.remove(),Modal.transitionDuration);
	}

}