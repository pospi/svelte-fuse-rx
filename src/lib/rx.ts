import { BehaviorSubject, ReplaySubject } from "rxjs";
import type { TimestampProvider } from 'rxjs'
import { init } from "svelte/internal";

// `BehaviorSubject` flavour: emits last set value to new subscribers.
// Mostly copied from Ben Lesh's implementation here: https://github.com/ReactiveX/rxjs/issues/4740#issuecomment-490601347
// THANK YOU BEN

class RXWritable extends BehaviorSubject<any> {
  // Enables Svelte bindings and direct assignments, for example:
  // - bind:value={$rxWritable}
  // - $rxWritable = newValue
  // - rxWritable.set(newValue)
  set(value: any) {
    super.next(value)
  }

  // Enables calling the Svelte writable's update() method
  // and receiving the current value as an argument for convenience, for example:
  // rxWritable.update(currentValue => {
  //    return {
  //      ...currentValue,
  //      name: "newName"
  //    }
  // })
  update(callback: any) {
    const nextValue = callback(super.value);
    super.next(nextValue)
  }
}

export function rxWritable(initialValue: any): any {
  return new RXWritable(initialValue)
}

// `ReplaySubject` flavour: emits all previously set values to new subscribers.

class RXReplayableWritable<T> extends ReplaySubject<any> {
  protected _value: any

  constructor() {
    const [ initialValue, ...args ] = arguments
    super(...args)
    if (initialValue !== undefined) {
      this.set(initialValue)
    }
  }

  set(value: any) {
    super.next((this._value = value))
  }

  update(callback: any) {
    const nextValue = callback(this._value)
    this.set(nextValue)
  }
}

export function rxReplayableWritable(initialValue: any): any {
  //@ts-ignore variadic arguments
  return new RXReplayableWritable(initialValue)
}
