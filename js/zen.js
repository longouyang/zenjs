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

getWindowHeight = function() {
	var y = 0;
	
	if (self.innerHeight) {
		y = self.innerHeight;
	} else if (	document.documentElement &&
				document.documentElement.clientHeight) {
		y = document.documentElement.clientHeight;
	} else if (document.body) {
		y = document.body.clientHeight;
	}

	return y;
}

getWindowWidth = function() {
	var x = 0;
	if (self.innerWidth) {
		x = self.innerWidth;
	} else if (	document.documentElement &&
				document.documentElement.clientWidth) {
		x = document.documentElement.clientWidth;
	} else if (document.body) {
		x = document.body.clientWidth;
	}
	return x;
}

/* Utility functions */

Array.prototype.product = function() {
	var i = this.length, r = 1;
	while(i--) {
		var type = typeof this[i];
		if (type !== "number") {
			throw new TypeError("Tried to multiply " + type + " : " + this[i]);
		}
		r*= this[i];
	}
	return r;
}

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

Array.prototype.zip = function(a) {
	var r = [];
	if (a.length != this.length) {
		throw new Error("zip takes two equal length arrays");
	}
	for(var i=0, len = this.length; i<len;i++) {
		r.push([this[i], a[i]]);
	}
	return r;
}


// From http://tech.karbassi.com/2009/12/17/pure-javascript-flatten-array/
// Modification - removed object from regex to allow hashes to live
Array.prototype.flatten = function flatten(){
   var flat = [];
   for (var i = 0, l = this.length; i < l; i++){
       var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
       if (type) { flat = flat.concat(/^(array|collection|arguments)$/.test(type) ? flatten.call(this[i]) : this[i]); }
   }
   return flat;
};

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

// Returns set of vertices that define a polygon with n sides and vertex radius r.
function polygon(n, r, offsetX, offsetY) {
	if (typeof n != "number" || !n || n < 3)
		throw new TypeError('polygon() requires a number greater than 2');
	if (typeof r!= "number" || !r) r = 100;
	if (typeof offsetX != "number" || !offsetX) offsetX = 0;
	if (typeof offsetY != "number" || !offsetY) offsetY = 0;
	
	var pi = Math.PI, theta = 2*pi/n, angle = -pi/n;
	var sin = Math.sin, cos = Math.cos, points = [];
	while(n--) {
		points.push({
			x: Math.round(r*sin(angle)) + offsetX,
			y: Math.round(r*cos(angle)) + offsetY
		});
		angle += theta;
	}
	return points;
}

// return the cartesian product of an arbitrary number of arrays
function cartesianProduct(a,b) {
	if (arguments.length < 2) {
		throw new TypeError("cartesianProduct takes two or more arguments");
	}
	
	var args = [];
	for(var i=0;i<arguments.length;i++)
		args.push(arguments[i].slice());

	if (args.length > 2) {
		var partial = cartesianProduct(args[0],args[1]);
		args.splice(0,2);
		args.unshift(partial);
		return cartesianProduct.apply(this, args);
	}
	var c = [];
	
	var a_len=a.length,b_len=b.length;
	for(var i=0;i<a_len;i++) {
		for(var j=0;j<b_len;j++) {
			// check if the left factor is not an array
			if (typeof a[i] !== "array") { 
				t = [a[i]];
			} else {
				t = a[i].slice();
			}
			c.push(t.concat(b[j]));
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

function newSlide(innerHtml, id) {
	if (!newSlide.counter) newSlide.counter = 1;
	
	var slide = document.createElement("div");
	slide.className = "slide";
	slide.id = id ? id : "___newSlide" + newSlide.counter++;
	slide.innerHTML = innerHtml;
	document.body.appendChild(slide);
	return slide;
}

// Show a slide. Takes either a div ID or element
function showSlide(s) {
	
	var slides = document.getElementsByClassName("slide"), i = slides.length;
	var proceed = false;
	
	if (s instanceof HTMLElement && s.className=="slide")  proceed = true;
	if (typeof s == "string" && (s = document.getElementById(s))) proceed = true;
	
	if (!proceed) throw new Error('invalid arguments');
	
	while(i--) {
		var slide = slides[i];
		if (slide.activeSlide) {
			slide.style.display = "none";
			slide.activeSlide = null;
		}
	}
	
	s.activeSlide = true;
	s.style.display = "block";
	
	
	
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

// Get keyboard input
// 
function getKeyboardInput(acceptedKeys, fun, state, duration) {
	if (!(acceptedKeys instanceof Array || acceptedKeys === "any")) throw new TypeError();
	
	if (duration) setTimeout(function() {document.onkeydown = null;}, duration);
	var startTime = new Date();
	
	// monitor for keypresses
	document.onkeydown = function(e) {
		var e = e || window.event;
		
		var v = e.charCode || e.keyCode;
		var value = keyValue(v);
		// ignore keys pressed not in acceptedKeys
		// e.g. if user accidentally pressed another key
		if (acceptedKeys === "any" || acceptedKeys.contains(value)) {
			// IE
			e.returnValue = false;
			e.cancelBubble = true;

			if (e.preventDefault) {
				e.preventDefault();
				e.stopPropagation();
			}
			
			var endTime = new Date();
			var input = {response: value, rt: endTime - startTime};
			fun(input, state);
			return false;
		}
		
	}
}

function keyValue(code) {
	
	// There are duplicates here because different browsers
	// use slightly different codes for some special characters
	// See http://unixpapa.com/js/key.html
	var specialKeys = {
		8: "backspace",
		9: "tab",
		13: "enter",
		27: "escape",
		32: "space",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		46: "delete",
		59: ";",
		61: "=",
		107: "=", // not ideal, since this is + on numpad keyboards
		109: "-",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: '\\',
		221: "]",
		222: "'"
	}
	
	if (specialKeys[code]) return specialKeys[code];

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
	
	var r = [];
	for(var i=2, execute_time=arguments[i-1]; i<len ; i+=2, execute_time += arguments[i-1]) {
		r.push(setTimeout(arguments[i], execute_time));
	}
	return r;
}

function clearChain(a) {
	for(var i=0, len = a.length;i<len;i++)
		clearTimeout(a[i]);
}

// Preload resources sequentially (trickle), rather than all at once (torrent).
// This is actually slower on faster computers, but it's guaranteed to work
// on slower computers.

function preload(images, callback) {
	
	var self = preload;
	if (images.length==0 && !self.finished) {
		self.finished = true;
		callback();
	}
	
	// 4th argument indicates whether this function was called recursively
	if (!arguments[3]) {
		images = images.slice(0);
		self.finished = false;
		self.numLoaded = 0;
		var status = document.createElement("div");
		status.className = "slide";
		status.id="_preload";
		status.style.textAlign = "center";
		status.innerHTML = "<div style='padding-top: 25px'>Loading " +
			"resources: <span id='_preload_indicator'>0</span> / " +
			images.length + "";
		
		document.body.appendChild(status);
		showSlide('_preload');
	}
	
	// 3rd argument is the number of simultaneous downloads.
	// If unset, defaults to 6.
	var concurrent = arguments[2] || 6;
	
	var currentImages = images.splice(0,concurrent);
	concurrent = currentImages.length;
	
	var numLoaded = 0;
	
	for(var i=0;i<currentImages.length;i++) {
		var image = new Image();
		image.onload = function() { 
			$$$('_preload_indicator').innerHTML = ++self.numLoaded;
			self(images, callback, 1, true);
			
		};
		image.src = currentImages[i];
	}
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

if (typeof console === "undefined") {
		var console = {
			log: function() {}
	}
}

function disableSelect() {
	document.onselectstart = function() { return false; }
}

function disableRightClick() {
	document.oncontextmenu = function() { return false; }
}

function disableDrag() {
	document.ondragstart = function() { return false; }
}


/*
Questionnaire Template

Example usage:
generateForm(survey, node, action, method);

survey: an array of questions

node: the DOM element to insert the form

Action: location where form results are submitted. Action must be a string

Method: Either 'post' or 'get'. Defaults to post 

Name: a unique name describing the nature of the question

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
	question: "How often do you floss?",
	type: "radio",
	options: ['4 ft','5ft','6ft'],
	values: [4, 5, 6]
},
{
	name: "happy",
	question: "How tall are you in centimeters?",
	type: "checkbox",
	options: ['30','40','50'],
	values: [1, 2, 3]
},
{
	name: "hobbies",
	question: "What are your hobbies?",
	type: "textarea",
	rows: "4",
	cols: "20",
	validate: function(val) { return val.length == 2 }
},
{
	name: "gender",
	question: "What is your gender?",
	type: "dropdown",
	options: ["male","female"],
	selected: "male",
	optional: true
}
];
*/

function insertAfter( referenceNode, newNode )
{
    referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
}

//survey and action are required, method is optional
function generateForm(survey, node, action, method, buttonText){
	var self = generateForm;
	
	function tag(kind, options) {
		var str = "<" + kind + " ";
		var optStr = [];
		for(var i in options) {
			if (options.hasOwnProperty(i) && i != "content")
				optStr.push(i+"=" + '"' + options[i] + '"');
		}
		str += optStr.join(" ") + ">";
		if (typeof options.content != "undefined") {
			str += options.content;
		}
		str += "</" + kind + ">";
		return str;
	}
	
	if (typeof self.numForms === "undefined") {
		self.numForms = 1;
	} else {
		self.numForms++;
	}
	
	var formId = "__form" + (self.numForms - 1);
	method == undefined ? method = 'POST' : method = method;
	var str = "<form id='"+formId+"' action='"+action+"' method='"+method+"' onsubmit='return this.validate();'><ol>";
	for(var a=0,b;b=survey[a];a++){
		if(b.question!=''){
			str += "<li><p><div class='zen_question'>" + b.question + "</div><div class='zen_input'>";		
		}
		
		switch(b.type) {
			case '':
				str += tag('input', {type: "text", id: b.name});
				break;
			case 'text':
				str += tag('input', {type: "text", maxlength: b.length, id: b.name});
				break;
			case 'checkbox':
			case 'radio':
				b.options.map(function(o,i) {
					var id = b.name + "[" + i + "]";
					str += tag('label',{"for": id, content: o}) +
					tag('input',{type: b.type, name: b.name, id: id, value: b.values[i], "class": "zen_"+b.type});
				});
				
				break;
			case 'dropdown':
				var options = b.options.reduce(
					function(cumulative, value) {
						var attributes = {value: value, content: value};
						if (value.selected) attributes.selected = "selected";
						
						return cumulative + tag('option', attributes);
					}
				, "");
			
				str += tag('select', {name: b.name, content: options, id: b.name});
				break;
			case 'textarea':
				str += tag('textarea', {name: b.name, rows: b.rows, cols: b.cols, id: b.name});

		}
		
		str += '</div></p></li>';
		
	}
	if(buttonText){
		str = str + "<br /><button type='submit'>"+buttonText+"</button></form>";
	}
	else{
		str = str + "<br /><button type='submit'>Next</button></form>";
	}
	node.innerHTML += str;
	//return str;
	$$$(formId).validate = function() {
		var finalCheck = true;
		var error = false;
		var form = this;
		survey.map(function(item) {
			var id = item.name;
			
			if (item.optional) return;
			
			var el, value;
			
			// Search through checkbox/radio options
			if (item.type == "checkbox" || item.type == "radio") {
				value = [];
				for(var i=0, len = item.options.length; i < len; i++) {
					var option = $$$(item.name+"["+i+"]");
					if (option.checked) value.push(option.value);
				}
				
				if (item.type == "radio") {
					value = value.shift();
					item.validate = function(o) { return o; }
				} else {
					item.validate = function(o) { return o.length; }
				}
				
				el = $$$(item.name+"["+(i-1)+"]");
			} else {
				el = form[item.name];
				value = el.value;
			}
			
			var errorEl = document.getElementById(id + ".err");
			
			if (!errorEl) {
				errorEl = document.createElement("span");
				errorEl.id = id + ".err";
				errorEl.className = "zen_error";
				insertAfter(el, errorEl);
			}
			
			
			var notBlank = function(val) { return !(val === ""); };
			var validate = item.validate || notBlank;
			
			if (!validate(value)) {
				error = true;
				finalCheck = false;
				errorEl.innerHTML = "required";
				//console.log(id + " failed");
			} else {
				errorEl.innerHTML = "";
				
			}
		});
		//console.log("validation passed: " + !error);
		return finalCheck;
	}

}

function Stream(options) {

	function include(arr,obj) { return (arr.indexOf(obj) != -1); }

	var keys = ["initStatus","trials","completed","start","end","trialStart","trialEnd"];
	
	var me = this;

	options = options || {};

	me.trials = options.trials || [];
	me.completed = [];
	me.trialStart = options.trialStart || function() {};
	me.trialEnd = options.trialEnd || function() {};
	me.after = options.after || function() {};
	me.initStatus = false;
	me.slide = options.slide || false;
	me.slideId = options.slideId || false;
	me.slideHtml = options.slideHtml || false;


	me.setup = function() {
		this.initStatus = true;
		if (this.slideId) {
			showSlide(slideId);
		} else if (this.slide) {
			// todo
		} else if (this.slideHtml) {
			this.slide = newSlide(this.slideHtml);
			showSlide(this.slide);
		}
		
		if (options.setup) { options.setup(); }
		
	}

	me.start = function() {
		
		if (!me.initStatus || options.forceSetup) me.setup();

		var trial = me.trials[0];
		if (!trial) return;
		

		me.trialStart(trial);
	}
	
	me.end = function() {
		var trial = me.trials.shift();
		me.completed.push(trial);
	
		me.trialEnd(trial);
	
		
		if (me.trials.length) {
			me.start();
		} else {
			me.after();
		}
	}

}
