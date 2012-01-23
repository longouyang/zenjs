// zen 0.4
// (c) 2011 Long Ouyang

(function() {

window.$z = window.$z || {};

// Private utility methods
// -----------------------

var bind = function(f, scope) {
  return function() { return f.apply(scope, arguments); }
}

// Array prototype extensions
// --------------------------

var ArrayProto = Array.prototype;

if (!ArrayProto.indexOf) {
	ArrayProto.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]===obj){
				return i;
			}
		}
		return -1;
	}
}

if (!ArrayProto.map) {
  ArrayProto.map = function(fun /*, thisp*/) {
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

if (!ArrayProto.reduce) {
  ArrayProto.reduce = function(fun /*, initial*/) {
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

if (!ArrayProto.filter) {
  ArrayProto.filter = function(fun /*, thisp*/) {
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

if (!ArrayProto.forEach)
{
  ArrayProto.forEach = function(fun /*, thisp*/)
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

if (!ArrayProto.every)
{
  ArrayProto.every = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t && !fun.call(thisp, t[i], i, t))
        return false;
    }

    return true;
  };
}

if (!ArrayProto.some)
{
  ArrayProto.some = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t && fun.call(thisp, t[i], i, t))
        return true;
    }

    return false;
  };
}

if (!ArrayProto.reduceRight)
{
  ArrayProto.reduceRight = function(callbackfn /*, initialValue */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof callbackfn !== "function")
      throw new TypeError();

    // no value to return if no initial value, empty array
    if (len === 0 && arguments.length === 1)
      throw new TypeError();

    var k = len - 1;
    var accumulator;
    if (arguments.length >= 2)
    {
      accumulator = arguments[1];
    }
    else
    {
      do
      {
        if (k in this)
        {
          accumulator = this[k--];
          break;
        }

        // if array contains no values, no initial value to return
        if (--k < 0)
          throw new TypeError();
      }
      while (true);
    }

    while (k >= 0)
    {
      if (k in t)
        accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
      k--;
    }

    return accumulator;
  };
}

// define Array utility functions
ArrayProto.smush = function(a) {
	ArrayProto.push.apply(this, a);
}

ArrayProto.pluck = function(key) {
	var result = [];
	for(var i=0, length=this.length;i<length;i++) {
		result.push(this[i][key]);
	}
	return result;
}

ArrayProto.random = function() {
	return this[$z.flip(this.length)];
}

// Fisher-yates shuffling
ArrayProto.shuffle = function() {
	var a = this.slice();
	for(var j, x, i = a.length;
		i;
		j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x) {
			
	}
	return a;
}

ArrayProto.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

ArrayProto.zip = function (other) {
	var result = [], length = Math.min(this.length, other.length);

	for (var i=0; i<length; i++) {
		result.push([this[i], other[i]]);
	}

	return result;
}

ArrayProto.zipWith = function (other, fun) {
	var result = [], length = Math.min(this.length, other.length);

	for (var i=0; i<length; i++) {
		result.push(fun(this[i], other[i]));
	}

	return result;
}

/*
 Math and utility functions
 --------------------------
*/

// Log function
var log = [];
$z.log = function(str) {
	log.push(str);
	if (typeof console != "undefined") {
	  if (typeof console.log == "function") {
		  console.log(str);
	  }
	}
}

$z.getLog = function() {
	return log.join("\n");
}

// Variadic direct product
$z.dp = function() {
	var numArgs = arguments.length;
	
	if (numArgs < 2) {
		throw new TypeError("$z.dp takes two or more arguments");
	}

	var args = [];
	for(var i=0;i<numArgs;i++) {
		args.push(arguments[i].slice());
	}

	while(args.length > 1) {
		var a = args.shift();
		var b = args.shift();
		
		var product = [];
		for(var i=0, ii = a.length; i < ii ; i++) {
			for(var j = 0, jj = b.length; j < jj ; j++) {
				product.push([].concat(a[i], b[j])) ;
			}
		}
		args.unshift(product);
	}
	
	return args[0];
}

// Redistribute repeats in an array so there are no repeated items
// Returns false if this can't be done
$z.unclump = function(array) {
	array = array.slice();
	var reps = [];
	for(var i=0, j=1, len = array.length - 1; i < len ; i++, j++) {
		if (array[i] == array[j]) {
			reps.push(array.splice(i, 1)[0]);
			i--;
			j--;
			len--;
		}
	}
	
	for(var r=0, rr = reps.length ; r < rr ; r++) {
		var item = reps[r];
		for(var i = -1, j=0, len = array.length; j < len+1 ; i++, j++) {
			if (item != array[j] && ( i > -1 ? item != array[i] : true  ) ) {
				array.splice(j, 0, item);
				break;
			}
			if (j == len) { // reached the end
				if (item != array[i]) {
					array.splice(j, 0, item);
				} else {
					return false;
				}
			}
		}
	}
	return array;
}

// Return {0, 1, ..., n}
$z.iota = function(n) {
	return $z.range(0, n-1);
}

// Return {a, a+1, ..., b}
$z.range = function(a,b) {
	var result = [];
	for( var val = a, end = b+1; val < end ; val++ ) {
		result.push(val);
	}
	return result;
}

// Repeat a function n times
$z.rep = function(n, f) {
	var result = [];
	while(n--) {
		result.push(f());
	}
	return result;
}

// Merge a bunch of key-value objects
$z.merge = function() {
	var args = Array.prototype.slice.call(arguments);
	var kv = {};
	args.map(function(obj) {
		for(var i in obj) {
			if (obj.hasOwnProperty(i)) {
				kv[i] = obj[i];
			}
		}
	})
	return kv;
}

/*
Called without any arguments, flips a two headed coin
Called with one argument, rolls an n-sided die
Called with two arguments, a, and b, returns a random value in a..b
*/
$z.flip = function(a,b) {
	if (!b) {
		a = a || 2;
		return Math.floor(Math.random()*a);
	} else {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}
}

// Convert degrees to centimeters
// Assumes a default viewing distance of 2 feet
$z.degToCm = function(degrees, viewingDistance) {
	viewingDistance = viewingDistance || 60.96;
	return 2 * viewingDistance * Math.tan(degrees * Math.PI / 360);
}

// Convert centimeters to degrees
// Assumes a default viewing distance of 2 feet
$z.cmToDeg = function(centimeters, viewingDistance) {
	viewingDistance = viewingDistance || 60.96;
	return 2 * Math.atan2(centimeters, 2* viewingDistance) * 180 / Math.PI;
}

$z.chain = function() {
	var numArgs = arguments.length;
	var first = arguments[0];
	
	// accept a single array as the argument
	if (numArgs == 1 && first instanceof Array) {
		arguments = first;
	}
	
	// require an odd number of arguments
	if (numArgs % 2 == 0) {
		throw new Error('zen chain() requries an odd number of arguments');
	}
	
	// execute the first argument immediately
	first();
	
	var result = [];
	for(var i=2, execute_time=arguments[1];
		i < numArgs ;
		i+=2, execute_time += arguments[i-1]) {
			result.push(setTimeout(arguments[i], execute_time));
	}
	return result;
}

$z.clearChain = function(chain) {
	for(i = 0, ii = chain.length; i < ii ; i++) {
		clearTimeout(chain[i]);
	}
}

$z.id = function(id) {
	return document.getElementById(id);
}

// Preload resources sequentially (trickle), rather than all at once (torrent).
// This is actually slower on faster computers, but it's guaranteed to work
// on slower computers.
$z.preload = function(resources, options /* afterEach, after, width */) {
	var resources = resources.slice(),
			finished = false,
			numLoaded = 0;
	
	if (!options) options = {};
	
	var afterEach = options.afterEach || function() {},
			after = options.after || function() {},
			width = options.width || 6;
	
	var loadNext = function() {
		var filename = resources.shift();
		if (!filename)  {
			if (!finished) {
				finished = true;
				after();
			}
			return;
		}
		var imageExp = /.jpg|.jpeg|.gif|.png|.bmp|.tif|.tiff/,
				audioExp = /.mp3/,
				obj, embedTag;
		
		if (filename.match(imageExp)) {
			obj = new Image();
		} else {
			embedTag = true;
			obj = document.createElement('iframe');
		}
		
		obj.onload = function() {
			document.body.removeChild(this);
			afterEach(filename);
			loadNext();
		}
		
		obj.onerror = function(e) {
			$z.log("error");
		}
		
		if (embedTag) {
			obj.style.width = "0px";
			obj.style.height = "0px";
			obj.style.border = "0";
			obj.style.margin = "0";
			obj.style.padding = "0";
			obj.src = filename;
			
			document.body.appendChild(obj);

		} else {
			obj.src = filename;
		}
	}
	
	var times = Math.min(width, resources.length);
	while(times--) {
		loadNext();
	}
};


// User input
// ----------

function updateMouse(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	
	if (!currentMouseTime) {
		currentMouseTime = new Date();
	}
	
	mousePositions.push({x: posx, y: posy, t: (new Date() - currentMouseTime)});
}

var recordingMouse = false, mousePositions = [], previousHandler, currentMouseTime;

// recordMouse(duration, after)
$z.startMouseRecord = function(duration, after) {
	mousePositions = [];
	recordingMouse = true;
	previousHandler = window.onmousemove;
	
	// Handle previous mouse handler for IE
	if (typeof window.onmousemove == "undefined") {
		previousHandler = document.onmousemove;
	}
	
	if (previousHandler) {
		document.onmousemove = function(e) {
			if (!e) var e = window.event;
			updateMouse(e);
			previousHandler(e);
		}
	} else {
		document.onmousemove = updateMouse;
	}
	
	if (duration) {
		setTimeout(function() {
			recordingMouse = false;
			window.onmousemove = previousHandler;
			after(mousePositions.slice());
		}, duration);
	}
}

$z.stopMouseRecord = function() {
	document.onmousemove = previousHandler;
}

$z.getMouseRecord = function() {
	return mousePositions.slice();
}

// Dustin Diaz's getElementsByClassName
var getElementsByClass = function(searchClass,node,tag) {
  var classElements = new Array();
  if ( node == null )
    node = document;
  if ( tag == null )
    tag = '*';
  var els = node.getElementsByTagName(tag);
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

// Takes either a object id or an html node object as
// an argument
$z.showSlide = function(_obj) {
	var obj = (typeof _obj === "string") ? $z.id(_obj) : _obj;
	var slides = [];
	
	if (document.getElementsByClassName) {
		slides = ArrayProto.slice.call(document.getElementsByClassName("zen-slide"));
	} else {
		slides = getElementsByClass("zen-slide",null,"div");
	}
	
	var i=slides.length;
	while(i--) {
		slides[i].style.visibility = "hidden";
	}
	
	obj.style.visibility = "visible";
}

var alphabet = [
	"a","b","c","d","e","f","g","h","i","j","k","l","m",
	"n","o","p","q","r","s","t","u","v","w","x","y","z"];

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

var keyValue = function(code) {
	// There are duplicates here because different browsers
	// use slightly different codes for some special characters
	// See http://unixpapa.com/js/key.html

	if (specialKeys[code]) return specialKeys[code];

	// numbers
	if (code > 47 && code < 58 ) return "" + (code - 48);
	// numpad
	if (code > 95 && code < 106) return "" + (code - 96);
	// characters - doing "abcdef..."[] doesn't work in IE
	if (code > 64 && code < 91) return alphabet[code-65];
	return 0;
}

// getKey(["a","b","c"],{duration: ..., after:, times: })
// TODO: rewrite using addEventListener
// TODO: fire handler after each key, or after #times have ended?
$z.getKey = function(keys,options) {
	
	var previous = document.onkeydown;
	var resetKeyHandler = function() {
		document.onkeydown = previous;
	}
	var times = options.times || 1, after = options.after || false;
	
	if (options.duration) {
		setTimeout(resetKeyHandler, duration);
	}
	
	var startTime = new Date();
	
	// monitor for keypresses
	document.onkeydown = function(e) {
		var endTime = new Date();
		
		if (previous) {
			previous(e);
		}
		
		var e = e || window.event;
		
		// don't fire if special keys are also pressed
		if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
			return;
		}
		
		var v = e.charCode || e.keyCode;
		var value = keyValue(v);
		
		// ignore keys pressed not in acceptedKeys
		// e.g. if user accidentally pressed another key
		if (!(keys == "any" || keys.contains(value))) {
			return true;
		}
		
		var nodeName;
		if (e.target) {
			nodeName = e.target.nodeName;
		} else if (e.srcElement) {
			nodeName = e.srcElement.nodeName;
		}
		
		// ignore keys pressed inside input
		if (nodeName == "INPUT" || nodeName == "TEXTAREA") {
			return true;
		}
		
		times -= 1;
		if (times == 0) {
			resetKeyHandler();
		}
		
		// IE
		e.returnValue = false;
		e.cancelBubble = true;

		if (e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		}
		
		if (after) {
			after({response: value, rt: endTime - startTime});
		}
		return false; // needed for propogation canceling to work
	}
}

/*
 =======================================================
 =======================================================
 Data structures
 =======================================================
 =======================================================
*/

var hopUndefined = !Object.prototype.hasOwnProperty;

// TODO: rename trialEnd process?
var Stream = function(options) {
	options = options || {};
	
	/* Use "o" because the child methods can potentially
	be called via setTimeout. Using "this" would require
	that we do scope binding on the child methods. */
	
	// things should get attached to the stream: trials, slide
	for(var key in options) {
	  if (hopUndefined || options.hasOwnProperty(key)) {
	    this[key] = options[key];
	  }
	}
	var _this = this;
	this.completed = [];
	
	// these properties be "public" because it's conceivable that you'd
	// want to modify them mid-stream
	["trialStart","trialEnd","after"].map(function(prop) {
	  if (!_this[prop]) {
	    _this[prop] = function() {}
	  }
	})
	
	var init = false;

	var start = function() {
		if (!init) {
			init = true;
			if (this.before) {
			  this.before();
		  }
		}
		if (this.slide) {
			$z.showSlide( this.slide );
		}

		var trial = this.trials[this.completed.length];
		if (!trial) return;

		this.trialStart(trial);
	}
	this.start = bind(start,this);

	var end = function(data) {
	  //var trial = this.trials[this.completed.length],
	      //value = this.trialEnd(trial,data);
	  
	  //this.completed.push(value == null ? trial : value );
	  this.completed.push(data);
	  
	  if (this.completed.length < this.trials.length) {
	    this.start();
	  } else {
	    this.after();
	  }
	};
	
	this.end = bind(end,this);
}

$z.stream = function(options) {
	return new Stream(options);
}

// rename afterEach process?
var Reactor = function(options) {
	options = options || {};
	
	this.data = [], this.trials = [];
	
	this.start = options.start || function() {};
	this.criterion = options.criterion || function() {};
	this.afterEach = options.afterEach || function() {};
	this.afterAll = options.afterAll || function() {};
	
	var react = function(obj) {
		var val = this.afterEach(obj);
		this.data.push(val ? val : obj);
		
		if (this.criterion()) {
			this.afterAll();
			return;
		} else {
			this.start();
		}
	}
	
	this.react = bind(react,this);
}

$z.reactor = function(options) {
	return new Reactor(options);
}

// TODO: at the beginning of reactor and stream, implement
// options folding using merge?

// TODO: notion of laziness? i.e. lazy streams and reactors don't auto-call .start()?

})();