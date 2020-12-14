export class Modal {

	static transitionDuration = 300;

	constructor(content,title = false) {
		this.element = Modal.createElement("modal center");
		this.element.close = () => this.close();

		this.appendContent(content,title);
		this.open();
	}

	static createElement(classes) {
		let element = document.createElement("div");
		element.classList = classes;

		return element;
	}

	appendContent(content,title) {
		let inner = Modal.createElement("inner");

		if(title) {
			inner.insertAdjacentHTML("afterbegin",`<div class='header center'><h1>${title}</h1><img onclick='this.closest(".modal").close()' src='assets/img/icon_close.svg'/></div>`);
		}
		inner.insertAdjacentHTML("beforeend",content);

		this.element.appendChild(inner);
	}

	open() {
		document.body.appendChild(this.element);
		setTimeout(() => this.element.classList.add("active"),0);
	}

	close() {
		this.element.classList.remove("active");
		setTimeout(() => this.element.remove(),Modal.transitionDuration);
	}

}