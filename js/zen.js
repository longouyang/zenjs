/*
zen.js - a library for browser-based behavioral experiments
version: 0.0.2
http://www.zenjs.org/

This library is separated into a number of different parts:
browser compatibility fixes
utility functions
presentation functions

TODO:
documentation system
jslint
*/

/* Browser compatibility fixes */

// document.getElementsByClassName fix for IE6
document.getElementsByClassName = document.getElementsByClassName || function (searchClass) {
        var classElements = new Array();
        var node = document;
        var tag = 'div';
        var els = node.getElementsByTagName('*');
        var elsLen = els.length;
        var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
        for (i = 0, j = 0; i < elsLen; i++) {
                if ( pattern.test(els[i].className) ) {
                        classElements[j] = els[i];
                        j++;
                }
        }
        return classElements;
}

if (!Object.prototype.hasOwnProperty) {
	Object.prototype.hasOwnProperty = function(p) {
		return this.constructor.prototype[p] === undefined;
	}
}

// Recursively checks for array equality
// TODO: can we write similar methods for hashes?
Object.prototype.equals = function(that) {
	if (!(that instanceof Object)) {
		throw new TypeError();
	}
	
	if (this.length != that.length)
		return false;
	
	if (this instanceof Array) {
		var i = this.length;
		while(i--) {
			if (this[i] instanceof Object) {
				if (!(that[i] instanceof Object)) 
					return false;

				if (!(this[i].equals(that[i])))
					return false;
			} else {
				if (!(this[i] === that[i])) return false;
			}
		}
	}
	if (this instanceof Object) {
		for(var i in this) {
			if (!this.hasOwnProperty(i)) {
				continue;
			}
			if (this[i] instanceof Object) {
				if (!(that[i] instanceof Object)) 
					return false;

				if (!(this[i].equals(that[i])))
					return false;
			} else {
				if (!(this[i] === that[i])) return false;
			}
		}
	}
	
	return true;
}

// Define indexOf for browsers that don't implement it correctly (IE6, 7)
if(!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]===obj){
				return i;
			}
		}
		return -1;
	}
}

// Define the map pattern if the browser's Javascript implementation doesn't
// have it.
if (!Array.prototype.map) {
  Array.prototype.map = function(fun /*, thisp*/) {
    var len = this.length >>> 0;
    if (typeof fun != "function") { throw new TypeError(); }

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
 	}

    return res;
  };
}

// Define the reduce pattern if the browser's Javascript implementation
// doesn't have it.
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(fun /*, initial*/) {
    var len = this.length >>> 0;
    if (typeof fun != "function") { throw new TypeError(); }

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1) { throw new TypeError(); }

    var i = 0;
    if (arguments.length >= 2) {
      var rv = arguments[1];
    } else {
      do {
        if (i in this) {
          rv = this[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len) { throw new TypeError(); }
      } while (true);
    }

    for (; i < len; i++) {
      if (i in this) { rv = fun.call(null, rv, this[i], i, this); }
    }

    return rv;
  };
}

// Define the filter pattern
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/) {
    var len = this.length >>> 0;
    if (typeof fun != "function") { throw new TypeError(); }

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this) {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

Array.prototype.invoke = function(fun) {
	var len = this.length >>> 0;
	if (typeof fun != "function") { throw new TypeError(); }
	
	var thisp = arguments[1];
	var res = [];
	for(var i=0; i < len; i++) {
		if (i in this) {
			res.push(fun.call(thisp,this[i]));
		}
	}
	return res;
}

/* Utility functions */

Array.prototype.sum = function() {
	var i = this.length;
	var s=0;
	while(i--) {
		s += this[i];
	}
	return s;
}

Array.prototype.average = function() {
	if (!this.length) return null;
	return this.sum()/this.length;
}

Array.prototype.unique = function () {
	var r=this.concat(), n = this.length;
	for(var i=0;i<n;i++) {
		for(var j=i+1;j<n;j++) {
			if (r[i]===r[j]) {
				r.splice(j--,1);
				n--;
			}
		}
	}
	return r;
}

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

// TODO: generalize?
Array.prototype.pluck = function(key) {
	var a = [];
	for(var i=0,length=this.length;i<length;i++) {
		a.push(this[i][key]);
	}
	return a;
}

// Uses the Fisher-Yates algorithm.
// Source - http://snippets.dzone.com/posts/show/849
Array.prototype.shuffle = function(){
	for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x) {}
}

// Flip an n-sided coin. Returns numbers in 0..n-1
// By default, n=2
function coinFlip(n) {
	n = n || 2;
	return Math.floor(Math.random()*n);
}

// range from m to n
function range(m,n) {
	a = [];
	for(var i=m;i<=n;i++) {
		a.push(i);
	}
	return a;
}

// return the cartesian product of arrays A and B
function cartesianProduct(a,b) {
	var c = [];
	var a_len=a.length,b_len=b.length;
	for(var i=0;i<a_len;i++) {
		for(var j=0;j<b_len;j++) {
			c.push([a[i],b[j]]);
		}
	}
	return c;
}

// DOM element lookup with caching
zen.elements = {};
function $$$(id) { 
	if (!zen.elements[id]) 
		zen.elements[id] = document.getElementById(id);
	return zen.elements[id];
}

// Show slide with id and hide the rest
// Optimizations - it skips DOM elements that already have the
// right visibility value set
function showSlide(id) {
	if (!zen.slides) {
		zen.slides = document.getElementsByClassName("slide");
	}
	var change_to, slides = zen.slides;
	var i = zen.slides.length;
	
	while(i--) {
		change_to = (slides[i].id == id ? 'block' : 'none');
 		if (slides[i].style.display == change_to) continue;
		slides[i].style.display = change_to;
	}
}

Number.prototype.isPositive = function() {
	return (this > 0);
}

Number.prototype.isNatural = function() {
	return (this % 1 == 0) && (this > 0);
}

Number.prototype.isInteger = function() {
	return (this % 1 == 0);
}

Number.prototype.round = function(places) {
	if (typeof places === "undefined") { places = 0; }
	if (!(typeof places === "number") || !((places+1).isNatural())) {
		throw new TypeError();
	}
	var m = Math.pow(10, places)
	return Math.round(this * m) / m;
}

// Convert degrees to centimeters
// Assumes a default viewing distance of 2 feet
function degreesToCentimeters(degrees, viewingDistance) {
	viewingDistance = viewingDistance || 60.69; // 2 feet;
	return 2 * viewingDistance * Math.tan(degrees * Math.PI / 360);
}

// Convert centimeters to degrees
// Assumes a default viewing distance of 2 feet
function centimetersToDegrees(centimeters, viewingDistance) {
	viewingDistance = viewingDistance || 60.69;
	return 2 * Math.atan2(centimeters, 2* viewingDistance) * 180 / Math.PI;
}

// Getting user input

// TODO: is this performant enough?
function getKeyboardInput(accepted_responses, state, callback, duration) {
	var start_time = (new Date()).getTime();
	var end_time;
	
	// monitor for keypresses
	document.onkeydown = function(e) {
		end_time = (new Date()).getTime();
		var value = response_value(window.event ? event.keyCode : e.keyCode);
		// ignore keys pressed not in accepted_responses
		// e.g. if user accidentally pressed another key
		if (accepted_responses.contains(value)) {
			var user_input = {'response': value, 'rt': end_time - start_time};
			callback(state, user_input);
		}
	}
	
	if (duration) setTimeout("document.onkeydown = null;", duration);
}

// TODO: encapsulate in zen.keys

var keyCodes = {
	enter: 13,
	escape: 27,
	space: 32,
	left: 37,
	up: 38,
	right: 39,
	down: 40
};

function keyValue(e) {
	var code = (window.event) ? event.keyCode : e.keyCode;
	
	if ([keyCodes.enter, keyCodes.escape, keyCodes.space, keyCodes.left,
		 keyCodes.up, keyCodes.right, keyCodes.down].contains(code))
		return code;

	// numbers
	if (code > 47 && code < 58 ) return code - 48;
	// numpad
	if (code > 95 && code < 106) return code - 96;
	// characters - doing "abcdef..."[] doesn't work in IE
	if (code > 64 && code < 91) return ("abcdefghijklmnopqrstuvwxyz".split(""))[code-65];
	return 0;
}

function disableKeyboard() {
	document.onkeydown = null;
}

zen.timeouts = [];

function chain() {
	// accept a single array as the argument
	if (arguments.length == 1 && isArray(arguments[0])) arguments = arguments[0]; 
	
	// require an odd number of arguments
	if (arguments.length % 2 == 0) return;
	
	// execute the first argument immediately
	arguments[0]();
	
	var len = arguments.length;
	// uses arguments.length b/c different browsers are weird with "for var i in arguments"
	for(var i=2, execute_time=arguments[i-1]; i<len ; i+=2, execute_time += arguments[i-1]) {
		zen.timeouts.push(setTimeout(arguments[i], execute_time));
	}
}

function clearChain() {
	for(var i=0;i<zen.timeouts.length;i++)
		clearTimeout(zen.timeouts[i]);
}

// Preload images sequentially (trickle), rather than all at once (torrent).
// This is actually slower on faster computers, but it's guaranteed to work
// on slower computers.

// TODO: concurrency
function preload(names, id, callback) {
	var name = names.shift();
	if (!name) {
		callback();
		return;
	}
	var image = new Image();
	image.onload = function() { 
		$$$(id).innerHTML = parseInt($$$(id).innerHTML) + 1;
		setTimeout(function() {preload(names,id,callback) }, 0);
	};
	image.src = name;
}


// Cookie functions. Taken from PPK
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

var zen = {
	params: url.split("&").reduce(
		function(cumulative,current) {
			cumulative[current.split("=")[0]] = current.split("=")[1];
			return cumulative;
		}
	,{})
};