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

# MessageEvent semantics

The configurator uses [`MessageEvents`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent) to communicate with its parent window and vice versa.

The arbitrary protocol for bidirectional messages consists of a JSON-encoded `type` and optional `payload` string.

```json
{
 "type": "foo",
 "payload": "bar"
}
```

#### Outputs
|`type`|Description|
|--|--|
|[`ready`](#event-type-ready)|The configurator is ready to accept messages|
|[`cart`](#event-type-cart)|User-submitted configuration|
|[`addedProduct`](#event-type-addedproduct)|Product has been added to configuration|
|[`removedProduct`](#event-type-removedproduct)|Product has been removed from configuration|

#### Inputs
|`type`|Description|
|--|--|
|[`config`](#event-type-config)|Serlialized custom `config.json`|

## Event type: `ready`

Dispatched when the configurator has loaded all necessary assets to accept [incomming messages](#inputs)

This event should be listened for if you intend to use a [Filtered configurator](#filtered-configurator)

```js
{
 type: "ready",
 payload: null
}
```

## Event type: `cart`

Dispatched by the configurator when the user has added their configuration to the shopping cart.

```js
{
 type: "cart",
 payload: {
  // EAN-13 code : quantity
  7333048043504: 1,
  7333048043528: 4,
  7333048043610: 1
 }
}
```

## Event type: `addedProduct`

Dispatched by the configurator when a product is added to the configuration. This includes all instances where a product is added, not necessarily a direct user triggered action (multipacked- and featured products etc.)

```js
{
 type: "addedProduct",
 payload: "7333048043504" // EAN-13 code
}
```

## Event type: `removedProduct`

Dispatched by the configurator when a product is removed from the configuration. This includes all instances where a product is removed, not necessarily a direct user triggered action (multipacked- and featured products etc.)

```js
{
 type: "removedProduct",
 payload: "7333048043504" // EAN-13 code
}
```

## Event type: `config`

Dispatched by the parent window to initialize the configurator with a custom [`config.json`](#filtered-configurator).

Example using [`postMessage(message, transferLis)`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage):
```js
const config = '{
 "type": "config",
 "payload": "..." // config.json 
}';

const frame = contentWindow; // Configurator frame*

frame.postMessage(config,frame.origin);
```

\* See: [`HTMLIFrameElement.contentWindow`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow)

# Compatability

It's possible to upgrade from version 1.3 to 2.0 without making any major changes to your existing code. You need to filter out any `event.data.type` that isn't `cart` - as that's the only MessageEvent implemented in 1.3.

If you didn't modify the `if` statement when implementing 1.3 from the [1.3 README](https://github.com/Deltaco-AB/office-configurator/blob/1c95d8a241271d209acbf3514c1a2018d7369f17/README.md); you already have this check in place.
```js
if(event.origin !== "https://app.cloud.deltaco.eu" || event.data.type != "cart") {
 return;
}
```

#### Endpoint:
To ensure backwards compatability, the base path will remain on version 1.3 until EOL @ **01/Jan/2022**

|URL path|Version|
|--|--|
|`/office-configurator/`|1.3|
|`/office-configurator/v1/`|1.3|
|`/office-configurator/v1.3/`|1.3|
|`/office-configurator/v2/`|2.0|
|`/office-configurator/v2.0/`|2.0|

# License

Deltaco-AB/office-configurator is licensed under the [MIT License](https://github.com/Deltaco-AB/office-configurator/blob/master/LICENSE).

# Report issues & suggest features

Please report bugs and suggest new features by creating an [Issue](https://github.com/Deltaco-AB/office-configurator/issues)
