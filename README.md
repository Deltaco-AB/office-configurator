# DELTACO OFFICE Configurator
Workstation configurator for the DELTACO OFFICE product lineup.

[Try the OFFICE Configurator live](https://www.deltaco.se/Sidor/office-configurator.aspx)

## Get started

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
3. Replace `// ...` with code to handle the shopping cart process on your website.<br>See: [Payload Semantics](#payload-semantics)

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

User has submitted their configuration. This event lists all products and quantities added to the shopping cart.

The `payload` object  contains a key-value pair with the `quantity` as value, and `ItemID` as key.

<br>

*Example `event.data` :*
```json
{
  "type": "cart",
  "payload": {
    "DELO-0100": 10,
    "DELO-0157": 5,
    "DELO-0203": 6
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
User added 10 of 'DELO-0100' to their shopping cart.
User added 5 of 'DELO-0157' to their shopping cart.
User added 6 of 'DELO-0203' to their shopping cart.
*/
```

## Contribute

Please report bugs and suggest enhancements under [Issues](https://github.com/Deltaco-AB/office-configurator/issues).

Pull requests to this repo are highly encouraged!
