// Simulate DELTACO's ExpressCart behaviour on 'ShoppingCart.aspx'

const officeGuideElements = {
	wrapper: $(".msax-expresscart-view"),
	button: $(".msax-CommandAddToCart")[0],
	itemsInput: document.querySelectorAll(".msax-expresscart-items")[0]
}

window.addEventListener("message", (event) => {
	if(event.origin !== "https://app.cloud.deltaco.eu" || event.data.type != "cart") {
		return;
	}
	
	// Append each cart pair with the expected convention
	for(const [key,value] of Object.entries(event.data.payload)) {
        	officeGuideElements.itemsInput.value += `${key}#${value}\n`;
	}
	
	// Call the ExpressCart parser from SharePoint
	Microsoft.Dynamics.Retail.SharePoint.Web.UI.ViewModel.AddToExpressCartViewModel(msaxServices, officeGuideElements.wrapper);
	officeGuideElements.button.click();
});