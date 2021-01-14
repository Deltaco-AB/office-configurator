// Quality of Life - Monkey-functions

// Return the length of a number, string, array or object
export function len(value) {
	return Object.keys(value).length || value.length || value;
}

// Test if number, array or object length is within range
export function range(value,min,max = min) {
	if(value === undefined || min === undefined) {
		console.warn("Received invalid values",[value,min,max]);
		return false;
	}
	value = Object.keys(value).length || value;
	min = Object.keys(min).length || min;
	max = Object.keys(max).length || max;
	
	if(value < min || value > max) { return false; }
	return true;
}

// Typecast strict truthiness to boolean
export function coercive(value) {
	switch(value) {
		case true: case 1: case "true": case "1": case "yes": return true;
		default: return false;
	}
}

// Clean element subtree
export function removeChildren(element) {
	while(element.firstChild) {
		element.removeChild(element.lastChild);
	}
}

export function isActive(element) {
	if(element.classList.contains("active")) {
		return true;
	}
	return false;
}