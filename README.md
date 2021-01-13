# DELTACO OFFICE Configurator
Workstation configurator for the DELTACO OFFICE product lineup.

![Screenshot](https://i.imgur.com/5h5IyjH.png)
### [Try the configurator live](https://www.deltaco.se/Sidor/office-configurator.aspx)

[Refer to the wiki](#) if you wish to use this configurator with your own products.

## Basic configurator

Default configuraton. The whole DELTACO OFFICE product lineup available in this configurator will be imported, and you would have to add your own measures to avoid products not available on your webshop from being added to your user's shopping cart.

---

1. Embed the configurator on your webshop within an `<iframe>`.
```html
 <iframe id="officeConfigurator" style="width:1200px;height:800px" src="https://app.cloud.deltaco.eu/office-configurator/v2/"></iframe>
```
2. A [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent) is dispatched to `window.parent` when the user submits their configuraton.
Append the EventListener snippet as close to your closing `</body>` tag as possible.
```html
<script>
  window.addEventListener("message", (event) => {
    if(event.origin !== "https://app.cloud.deltaco.eu" || event.data.type != "cart") {
      return;
    }

    // ...
  },false);
</script>
```
3. Replace `// ...` with code to handle the shopping cart flow on your webshop. See [`event.data.type = "cart"`](#) for message content semantics.

## Filtered configurator

Hide products not available on your webshop.

---

1. Follow all steps from the [basic implementation](#basic-configurator)
2. Append the `awaitConfig=true` search parameter to the configurator URL
```html
 <iframe id="officeConfigurator" style="width:1200px;height:800px" src="https://app.cloud.deltaco.eu/office-configurator/v2/?awaitConfig=true"></iframe>
```
_The configurator won't initialize until you provide it with a custom config._

3. Download a copy of the default `config.json` from [GitHub](https://github.com/Deltaco-AB/office-configurator/blob/develop/2.0.0/public/config.json) or [DELTACO Cloud](https://app.cloud.deltaco.eu/office-configurator/v2/config.json)
4. Locate a product you wish to hide, and replace its `category` value with `0` to make it inactive.

_Example:_
```json
"DELO-0151": {
  "category": 0,
  "incompatible": [],
  "add": [],
  "flags": {}
}
```

5. Submit your modified config using [`Window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) when the frame has loaded.

The configurator dispatches a [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent) with [`event.data.type = "ready"`](#) when it's ready to accept a config.
```js
window.addEventListener("message", (event) => {
  if(event.origin !== "https://app.cloud.deltaco.eu" || event.data.type != "ready") {
    return;
  }
  
  const frame = document.getElementById("officeConfigurator").contentWindow;

  frame.postMessage({
    type: "config",
    payload: config // Your config.json
  },frame.origin);
},false);
```

6. The configurator will initialize using your config when the message is received. This catches up on step 2 from the [basic implementation](#basic-configurator)

---

#### Example

Sample script that submits a custom `config.json` (represented as "officeConfigurator.json") from an URL to the configurator and prints the user's summary when a configuration is submitted.

```js
window.addEventListener("message",event => {
  switch(event.data.type) {
      // Fetch custom config.json and send it to configurator
      case "ready":
          const frame = document.getElementById("configurator").contentWindow;

          fetch("https://example.com/content/officeConfigurator.json").then(response => response.text()).then(config => {
              frame.postMessage({
                  type: "config",
                  payload: config
              },frame.origin);
          });
          break;

      // Log configuration summary to parent console
      case "cart":
          for(const [product,quantity] of Object.entries(event.data.payload)) {
              console.log(`User added ${quantity} of '${product}' to their shopping cart.`);
          }
          break;

      default: console.log(event.data); break;
  }
},false);
```

## Login state 

Make the configurator display a message if the user isn't logged in on your webshop.

---

1. Append the `loggedIn=true` search parameter to the configurator URL
```html
 <iframe id="officeConfigurator" style="width:1200px;height:800px" src="https://app.cloud.deltaco.eu/office-configurator/v2/?loggedIn=true"></iframe>
```
2. Flip the value when the login state changes to toggle the message.
