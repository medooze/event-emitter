# medooze-event-emitter

This is a modified version of Node.js [`EventEmitter` class][event-emitter] for use within Medooze's codebase.

It's exported directly by this module, and meant to be extended rather than used as a standalone object.

The changes are:

 - the event definitions are type checked (see below)
 - `emit()` is marked protected to prevent it from accidentally being called from outside of the class
 - only a small subset of the API is exported (we can expand it if needed)
 - the `maxListener` limit is removed
 - implements an additional `stop()` method, which removes all listeners and causes future calls (except `emit()`) to be no-ops

## Use with type checking

Using the same mechanism as **[tiny-typed-emitter][]**, this class allows users to declare the events that a class may emit, as well as the arguments each one accepts. Calls to `on()` / `once()` / `emit()` are then typechecked accordingly.

Usage is as follows: projects that use type checking must supply an interface as generic parameter to the class when extending it. Each property of this interface is an event, and its type must be that of the listener (a function accepting some arguments and returning `void`).

Here's an example of how that would look in a project that uses JSDoc annotations (see [tiny-typed-emitter][] for an example using TypeScript syntax):

~~~ js
const Emitter = require("medooze-event-emitter");

/**
 * @typedef {Object} SubscriptionEvents
 * @property {(transport: Transport, kind: boolean) => void} inited - subscription has initialized
 * @property {() => void} stopped - subscription has stopped
 */

/** @extends {Emitter<SubscriptionEvents>} */
class Subscription extends Emitter {
    // ...
}
~~~

Here we define a `Subscription` class that may emit two events: `stopped`, with no arguments, and `inited` with an argument of type `Transport` and another of type `boolean`.


[event-emitter]: https://nodejs.org/api/events.html
[tiny-typed-emitter]: https://www.npmjs.com/package/tiny-typed-emitter
