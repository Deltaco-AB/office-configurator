// Simulate the ExpressCart behaviour on ShoppingCart.aspx
// Requires jQuery (present on deltaco.se/no/fi/dk)

const officeGuideElements = {
	wrapper: $(".msax-expresscart-view"),
	button: $(".msax-CommandAddToCart")[0],
	itemsInput: document.querySelectorAll(".msax-expresscart-items")[0]
}

// Add product to Express Cart list
function officeGuideCart_add(payload) {
	// payload[0] = product ID ; payload[1] = quantity
	officeGuideElements.itemsInput.value += `${payload[0]}#${payload[1]}\n`;
}

// Submit Express Cart list
function officeGuideCart_submit() {
	// Call the SharePoint function for our .msax-expresscart-view family
	Microsoft.Dynamics.Retail.SharePoint.Web.UI.ViewModel.AddToExpressCartViewModel(msaxServices, officeGuideElements.wrapper);
	
	// Trigger the nested jQuery click() function, binded when calling AddToExpressCartViewModel
    officeGuideElements.button.click();
}

// Post message event handler
window.addEventListener("message", function(event) {
    switch(event.data[0]) {
		case "add":
			officeGuideCart_add(event.data[1]);
			break;
		case "submit":
			officeGuideCart_submit();
			break;
	}
});