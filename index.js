const EventEmitter = require('events').EventEmitter;

/**
 * @typedef {{ [E in keyof L]: (...args: any[]) => any }} ListenerSignature
 * @template L
 */

/**
 * @typedef {{ [k: string]: (...args: any[]) => any }} DefaultListener
 */

/**
 * This class is like EventEmitter, but with some enhancements / modifications (see project README).
 * @template {ListenerSignature<L>} L
 */
class Emitter
{
	/** @type {EventEmitter | null} */
	#emitter;
	/** @type {WeakMap<any,any>} */
	#map;

	constructor()
	{
		//Create event emitter
		this.#emitter = new EventEmitter();
		//Listener wrapper map
		this.#map = new WeakMap();
		//Remove limit
		this.#emitter.setMaxListeners(0);
	}

	/**
	 * Wraps the event listener so it throws any error asynchronously
	 * @template {keyof L & (string | symbol)} U
	 * @param {L[U]} listener - Event listener
	 * @returns {L[U]}
	 */
	#wrap(listener)
	{
		let wrapped = this.#map.get(listener);
		if (!wrapped)
		{
			wrapped = (/** @type {any[]} */ ...args)=>{
				try {
					listener(...args);
				} catch(e) {
					setTimeout(()=>{throw e});
				}
			};
			this.#map.set(listener,wrapped);
		}
		return wrapped;
	}


	/**
	 * @protected
	 * Emit an event
	 * @template {keyof L & (string | symbol)} U
	 * @param {U} event	- Event name
	 * @param {Parameters<L[U]>} args	- Event arguments
	 * @returns {boolean}
	 */
	emit(event, ...args)
	{
		if (!this.#emitter)
			throw new Error("emitter has been stopped");
		return this.#emitter.emit(event, ...args);
	}


	/**
	 * Add event listener
	 * @template {keyof L & (string | symbol)} U
	 * @param {U} event	- Event name
	 * @param {L[U]} listener	- Event listener
	 * @returns {this}
	 */
	on(event, listener)
	{
		//Delegate event listeners to event emitter
		this.#emitter?.on(event, this.#wrap(listener));
		//Return object so it can be chained
		return this;
	}

	/**
	 * Add event listener at the begining of the listener array
	 * @template {keyof L & (string | symbol)} U
	 * @param {U} event	- Event name
	 * @param {L[U]} listener	- Event listener
	 * @returns {this}
	 */
	prependListener(event, listener)
	{
		//Delegate event listeners to event emitter
		this.#emitter?.prependListener(event, this.#wrap(listener));
		//Return object so it can be chained
		return this;
	}

	/**
	 * Add event listener once
	 * @template {keyof L & (string | symbol)} U
	 * @param {U} event	- Event name
	 * @param {L[U]} listener	- Event listener
	 * @returns {this}
	 */
	once(event, listener)
	{
		//Delegate event listeners to event emitter
		this.#emitter?.once(event, this.#wrap(listener));
		//Return object so it can be chained
		return this;
	}

	/**
	 * Remove event listener
	 * @template {keyof L & (string | symbol)} U
	 * @param {U} event	- Event name
	 * @param {L[U]} listener	- Event listener
	 * @returns {this}
	 */
	off(event, listener)
	{
		//Delegate event listeners to event emitter
		this.#emitter?.removeListener(event, this.#map.get(listener));
		//Return object so it can be chained
		return this;
	}


	/**
	 * removes all listeners, and causes future calls to all methods of
	 * this class to be no-ops (except `emit`, which will throw).
	 */
	stop()
	{
		//Remove listeners
		this.#emitter?.removeAllListeners();
		//Free mem
		this.#emitter = null;
	}
}

module.exports = Emitter;
