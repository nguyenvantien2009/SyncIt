module.exports = (function (buildRe) {

"use strict";
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # SyncLocalStorage
 *
 * A pretty basic wrapper around HTML5's LocalStorage.
 *
 * Allows the existance of namespaces for easy seperation of data and
 * automatically serializes and unserializes all data stored within
 * it.
 *
 * It is anticipated that a "." is used to seperate information within
 * a key, although that will only be a factor if you wish to use the 
 * `SyncLocalStorage.findKeys()` method.
 */

/**
 * ## new SyncLocalStorage()
 *
 * Constructor.
 *
 * ### Parameters
 *
 * * **@param {LocalStorage} `localStorage`** This should be window.localStorage,
 *		or something that implements that API.
 * * **@param {String} `namespace`** This will be included before every value
 *		stored and other functions will only retrieve items with this namespace.
 * * **@param {Function} `serialize`** The method to use for serialization (Try JSON.stringify).
 * * **@param {Function} `unserialize`** The method to use for unserialization (Try JSON.parse).
 */
var SyncLocalStorage = function(localStorage,namespace,serialize,unserialize) {
	this._ls = localStorage;
	this._serialize = serialize;
	this._unserialize = unserialize;
	this._ns = namespace;
};

/**
 * Returns the amount of items stored in the LocalStorage. Note this is not the 
 * amount of items which are stored within the namespace
 */
SyncLocalStorage.prototype.getLength = function() {
	return this._ls.length;
};
SyncLocalStorage.prototype.length = SyncLocalStorage.prototype.getLength;

/**
 * ## SyncLocalStorage.prototype.setItem()
 *
 * Sets key k to value v
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 * * **@param {Object} `unserialize`**
 */
SyncLocalStorage.prototype.setItem = function(k,v) {
	return this._ls.setItem(this._ns+'.'+k,this._serialize(v));
};

/**
 * ## SyncLocalStorage.prototype.clear()
 *
 * Removes all items in the namespace.
 */
SyncLocalStorage.prototype.clear = function() {
	var i = 0,
		k = '',
		l = 0,
		keys = [];
	for ( i = 0, l = this.getLength(); i<l; i++) {
		k = this.key(i);
		if (k !== null) {
			keys.push(k);
		}
	}
	while (keys.length) {
		this.removeItem(keys.shift());
	}
};

/**
 * ## SyncLocalStorage.prototype.key()
 *
 * Fetches the LocalStorage key at index `i` if it is within the 
 * namespace. If it is not within the namespace `null` will be
 * returned.
 *
 * ### Parameters
 *
 * * **@param {Number} `i`**
 */
SyncLocalStorage.prototype.key = function(i) {
	var k = this._ls.key(i);
	if (k === null) { return null; }
	if (
		(k.length > this._ns.length) &&
		(k.substr(0,this._ns.length + 1) == this._ns+'.')
	) {
		return k.substr(k.indexOf('.')+1);
	}
	return null;
};

SyncLocalStorage.prototype.keys = function() {
	var length = this.getLength();
	var r = [], i;
	for (i=0;i<length;i++) {
		r.push(this.key(i));
	}
	return r;
};

/**
 * ## SyncLocalStorage.prototype.getItem()
 *
 * Gets the item stored at key `k` within the namespace.
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 */
SyncLocalStorage.prototype.getItem = function(k) {
	return this._unserialize(this._ls.getItem(this._ns+'.'+k));
};

/**
 * ## SyncLocalStorage.prototype.removeItem()
 *
 * Removes the item stored at key `k`.
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 */
SyncLocalStorage.prototype.removeItem = function(k) {
	return this._ls.removeItem(this._ns+'.'+k);
};

/**
 * ## SyncLocalStorage.prototype.findKeys()
 *
 * This function will return all keys that a specified pattern.
 *
 * ### Parameters
 *
 * * **@param {String} `pattern`** Patterns allow wildcards of "*" and use "."
 *		as a seperator. For example 'cars.*.large' could return 
 *		'cars.bmw.large' and 'cars.ford.large' but not 'cars.opel.medium'.
 * * **@return {Array}** An Array of String.
 */
SyncLocalStorage.prototype.findKeys = function(pattern) {
	var l = 0,
		i = 0,
		k = '',
		r = [],
		re = null;
	
	
	re = buildRe(pattern);

	if (re === false) {
		throw new Error(
			"You cannot find keys from the pattern '" + pattern + "'"
		);
	}

	for (i = 0, l = this._ls.length; i < l; i++) {
		k = this._ls.key(i);
		if (
			(k.length > this._ns.length) &&
			(k.substr(0,this._ns.length + 1) == this._ns+'.')
		) {
			k = k.substr(k.indexOf('.')+1);
			if (re.test(k)) {
				r.push(k);
			}
		}
	}

	return r;
};

return SyncLocalStorage;

}(require('./FindKeysReBuilder.js')));
