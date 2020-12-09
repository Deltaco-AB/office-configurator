# DELTACO OFFICE Configurator
Workstation configurator for the DELTACO OFFICE product lineup.

[Try the OFFICE Configurator live](https://www.deltaco.se/Sidor/office-configurator.aspx)

**This is a port of the configurator built for deltaco.se.**<br>Critical features absent from this version (1.3-alpha) are:
| Feature | Description |
|--|--|
| Check if user is logged in | A "logged in flag" check is not performed in this version of the configurator.<br><br>**Suggested solution:** Prompting users to log in before the configurator is shown if your webshop requires it.
| Check product availability | The configurator does not check whether a product exist in your catalogue and will happily add it.<br><br>**Suggested solution:** A comparison between the `payload` received from the configurator and a reference sheet on your webshop.

A refactor of the configurator with these- and additional features intended for third-party embedding is under development.

## Get Started

1. Embedd `https://app.cloud.deltaco.eu/office-configurator` in an `<iframe>` on your page:
```html
<iframe src="https://app.cloud.deltaco.eu/office-configurator"></iframe>
```
2. Append the [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent) listener snippet as close to the `</body>` tag on your page as possible:
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
3. Replace `// ...` with code to handle the shopping cart process on your webshop.<br>See: [Payload Semantics](#payload-semantics)

[Here's an example on deltaco.se](https://gist.github.com/VictorWesterlund/4b9273c8a3cdbc328bbf9d8c20c6b325)

## Payload Semantics

The configurator dispatches a [`postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) event to `window.parent` with a JSON-encoded object containing a message `type` and `payload`.
```javascript
{
  "type": "...", // String
  "payload": { ... } // Object
}
```

*The only OOTB implemented type as of version 1.3.0 is `"cart"`*

---

### Type: `cart`

User has submitted their configuration. This event lists all products (by EAN code) and quantities added to the shopping cart.

The `payload` object  contains a key-value pair with the `quantity` as value, and [`EAN-13 code`](https://en.wikipedia.org/wiki/International_Article_Number) as key.

<br>

*Example `event.data` :*
```json
{
  "type": "cart",
  "payload": {
    "7333048043450": 10,
    "7333048043535": 5,
    "7333048043672": 6
  }
}
```

*Example listener:*
```javascript
// Log each product to console

window.addEventListener("message", (event) => {
  if(event.origin !== "https://app.cloud.deltaco.eu" || event.data.type != "cart") {
    return;
  }
	
  // Get key-value pair from object
  for(const [product,quantity] of Object.entries(event.data.payload)) {
    console.log(`User added ${quantity} of '${product}' to their shopping cart.`);
  }
});

/* Example output:
User added 10 of '7333048043450' to their shopping cart.
User added 5 of '7333048043535' to their shopping cart.
User added 6 of '7333048043672' to their shopping cart.
*/
```

## Contribute

Please report bugs and suggest enhancements under [Issues](https://github.com/Deltaco-AB/office-configurator/issues).

Pull requests to this repo are highly encouraged!
