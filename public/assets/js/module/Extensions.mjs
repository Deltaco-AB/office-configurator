// Dispatch a message event to parent window
export function message(type,payload = null) {
	if(payload) {
		payload = `,"payload":"${payload}"`;
	}
	window.parent.postMessage(`{"type":"${type}"${payload}}`,window.parent.origin);
}

export class QoL {

	// Return the length of a number, string, array or object
	static len(value) {
		return Object.keys(value).length || value.length || value;
	}

	// Test if number, array or object length is within range
	static range(value,min,max = min) {
		value = Object.keys(value).length || value;
		min = Object.keys(min).length || min;
		max = Object.keys(max).length || max;
		
		if(value < min || value > max) { return false; }
		return true;
	}

	// Typecast truthiness to boolean
	static coercive(value) {
		switch(value) {
			case true: case 1: case "true": case "1": case "yes": return true;
			default: return false;
		}
	}

	// Clean element subtree
	static removeChildren(element) {
		while(element.firstChild) {
			element.removeChild(element.lastChild);
		}
	}

	static isActive(element) {
		if(element.classList.contains("active")) {
			return true;
		}
		return false;
	}

}