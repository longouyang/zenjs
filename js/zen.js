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

if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
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

Array.prototype.sd = function() {
	var avg = this.average();
	var subSum = this.reduce(function(run,cur) { 
		var val = cur-avg;
		return run+val*val;
	}, 0);
	return Math.sqrt(1/(this.length - 1) * subSum);
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

Array.prototype.partition = function(f) {
	if (!(typeof f == "function")) {
		throw new TypeError();
	}
	var haves = [], haveNots = [];
	for(var i=0,len=this.length;i<len;i++) {
		val = this[i];
		if (f(val)) {
			haves.push(val);
		} else {
			haveNots.push(val);
		}
	}
	return [haves, haveNots];
}

// Uses the Fisher-Yates algorithm.
// Source - http://snippets.dzone.com/posts/show/849
Array.prototype.shuffle = function(){
	for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x) {}
	return this;
}

Array.prototype.random = function() {
	return this[coinFlip(this.length)];
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

function vector(a,b,c,d) {
	return [a-c,b-d];
}

function crossProduct(u,v) {
	a = u.slice(0);
	b = v.slice(0);
	while(a.length < 3) a.push(0);
	while(b.length < 3) b.push(0);
	return [a[1]*b[2] - a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
}


function magnitude(u) {
	var sum=0;
	var i=u.length;
	var t;
	while(i--) {
		t = u[i];
		sum = sum + t*t;
	}
	return Math.sqrt(sum);
}

function dotProduct(u,v) {
	var sum=0;
	var i=Math.min(u.length,v.length);
	while(i--) {
		sum += u[i]*v[i];
	}
	return sum;
}

// Positions is an array of {x,y} points
function maximumDeviation(positions) {
	var first = positions[0], last = positions[positions.length-1];
	var base = vector(first.x, first.y, last.x, last.y);
	var baseLength = magnitude(base);
	return positions.reduce(function(max,cur) {
		cur = vector(first.x,first.y,cur.x,cur.y);
		var dist = magnitude(crossProduct(base,cur)) / baseLength;
		return (dist > max) ? dist : max;
	}, 0);
}

function areaUnderCurve(positions) {
	var first = positions[0], last = positions[positions.length-1];
	var base = vector(first.x, first.y, last.x, last.y);
	var baseLength = magnitude(base);
	
	var lastXOffset = 0;
	var auc=0;
	for(var i=0, len = positions.length;i<len;i++) {
		cur = vector(first.x,first.y,positions[i].x,positions[i].y);
		var yOffset = magnitude(crossProduct(base,cur)) / baseLength;
		var xOffset = Math.abs(dotProduct(base,cur)) / baseLength;
		auc += yOffset * (xOffset - lastXOffset);
		lastXOffset = xOffset;
	}
	return auc;
	
}

var zen = {
	params: (location.href.split("?")[1]) ? 
		(location.href.split("?")[1]).split("&").reduce(
			function(cumulative,current) {
				cumulative[current.split("=")[0]] = current.split("=")[1];
				return cumulative;
			}
		,{}) : {}
};

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

function getKeyboardInput(acceptedKeys, fun, state, duration) {
	if (duration) setTimeout("document.onkeydown = null;", duration);
	var startTime = new Date();
	
	// monitor for keypresses
	document.onkeydown = function(e) {
		var endTime = new Date();
		var value = keyValue(window.event ? event.keyCode : e.keyCode);
		// ignore keys pressed not in acceptedKeys
		// e.g. if user accidentally pressed another key
		if (acceptedKeys.contains(value)) {
			var input = {response: value, rt: endTime - startTime};
			fun(input, state);
		}
	}
}

function keyValue(e) {
	var code = (window.event) ? event.keyCode : e.keyCode;
	
	switch (code) {
		case 13: return "enter";
		case 27: return "escape";
		case 32: return "space";
		case 37: return "left";
		case 38: return "up";
		case 39: return "right";
		case 40: return "down";
	}

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
	if (arguments.length == 1 && arguments[0] instanceof Array) arguments = arguments[0]; 
	
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

/*
function preloadImages(images, callback) {
	
	var self = arguments.callee;
	if (images.length==0 && !self.finished) {
		self.finished = true;
		callback();
	}
	
	if (!arguments[3]) {
		self.finished = false;
		self.numLoaded = 0;
	}
	
	// By default, attempt for 6 simultaneous downloads
	var concurrent = arguments[2] || 6;
	
	var currentImages = images.splice(0,concurrent);
	concurrent = currentImages.length;
	
	var numLoaded = 0;
	
	for(var i=0;i<currentImages.length;i++) {
		var image = new Image();
		image.onload = function() { 
			self.numLoaded++;
			self(images, callback, 1, true);
		};
		image.src = currentImages[i];
	}
}

*/


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

if (!console || !console.log) {
	var console = {
		log: function() {}
	}
}

/* provide window.innerHeight, width for IE
 browser window size info:
 -- http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
 conditional-comment onload for IE:
 -- http://dean.edwards.name/weblog/2006/06/again/
*/

/*@cc_on 
document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
var script = document.getElementById("__ie_onload");
script.onreadystatechange = function() {
        if (this.readyState == "complete") {
			var docEl=document.documentElement;
			if (docEl && (docEl.clientHeight || docEl.clientWidth)) {
				window.innerHeight = document.documentElement.clientHeight;
				window.innerWidth = document.documentElement.clientWidth;
			} else {
				window.innerWidth = document.body.clientHeight;
				window.innerHeight = document.body.clientWidth;
			}
        }
};
@*/


function ____false() { return false; }

document.onselectstart =
document.oncontextmenu =
document.ondragstart = ____false;

/*
Questionnaire Template

Example usage:
generateForm(someArray, "somestring", "post");

Action: location where form results are submitted. Action must be a string
Method: Either 'post' or 'get'. For our purposes, just stick to post

Name: a unique name describing the nature of the question

className(optional): adds this class to the question. Add the same className to any question to group them under that class. For example, if you're tracking some scale 1 that requires the answers for the happy and floss questions, add "scale1" to the className field

question(required): the question

type(required): supports most html input types
	text: short text input
	textarea: larger text area
		requires rows and cols
	checkbox: multiple item selection
		requires options[] and values[]
	radio: single item selection
		requires options[] and values[]
	dropdown: single item selection in a dropdown menu
		requires options[] values[]

**options(required): the set of answers visible to the user

**values(optional): set of number values for computing stats. If you'd like to apply number values to certain answers, use this array to assign values to each answer. 
	options[] and values[] must be the same length
	
**applies to radio, dropdown, and checkbox only

Example survey array;

var survey= [
{
	name: "age",
	question: "How old are you?",
	type: "text",
	length: "25"
},
{
	name: "floss",
	className:"scale1",
	question: "How often do you floss?",
	type: "radio",
	options: ['4 ft','5ft','6ft'],
	values: [4, 5, 6]
},
{
	name: "happy",
	className:"scale1",
	question: "How tall are you in centimeters?",
	type: "checkbox",
	options: ['4ft','5ft','6ft'],
	values: [1, 2, 3]
},
{
	name: "hobbies",
	question: "What are your hobbies?",
	type: "textarea",
	rows: "4",
	cols: "20"
},
{
	name: "gender",
	question: "What is your gender?",
	type: "dropdown",
	options: ["female","male"],
	selected: "male"
}
];
*/
Array.prototype.generateForm = function(action, method){
	var str = "<form id='form' action='"+action+"'method='"+method+"'>";
	if(typeof this == "undefined")
		throw new TypeError("array is not defined");
	else if(typeof action == "undefined")
		throw new TypeError("action is not defined");
	else if(typeof method == "undefined")
		throw new TypeError("method is not defined");
	
	for(var a=0,b;b=this[a];a++){
		if(typeof b.name == "undefined"||b.name== ''){
			throw new TypeError("name undefined or no name text");
		}
		if(typeof b.question == "undefined"||b.question == ''){
			throw new TypeError("question undefined or no question text");
		}
		else{
			str = str + "<br /><br />" + b.question + "<br />";		
		}
		if(typeof b.type =='undefined' ||b.question == ''){
			throw new TypeError("question type was not defined or no type text");
		}

		var classAdd = '';
		if(typeof b.className != "undefined")
			classAdd = b.className;
		//small textbox
		if(b.type =='text'){
			if(typeof b.length =='undefined')
				throw new TypeError('length is not defined');
			str = str + "<input type='text' class='"+classAdd+"' maxlength='"+b.length+
				"'id='"+b.name+"' />";
		}

		//radio button
		else if(b.type =='radio'){
			if(typeof b.options =='undefined')
				throw new TypeError('options array is not defined');
			else if(typeof b.values =='object'){
				if(b.options.length != b.values.length)
					throw new Error('options array and values array are not the same length');
				for(var i=0, j; j=b.options[i]; i++){
					str = str + "<label for='" + b.name+i + "'>"+j+"</label><input type='radio' class='"+classAdd+"' name='"+b.name+"' id='"+b.name+i+"' value='"+b.values[i]+"'/>";
				}
			}
			else{
				for(var i=0, j; j=b.options[i]; i++){
					str = str + "<label for='" + b.name+i + "'>"+j+"</label><input type='radio' class='"+classAdd+"' name='"+b.name+"' id='"+b.name+i+"' value='"+j+"'/>";
				}
			}
		}
		
		//checkbox
		else if(b.type =='checkbox'){
			if(typeof b.options =='undefined')
				throw new TypeError('options array is not defined');
			else if(typeof b.values =='object'){
				if(b.options.length != b.values.length)
					throw new Error('options array and values array are not the same length');
				for(var i=0, j; j=b.options[i]; i++){
					str = str + "<label for='" + b.name+i + "'>"+j+"</label><input type='checkbox' class='"+classAdd+"' name='"+b.name+"' id='"+b.name+i+"' value='"+b.values[i]+"'/>";
				}
			}
			else{
				for(var i=0, j; j=b.options[i]; i++){
					str = str + "<label for='" + b.name+i + "'>"+j+"</label><input type='checkbox' class='"+classAdd+"' name='"+b.name+"' id='"+b.name+i+"' value='"+j+"'/>";
				}
			}
		}

		//dropdown menu
		else if(b.type == 'dropdown'){
			if(typeof b.options =='undefined')
				throw new TypeError('options array is not defined');
			else if(typeof b.values =='object'){
				if(b.options.length != b.values.length)
					throw new Error('options array and values array are not the same length');
				str = str + "<select class='"+classAdd+"' name='"+b.name+"'>";
				for(var i=0, j; j=b.options[i]; i++){
					if(b.selected==j)
						str = str+"<option selected='selected' value='"+j+"'>"+j+
						" </option>";		
					else
						str = str+"<option value='"+b.values[i]+"'>"+j+" </option>";		
				}
				str = str+"</select>";
			}	
			else{
				str = str + "<select name='"+b.name+"'>";
				for(var i=0, j; j=b.options[i]; i++){
					if(b.selected==j)
						str = str+"<option class='"+classAdd+
						"' selected='selected' value='"+j+"'>"+j+" </option>";		
					else
						str = str+"<option class='"+classAdd+"' value='"+j+"'>"
						+j+" </option>";		
				}
				str = str+"</select>";

			}
		}
		//large textbox (paragraph)
		else if (b.type =='textarea'){
			if(typeof b.rows =='undefined' || typeof b.cols =='undefined')
				throw new TypeError('rows or cols is not defined');
			else if(b.rows =='' || b.cols=='')
				throw new Error('rows or cols is blank');
			str = str + "<textarea name='"+b.name+
			"' style='overflow: hidden;' class='"+classAdd+"' rows='"+b.rows+
			"' cols='"+b.cols+"'></textarea>";
		}
	}	
	str = str + "<br /><input type='submit' value='Submit'>";
	//var oldHtml = document.body.innerHTML;
	//document.body.innerHTML = oldHtml + str;
	return str;
}


