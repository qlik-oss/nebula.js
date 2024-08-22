/* eslint-disable */
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 * Modified by Qliktech
 */
// Inspired by base2 and Prototype

/* eslint no-new-func:0,no-unused-vars:0 */

const fnTest = /xyz/.test(() => {
  let xyz;
})
  ? /\b_super\b/
  : /.*/;

/**
 * Helper module for creating subclasses (or rather prototypal inheritance) of superclasses.
 *
 * @class
 *
 * @example
 * var Animal = Class.extend( "Animal", {
 *   init: function ( name ) {
 *     this.name = name || "Unnamed";
 *   },
 *   say: function ( sound ) {
 *     console.log( this.name + " says " + sound );
 *   }
 * } );
 *
 * var Cat = Animal.extend( "Cat", {
 *   say: function () {
 *     this._super( "Meouw" );
 *   }
 * } );
 *
 * var cat = new Cat( "Gustaf" );
 * cat.say(); => "Gustaf says Meouw"
 *
 * @example
 * var MyClass = Class.extend();
 *
 * var a = new MyClass();
 * console.log( a instanceof MyClass ) // => true
 * console.log( a.constructor.name ) // => Class
 *
 * @example
 * var MyClass = Class.extend( "MyClass" );
 *
 * var a = new MyClass();
 * console.log( a instanceof MyClass ) // => true
 * console.log( a.constructor.name ) // => MyClass
 *
 */
const Class = function () {};

/**
 * This method is available inside each function defined on the prototype when using {@link module:assets/core/utils/class~Class.extend}.
 *
 * It will invoke the super class' method with the same name, but it's up to programmer to invoke it with the arguments needed.
 * @method module:assets/core/utils/class~Class#_super
 */

/**
 * Create a new Class that inherits from this class
 * @param {String} [className="Class"] The name of the new class constructor.
 * @param {Object} proto The prototype for the new class.
 */
Class.extend = function extend(className, proto) {
  const _super = this.prototype;

  if (typeof className !== 'string') {
    proto = className;
    className = 'Class';
  }

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  const prototype = Object.create(this.prototype);

  // Copy the properties over onto the new prototype
  for (const name in proto) {
    // Check if we're overwriting an existing function
    prototype[name] =
      typeof proto[name] === 'function' && typeof _super[name] === 'function' && fnTest.test(proto[name])
        ? (function (name, fn) {
            return function (...args) {
              const tmp = this._super;

              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];

              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              const ret = fn.apply(this, args);
              this._super = tmp;

              return ret;
            };
          })(name, proto[name])
        : proto[name];
  }

  if (!/^[_a-z][_a-z\d]*$/i.test(className)) {
    throw new Error('Invalid subclass name. Alphanumericals only.');
  }

  // The dummy class constructor
  const ctor = new Function(
    `return (function ${className}(){ typeof this.init === 'function' && this.init.apply(this, [].slice.call(arguments)) });`
  )();

  // Populate our constructed prototype object
  ctor.prototype = prototype;

  // Enforce the constructor to be what we expect
  ctor.prototype.constructor = ctor;

  // And make this class extendable
  ctor.extend = extend;

  return ctor;
};

export default Class;
