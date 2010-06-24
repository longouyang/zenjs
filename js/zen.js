/*
zen.js - a library for browser-based behavioral experiments
version: 0.0.2
http://www.zenjs.org/

This library is separated into a number of different parts:
browser compatibility fixes
utility functions
presentation functions

TODO:
camelCase
unit testing
documentation system
jslint
restyle MDC code
*/

var zen = {};

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

// Define indexOf for browsers that don't implement it correctly (IE6, 7)
if(!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
}

// Define the map pattern if the browser's Javascript implementation doesn't
// have it.
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/) {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

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
  Array.prototype.reduce = function(fun /*, initial*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var i = 0;
    if (arguments.length >= 2)
    {
      var rv = arguments[1];
    }
    else
    {
      do
      {
        if (i in this)
        {
          rv = this[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len)
          throw new TypeError();
      }
      while (true);
    }

    for (; i < len; i++)
    {
      if (i in this)
        rv = fun.call(null, rv, this[i], i, this);
    }

    return rv;
  };
}

// Define the filter pattern
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };
}

// Deploy homebrew JSON implementation only if the browser doesn't implement
// Object.prototype.hasOwnProperty (Safari 2). Otherwise, we should use
// Crockford's JSON implementation.

var JSON;

if (!Object.prototype.hasOwnProperty)
{

JSON = {};

// implement JSON.stringify serialization
JSON.stringify = function (obj) {

	var t = typeof (obj);
	if (t != "object" || obj === null) {

		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return (t == "function") ? "" : String(obj);

	}
	else {

		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);

		for (n in obj) {
			//document.write(n);
			v = obj[n]; t = typeof(v);

			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);

			if (t != "function") json.push((arr ? "" : '"' + n + '":') + String(v));
		}

		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

// implement JSON.parse de-serialization
JSON.parse = function (str) {
	if (str === "") str = '""';
	eval("var p=" + str + ";");
	return p;
};
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
	if (!this.length) return 0;
	return this.sum()/this.length;
}

Array.prototype.unique = function () {
	var r=this.concat(), n = this.length;
	for(var i=0;i<n;i++) {
		for(var j=i+1;j<n;j++) {
			if (r[i]==r[j]) {
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
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
	return o;
}

// Flip an n-sided coin. Returns numbers in 0..n-1
// By default, n=2
function coinFlip(n) {
	if (!n)
	return Math.floor(Math.random()*(n+1));
}

// range from m to n
function range(m,n) {
	a = [];
	for(var i=m;i<=n;i++) {
		a.push(i);
	}
	return a;
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

// Checking data
function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  if (!exp) {
	alert('Error: ' + message + '. Please let the experimenter know about this error.');
    throw new AssertException(message);
  }
}

function isArray(obj) {
	return obj.constructor == Array;
}

function isArrayOf(cl,obj) {
	if (obj.constructor != Array) return false;
	for(i in obj) {
		if (obj[i].constructor != cl) return false;
	}
	return true;
}

function isPositiveNumber(x) {
	return (typeof x ==='number') && (x > 0);
}

function isNaturalNumber(x) {
	return (typeof x === 'number') && (x % 1 == 0) && (x > 0);
}

// Getting user input

function get_keyboard_input(accepted_responses, state, callback, duration) {
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
var enter = 13;
var escape = 27;
var space = 32;
var left = 37;
var up = 38;
var right = 39;
var down = 40;

function keyValue(key_code) {
	if ([enter, escape, space, left, up, right, down].contains(key_code)) return key_code;
	// numbers
	if (key_code > 47 && key_code < 58 ) return key_code - 48;
	// numpad
	if (key_code > 95 && key_code < 106) return key_code - 96;
	// characters - doing "abcdef..."[] doesn't work in IE
	if (key_code > 64 && key_code < 91) return ("abcdefghijklmnopqrstuvwxyz".split(""))[key_code-65];
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
		setTimeout(function() {preload_trickle(names,id,callback) }, 0);
	};
	image.src = name;
}

// TODO: embed Crockford's JSON?