(function() {

window.$z = window.$z || {};
var ArrayProto = Array.prototype;

// Define Javascript 1.8 array functions if we don't have them
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

/*
zen 0.3
Author: Long Ouyang

Notes: libraries that are usefully combined with zen:
-json2.js
-jQuery
-soundManager
-FlashCanvas
*/


/*
 =======================================================
 =======================================================
 Array prototype extensions
 =======================================================
 =======================================================
*/

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

Array.prototype.zipWith = function (other, fun) {
	var result = [], length = Math.min(this.length, other.length);

	for (var i=0; i<length; i++) {
		result.push(fun(this[i], other[i]));
	}

	return result;
}

/*
 =======================================================
 =======================================================
 Math and utility functions
 =======================================================
 =======================================================
*/

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

/*
 =======================================================
 =======================================================
 User input
 =======================================================
 =======================================================
*/

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

// getKey("a","b","c",...,duration, after, once)
// TODO: change {once} argument to {times}.
$z.getKey = function(options) {
	var numArgs = arguments.length;
	if (!numArgs) return;
	
	var keys = [], duration = 0, after = false, once = true;
	for(var i = 0, arg = arguments[0]; i < numArgs; i++, arg = arguments[i]) {
		if (typeof arg == "string") {
			keys.push(arg);
		} else if (typeof arg == "number") {
			duration = arg;
		} else if (typeof arg == "function") {
			after = arg;
		} else if (typeof arg == "boolean") {
			once = arg;
		}
	}
	
	if (keys.length == 0) {
		keys = "any";
	}
	
	var previous = document.onkeydown;
	var resetKeyHandler = function() {
		document.onkeydown = previous;
	}
	
	if (duration) {
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
		
		// ignore keys pressed within an element that's not the body
		if (nodeName != "BODY" && nodeName != "HTML") {
			return true;
		}
		
		if (once) {
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
			after(value, endTime - startTime);
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

var Stream = function(options) {
	options = options || {};
	
	/* Use "o" because the child methods can potentially
	be called via setTimeout. Using "this" would require
	that we do scope binding on the child methods. */
	var o = {
		trials: options.trials || [],
		completed: [],
		trialStart: options.trialStart || function() {},
		trialEnd: options.trialEnd || function() {},
		setup: options.setup || function() {},
		after: options.after || function() {},
		initStatus: false,
		slide: options.slide || false
	}

	// wrapper for setup function
	o._setup = function() {
		o.initStatus = true;
		if (o.slide) {
			$z.showSlide( o.slide );
		}
		o.setup();
	}

	o.start = function() {
		if (!o.initStatus) o._setup();

		var trial = o.trials[0];
		if (!trial) return;

		o.trialStart(trial);
	}

	o.end = function() {
		var trial = o.trials.shift();
		o.completed.push(trial);

		o.trialEnd(trial);

		if (o.trials.length) {
			o.start();
		} else {
			o.after();
		}
	}
	
	// Could use jQuery or underscore to make this more compact,
	// but it's worth it to write it out so we don't have dependence
	// on any other libraries
	this.trials = o.trials;
	this.completed = o.completed;
	this.trialStart = o.trialStart;
	this.trialEnd = o.trialEnd;
	this.setup = o.setup;
	this.after = o.after;
	this.initStatus = o.initStatus;
	this.slide = o.slide;
	this._setup = o._setup;
	this.start = o.start;
	this.end = o.end;
	
}

$z.stream = function(options) {
	return new Stream(options);
}

var LazyWhile = function(options) {
	options = options || {};
	
	var me = this;
	me.data = [], me.trials = [];
	
	me.start = options.start || function() {};
	me.criterion = options.criterion || function() {};
	me.after = options.after || function() {};
	
	me.respond = function(obj) {
		me.data.push(obj);
		
		if (!!me.criterion()) {
			me.after();
			return;
		} else {
			me.start();
		}
	}
}

$z.criterion = function(options) {
	return new LazyWhile(options);
}

var Staircase = function(options) {
	options = options || {};
	
	var me = this;
	
	var settings = ["value", "step", "show", "responseHandler", "afterStep", "afterReversal"];
	
	for(var i in options) {
		if (options.hasOwnProperty(i)) {
			me[i] = options[i];
		}
	}
	
	me.data = [], me.reversals = [], me._finished = false;
	
	me.start = function() {
		me._shift = false;
		me.startTrial(me.value);
	}
	
	// response must be boolean
	me.respond = function() {
		var response = me.responseHandler.apply(me, arguments);
		if (!(typeof response === "boolean")) {
			throw TypeError('Staircase responseHandler must return true or false');
		}
		
		var reversal = !!(typeof me.lastResponse == "boolean" && me.lastResponse != response);
		//console.log(me.lastResponse + "\t" + response + "\t" + reversal);
		me.lastResponse = response;
		
		// record data
		var datum = {value: me.value, response: response};
		me.data.push(datum);
		
		if (reversal) { me.reversals.push(datum) }
		
		// compute new value
		var step;
		if (typeof me.step === "number") {
			step = me.step;
		} else if (me.step instanceof Array) {
			if (reversal) {
				me.step.shift();
			}
			step = me.step[0];
		} else if (typeof me.step === "function") {
			step = me.step.call(me, reversal);
		}
		
		if (!step) {
			me._finished = true;
			return me.finished(); // todo: callback
		} else {
			/*
			if response was above threshhold, we need to
			decrease value. if response was below threshhold,
			we need to increase value.
			*/
			me.value += (response ? -1 : 1) * step;
		}
		
		if (!me._shift) me.start();
	}
	
	me.shift = function() {
		me._shift = true;
		me.startTrial(me.value);
	}
}

})();