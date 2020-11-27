/*
*   Stage: Groups of products 1-4
*   Pages: Smaller groups of four products within a stage
*/

// Set default configuration
// Values assigned to this object are saved between sessions (persistant)
let configuration = {
    meta: { 
        currentStage: 1,
        pageFour: false
    },
    products: []
}; 

const products = {
    // Preview and viewfinder element pairs
    list: {
        DELO0201: document.getElementsByClassName("DELO0201"),
        DELO0100: document.getElementsByClassName("DELO0100"),
        DELC0100: document.getElementsByClassName("DELC0100"),
        DELO0150: document.getElementsByClassName("DELO0150"),
        DELO0152: document.getElementsByClassName("DELO0152"),
        DELO0153: document.getElementsByClassName("DELO0153"),
        DELO0155: document.getElementsByClassName("DELO0155"),
        DELO0154: document.getElementsByClassName("DELO0154"),
        DELO0156: document.getElementsByClassName("DELO0156"),
        DELO0157: document.getElementsByClassName("DELO0157"),
        DELO0158: document.getElementsByClassName("DELO0158"),
        DELO0200: document.getElementsByClassName("DELO0200"),
        DELO0202: document.getElementsByClassName("DELO0202"),
        DELO0301: document.getElementsByClassName("DELO0301"),
        DELO0203: document.getElementsByClassName("DELO0203"),
        DELO0204: document.getElementsByClassName("DELO0204"),
        DELO0300: document.getElementsByClassName("DELO0300"),
        DELO0302: document.getElementsByClassName("DELO0302"),
        DELO0303: document.getElementsByClassName("DELO0303"),
        DELO0402: document.getElementsByClassName("DELO0402"),
    },
    incompatible: {
        // Compatability list. Array contains incompatible products
        DELO0303: ["DELO0302"],
        DELO0302: ["DELO0303","DELO0301","DELO0300"],
        DELO0301: ["DELO0300","DELO0302"],
        DELO0300: ["DELO0301","DELO0302"],
        DELO0150: ["DELO0153"],
        DELO0153: ["DELO0150","DELO0152"],
        DELO0152: ["DELO0153"],
        DELO0203: ["DELO0204"],
        DELO0204: ["DELO0203"]
    },
    stages: {
        // Defines which products to show on each stage
        1: ["DELO0100"],
        2: ["DELO0303","DELO0302","DELO0301","DELO0300"],
        3: ["DELO0150","DELO0153","DELO0152","DELC0100","DELO0202","DELO0402","DELO0203","DELO0204","DELO0200","DELO0201"],
        4: ["DELO0154","DELO0155","DELO0156","DELO0157","DELO0158"]
    },
    enableFourth: [
        // Defines which products enable the fourth stage
        "DELO0153",
        "DELO0152"
    ],
    // Remove featured and other session-added products on load
    removeOnLoad: [],
    translate: {
        // Translate office guide product numbers to their hyphen-equivalent
        // This object also defines multi-pack dependencies
        DELO0201: ["DELO-0201"],
        DELO0100: ["DELO-0100"],
        DELC0100: ["DELC-0100"],
        DELO0150: ["DELO-0150"],
        DELO0152: ["DELO-0152","DELO-0151"],
        DELO0153: ["DELO-0153","DELO-0151"],
        DELO0155: ["DELO-0155"],
        DELO0154: ["DELO-0154"],
        DELO0156: ["DELO-0156"],
        DELO0157: ["DELO-0157"],
        DELO0158: ["DELO-0158"],
        DELO0200: ["DELO-0200"],
        DELO0202: ["DELO-0202"],
        DELO0301: ["DELO-0301"],
        DELO0203: ["DELO-0203"],
        DELO0204: ["DELO-0204"],
        DELO0300: ["DELO-0300"],
        DELO0302: ["DELO-0302"],
        DELO0303: ["DELO-0303"],
        DELO0402: ["DELO-0402"],
    }
},

UI = {
    loading: document.getElementById("officeGuideLoading"),
    stages: document.getElementById("stages"),
    pages: document.getElementsByClassName("grid"),
    setPage: document.getElementsByClassName("setPage"),
    pageHoverpop: document.getElementById("pageHoverpop"),
    itemsContainer: document.getElementById("items"),
    items: document.getElementsByClassName("selectItem"),
    pageIndicator: document.getElementById("pageIndicator"),
    progressButton: document.getElementById("progressButton")
}

//------------------------------------------------------------------------------

class DeltacoOfficeGuide {

    constructor(wrapper) { 
        this.elem = document.querySelector(wrapper);
        
        // Session based variables
        this.enviroment = {
            initialized: false, // True when class is initialized
            loggedIn: true,
            prompted: {
                pageIndicator: false,
                featuredProducts: false
            },
            currentPage: 0, // Product gallery (viewfinder)
            bulk: true, // openCheckout() use this to track bulk checkbox status
            popup: {
                container: null, // HTMLCollection of popup wrapper when guide is initialized
                content: null, // HTMLCollection of popup contents when guide is initialized
                HTML: "<div class='closePopup'><div></div><div></div></div>" // Universal popup HTML
            }
        }
    
    }

    static version() { return "1.2.1"; }

    // Translate office guide product numbers to their hyphen-equivalent
    static translate(product,all) {
        if(all) {
            return products.translate[product];
        }

        return products.translate[product][0];
    }

    // Copy the amount entered in bulk to each individual product
    static mirrorBulkAmount() {
        const elements = document.querySelectorAll(".amount"); // Get all input fields (parents)

        // Start loop at 1 to neglect first input field (which would be bulk "true/false")
        for(let i = 1; i < elements.length; i++) {
            elements[i].children[0].value = elements[0].children[0].value;
        }
    }

    // Set persistant storage (save changes if user leaves)
    save() { 
        window.localStorage.setItem("officeGuideSavedConfiguration", JSON.stringify(configuration)); 
    }

    // Set or reset product compatabilites
    setCompatibility(product,action) {
        const incompatibleProducts = products.incompatible[product];

        // If configuration contains a product which enables the fourth page
        configuration.meta.pageFour = configuration.products.some(item => products.enableFourth.indexOf(item) >= 0);
        
        // Check if there are any products in configuration that should enable the fourth page
        UI.stages.children[3].classList.add("disabled");
        if(configuration.meta.pageFour) { 
            UI.stages.children[3].classList.remove("disabled"); 
        }

        // If product is not listed under incompatible products
        if(!incompatibleProducts) { return false; }

        // Loop over each product in array
        for(let i = 0; i < incompatibleProducts.length; i++) {
            const incompatibleProduct = incompatibleProducts[i]; // Current product

            // Set or reset incompatible products
            if(action == "set") { 
                this.removeItem(incompatibleProduct); 
            } else if(action == "restore") { 
                products.list[incompatibleProduct][1].classList.remove("incompatible"); 
            }
        }
    }

    // Add item to the configuration object
    addItem(item,noSave) {
        const product = products.list[item];
        if(!product) { 
            return false; 
        }

        // Highlight in product finder
        product[0].classList.add("active"); // Add to preview
        if(product[1]) { 
            product[1].classList.add("active"); 
        }

        // Add to configuration if not present
        if(!configuration.products.includes(item)) { 
            configuration.products.push(item); 
            this.setCompatibility(item,"set"); 
        }

        if(!noSave) { 
            this.save(); 
        }
    }

    // Remove item from the configuration object
    removeItem(item) {
        const product = products.list[item];

        product[0].classList.remove("active"); // Remove from preview

        // Remove highlight from product finder
        if(product[1]) { 
            product[1].classList.remove("active"); 
        }

        // Remove from configuration if present
        const index = configuration.products.indexOf(item);
        if(index > -1) { 
            configuration.products.splice(index, 1); 
            this.setCompatibility(item,"restore"); 
        }

        this.save();
    }

    // Set the active page
    setPage(direction) {
        // Open the "More products" speech bubble
        function showHoverpop() {
            UI.pageHoverpop.classList.add("active");
            setTimeout(() => UI.pageHoverpop.classList.add("hovering"),400);
        }

        // UI Helper functions
        function enableButton(button) { 
            UI.setPage[button].classList.add("active"); 
        }
        function disableButton(button) { 
            UI.setPage[button].classList.remove("active"); 
        }

        // Set current page, reset to page one if direction is not specified
        if(direction == "next" && this.enviroment.currentPage < 3) { 
            this.enviroment.currentPage += 1;
            this.enviroment.prompted.pageIndicator = true;
        } else if(direction == "prev" && this.enviroment.currentPage > 0) { 
            this.enviroment.currentPage -= 1; 
        } else { 
            this.enviroment.currentPage = 0; 
        }

        // Reset page arrows
        disableButton(0); 
        disableButton(1);

        UI.pageHoverpop.classList = "";

        const offset = UI.itemsContainer.children[this.enviroment.currentPage].offsetLeft; // Get the left offset in pixels for the requested page
        const length = Math.ceil(products.stages[configuration.meta.currentStage].length / 4); // Get the total amount of products for the current stage
        let visible = (this.enviroment.currentPage + 1); // Add one to the current page and multiply by four

        // Show back button (prev) on all pages except first
        if(this.enviroment.currentPage > 0) { 
            enableButton(0); 
        }
        // Show next button if products visible is less than total
        if(visible < length) {   
            if(!this.enviroment.prompted.pageIndicator) { showHoverpop(); }
            enableButton(1); 
        }

        if(visible > length) { visible = length; } // Update visible variable if a page has <4 products

        UI.itemsContainer.style.transform = `translate(-${offset}px)`; // Transition to the requested page
        UI.pageIndicator.innerText = `${visible}/${length}`; // Update the page indicator text
        UI.itemsContainer.classList = `container page${this.enviroment.currentPage}`;
    }

    // Open summary of configuration in a popup dialog
    openSummary() {
        this.enviroment.popup.container.classList.add("active");

        // Abort if configuration is empty
        if(configuration.products.length == 0) { 
            this.enviroment.popup.content.innerHTML = this.enviroment.popup.HTML + "<h1>Error</h1><p>You haven't selected any products</p>"; 
            return false; 
        }

        // Remove all fourth page products if no fourth page enabler is in configuration
        if(!configuration.products.some(item => products.enableFourth.indexOf(item) >= 0)) {
            const stageFourProducts = products.stages[4]; // Get array of fourth stage products

            for(let i = 0; i < stageFourProducts.length; i++) { 
                this.removeItem(stageFourProducts[i]); 
            }
        }

        // All the innerHTML will be concatenated with this variable
        let summary = "<h1>Summary</h1>";

        // Wrapper for summary list
        summary += "<div class='options'><div class='check checked'><div><svg version='1.1' viewBox='0 0 48 48' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><polygon points='16,41.1 1.3,26.4 2.7,24.9 16,38.2 45.3,8.9 46.7,10.4  '/></g></svg></div></div><p>Buy your configuration in bulk</p><div class='amount bulk'><input id='bulkQuantity' type='number' value='1'></div></div><div class='summary'><div class='content'>";

        // List each product in the configuration
        for(let i = 0; i < configuration.products.length; i++) {
            const product = configuration.products[i],
                  multipack = DeltacoOfficeGuide.translate(product,true);
            
            let multipackText = "";

            // If product has multi-pack dependencies
            if(multipack.length > 1) {
                multipackText = "+ " + multipack[1];
            }

            summary += `<div class='item ${product}'>
                <div class='thumb'></div>
                <h2>${DeltacoOfficeGuide.translate(product)}<br><span>${multipackText}</span></h2>
                <div class='amount'>
                    <input type='number' value='1' class='${product}'>
                </div>
            </div>`;

        }

        // Close the wrapper and add the checkout button
        summary += "</div></div><p class='checkout msax-expresscart-addbutton msax-CommandAddToCart'>Add to cart</p></div>";

        // Set default state of bulk checkbox (true)
        this.enviroment.popup.content.classList.add("bulk");

        // Append all innerHTML to popup inner container
        this.enviroment.popup.content.innerHTML = this.enviroment.popup.HTML + summary;
    }

    // Set the active stage
    /*
    * 1: Desktops
    * 2: Ergonomics
    * 3: Accessories
    * 4: Additonal Accessories
    * 5: Summary
    */
    setStage(stage) {
        stage = stage || 1; // Go to stage or return to stage 1 if not specified

        // Open checkout after stage three if stage four is not available
        if(stage == 4 && !configuration.meta.pageFour) { this.openSummary(); return false; }

        // Get all items for each stage
        for(let i = 0; i < UI.items.length; i++) {
            let output = ""; // Prepare a variable for later population with CSS classes

            const item = UI.items[i]; // Current item (HTML element)
            const product = products.stages[stage][i]; // Current product
            output = product; // Set output to product numvber

            // Disable remaining squares if we're out of products
            if(!product) { 
                output = "disabled"; 
            }

            // Restore selected products from either a stage change or saved session
            if(configuration.products.includes(product)) { 
                output = output + " active"; 
                this.setCompatibility(product,"set"); 
            }

            item.classList = "selectItem " + output; // Set CSS classes for current item
        }

        // Set the new stage
        configuration.meta.currentStage = stage;

        // Change stage in the UI
        UI.stages.classList = [`stage${stage}`];

        // Reset page to 0
        this.setPage();
    }

    // Get unsaved changes from localStorage
    loadConfiguration() {
        // Don't run if guide has already been loaded
        if(this.enviroment.initialized) { 
            console.warn("Configuration has already been loaded"); 
            return false;
        }

        // Get saved configuration
        let local = window.localStorage.getItem("officeGuideSavedConfiguration");
        if(!local) { 
            return false; 
        }

        // Parse JSON string from localStorage
        local = JSON.parse(local);

        configuration.meta.pageFour = local.meta.pageFour; // True when a fourth stage enabling product is in configuration

        // Get products from object and add to current configuration
        local.products.forEach(product => {
            // Don't add products from removeOnLoad
            if(products.removeOnLoad.includes(product)) { 
                return; 
            }

            // Call addItems with "noSave" to prevent write loop
            configuration.products.push(product);
            this.addItem(product,true);
        });

        // Check if there are any products in configuration that enable the fourth page
        UI.stages.children[3].classList.add("disabled");
        if(configuration.meta.pageFour) { 
            UI.stages.children[3].classList.remove("disabled"); 
        }

        // Set last opened stage
        let currentStage = local.meta.currentStage;

        // Default to first stage if product list is empty
        if(configuration.products.length == 0) { 
            currentStage = 1;
        }

        guide.setStage(currentStage);
        this.enviroment.initialized = true;
    }

    // Reset the whole configurator, starting from scratch
    reset() {
        // Remove viewfinder active state from every product
        for(let key in products.list) {
            const cursor = products.list[key];

            for(let i = 0; i < cursor.length; i++) {
                cursor[i].classList.remove("active");
            }
        }

        // Disable page four
        UI.stages.children[3].classList.add("disabled");
        configuration.meta.pageFour = false;

        // Clear configuration and persistant storage
        window.localStorage.removeItem("officeGuideSavedConfiguration");
        configuration.products = [];

        // Return to stage 1
        this.setStage(1);
    }

    // Initialize the guide
    init() {
        if(this.enviroment.initialized) { 
            console.warn("Configuration has already been loaded"); 
            return false; 
        }

        this.setStage();
        this.loadConfiguration();

        // == CREATE ELEMENTS FOR POPUP DIALOG ==

        // Create new nodes
        const node = document.createElement("div");
        const innerNode = document.createElement("div");

        node.setAttribute("id","windowContainer");
        node.classList = "closePopup";
        innerNode.classList = "inner";

        // Nest the innerNode and append to #workspace
        node.appendChild(innerNode);
        document.getElementsByTagName("body")[0].appendChild(node);

        // Make our new elements accesible by this class
        this.enviroment.popup.container = node;
        this.enviroment.popup.content = innerNode;

        // == END ==

        // Initialized
        setTimeout(() => { 
            guide.elem.classList.remove("hidden"); 
            UI.loading.classList.add("hidden"); 
        }, 1000);

        this.enviroment.initialized = true;
    }
}

//------------------------------------------------------------------------------

function addToCart() {
    if(configuration.products.length < 1) { 
        return false; 
    }

    let message = {
        type: "cart",
        payload: {}
    };

    // Populate <textarea> with item numbers and quantity
	for (let i = 0; i < configuration.products.length; i++) {
        const product = configuration.products[i], // Current product
              multipack = DeltacoOfficeGuide.translate(product,true);
        
        let quantity = 1, // Default quantity
            quantityElement;
        
		// Get the last element from the HTMLCollection of the current product
        if(guide.enviroment.bulk) { 
            quantityElement = document.getElementById("bulkQuantity");
        } else {
            quantityElement = products.list[product].item(products.list[product].length - 1);
        }
        
		// If the element is an input field (expecting input=type["number"])
		if (quantityElement.nodeName === "INPUT") {
			quantity = quantityElement.value;
        }
        
		if (quantity < 1) {
			continue;
        }

        // Add multi-pack dependencies if they exist
        if(multipack.length > 1) {
            multipack.forEach(item => {
                message.payload[item] = quantity;
            });
        }
        
        // Returns [itemnumber]#[quantity]\n
        message.payload[DeltacoOfficeGuide.translate(product)] = quantity;
    }

    guide.reset();
    window.parent.postMessage(message,"*");
}

// Handles all click events
function eventHandler(evt) {
    const target = evt.target.classList[0];

    switch(target) {
        // Product gallery (viewfinder) product has been clicked
        case "selectItem":
            // Get the second class of the target, This would be the item number (DELO0150 etc.)
            const product = evt.target.classList[1];
            
            // Toggle add/remove on subsequent clicks
            if(configuration.products.includes(product)) { guide.removeItem(product); }
            else { guide.addItem(product); }

            break;

        // Change page
        case "setPage":
            const direction = evt.target.innerHTML; // Get the characters < or >

            // Go to next page
            if(direction == "&gt;") { 
                guide.setPage("next"); 
            }
            // Go to prev page
            else if(direction == "&lt;") { 
                guide.setPage("prev"); 
            }

            break;

        // Jump to stage
        case "setStage":
            // Get number from circle
            guide.setStage(evt.target.childNodes[0].innerText);

            break;
        
        // Proceed and confirm button
        case "progressButton":
            // Open summary if we've reached the last stage
            if(configuration.meta.currentStage >= 4) { 
                guide.openSummary(); 
                return false; 
            }

            // Add one to current stage
            guide.setStage(parseInt(configuration.meta.currentStage) + 1);

            break;

        // Close the popup dialog
        case "closePopup":
            guide.enviroment.popup.container.classList.remove("active");

            // Remove all innerHTML to prevent click events when popup is hidden
            guide.enviroment.popup.content.innerHTML = "";

            // Reset bulk checkout settings
            guide.enviroment.bulk = false;
            guide.enviroment.popup.content.classList.remove("bulk");

            break;

        // Bulk order checkbox
        case "check":
            evt.target.classList.toggle("checked"); // Toggle checkbox
            guide.enviroment.popup.content.classList.toggle("bulk"); // Toggle input fields

            // Mirror bulk amount to individual products
            DeltacoOfficeGuide.mirrorBulkAmount();

            guide.enviroment.bulk = !guide.enviroment.bulk;

            break;

        // Product order amount
        case "amount":
            const checkbox = document.querySelectorAll(".check")[0]; // Get bulk-order checkbox element

            if(evt.target.classList[1]) {
                // Is bulk order
                checkbox.classList.add("checked"); 
                guide.enviroment.popup.content.classList.add("bulk");
                guide.enviroment.bulk = true;
            } else {
                // Is not bulk order
                checkbox.classList.remove("checked"); 
                guide.enviroment.popup.content.classList.remove("bulk");
                guide.enviroment.bulk = false;

                // Mirror bulk value to all products in configuration
                DeltacoOfficeGuide.mirrorBulkAmount();
            }

            evt.target.focus();

            break;

        // Add configuration to shopping cart
        case "checkout":
            // Helper function
            // Called when configuration has been added to cart
            function addedToCart() {
                guide.enviroment.popup.content.innerHTML = guide.enviroment.popup.HTML + `<h1>Thank you</h1><p>Please tell us about your experience using the configurator.</p><div class='modalOptions'><a target="_blank" href="https://forms.gle/Y9A4H4C9zry4VSbq6"><p>Take a short survey</p></a>`;
            }
            
            // == ADD TO CART ==

            const button = document.querySelectorAll("#windowContainer .checkout")[0];

            addToCart();

            // Disable the configurator while adding products to cart
            button.innerText = "Adding to cart...";
            button.classList.add("disabled");
            guide.elem.classList.add("disabled");

            setTimeout(() => {
                button.innerText = "(Try again) Add to cart";
                button.classList.remove("disabled");
                addedToCart();
            },2500);

            // == END ==

            break;

        case "addToCart":
            const itemnr = evt.target.classList[1];

            evt.target.innerText = "Added to Cart";
            evt.target.classList.add("disabled");

            if(!configuration.products.includes(itemnr)) { 
                configuration.products.push(itemnr); 
            }

            break;

    }
}

//------------------------------------------------------------------------------

// Deltaco Office Guide
const guide = new DeltacoOfficeGuide("#officeGuide");
guide.init();

// Send all click events to the eventHandler
document.addEventListener("click", evt => eventHandler(evt));