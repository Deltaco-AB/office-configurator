console.warn("Unsupported browser");

function removeChildren(element) {
	while(element.firstChild) {
		element.removeChild(element.lastChild);
	}
}

removeChildren(document.body);

document.body.insertAdjacentHTML("beforeend","<p style='text-align:center;'><strong>Outdated browser</strong><br><a href='https://www.microsoft.com/edge' target='blank_'>Click here to upgrade to a modern and faster browser</a></p>");
