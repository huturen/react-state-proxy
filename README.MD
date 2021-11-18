[![Build](https://api.travis-ci.com/huturen/react-state-proxy.svg?branch=main&status=passed)](https://app.travis-ci.com/github/huturen/react-state-proxy)
[![Latest version](https://img.shields.io/npm/v/react-state-proxy.svg?style=flat)](https://www.npmjs.com/package/react-state-proxy)
[![Coverage Status](https://coveralls.io/repos/github/huturen/react-state-proxy/badge.svg?branch=main)](https://coveralls.io/github/huturen/react-state-proxy?branch=main)
![License](https://img.shields.io/npm/l/react-state-proxy)


**English** | [中文](https://github.com/huturen/react-state-proxy/blob/main/README-CN.MD)

# react-state-proxy

The most simplified react state management library.

## Features

- Extremely easy to use
- Just one API to set it up
- Support for `Function Component` and `Class Component`
- Friendly for beginners
- Strong scalability for a large application
- Batched re-render
- Support for asynchronous state



## Introduction
React State Proxy is a react state management library that is extremely easy to use.
It supplys a new way to simplify your react state management with just one function to set up.


```jsx
import { stateProxy } from 'react-state-proxy';

export default function Hello() {
  const state = stateProxy({ num: 0 });

  return <button onClick={ () => state.num++ }>Count: {state.num}</button>;
}
```


## Motivation
In other react state libraris(such as `Redux`, `Recoil`, `Mobx`, `Akita`),
there is a tons of concepts to understand and lots of work to set it up.
You must follow the specified instructions which are hard to use and less flexible.

Quick look at problems with the other react state libraris:

* Steep learning curve
* Too much boilerplate code
* Too many concepts
* Hard to set up
* Not intuitive
* Difficult to achieve code-splitting

In some cases, I think, we just need a simple react state management that should be as simple as managing normal
javascript variables, without complex concepts and complicated API calls to set up. Less is more.


## Installation


NPM: `npm install react-state-proxy`

YARN: `yarn add react-state-proxy`



## Usage

### For function component:

You can use states just like normal javascript objects.

```jsx
import { stateProxy } from 'react-state-proxy';

export default function Hello() {
  const state = stateProxy({
    num: 0,
    arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    obj: {
      abc: 1234,
    },
    str: 'Hello',
  });
  return (
    <div>
      <div>
        <div>Num: {state.num}</div>
        <button onClick={() => state.num++}>Add num</button>
      </div>
      <div>
        <div>{JSON.stringify(state.arr)}</div>
        <button onClick={() => state.arr.push(state.arr.length)}>Push</button>
        <button onClick={() => state.arr.pop()}>Pop</button>
        <button onClick={() => state.arr.shift()}>Shfit</button>
      </div>
      <div>
        <div>Obj: {JSON.stringify(state.obj)}</div>
        <button onClick={() => (state.obj.abc = Math.random())}>Set obj.abc</button>
      </div>
      <div>
        <div>Str: {state.str}</div>
        <button onClick={() => (state.str += ' world')}>Append 'world' to str</button>
      </div>
    </div>
  );
}
```

### For class component:

You can use both native `state` and stateProxy's state.

```jsx
import { stateProxy4CC } from 'react-state-proxy';

export default class Welcome extends React.Component {
  state = {
    num: 0,
  };
  person = stateProxy4CC(this, {
    age: 0,
  });

  render() {
    return (
      <div>
        <button onClick={() => this.person.age++}>Age: {this.person.age}</button>
        <button onClick={() => this.setState((p) => ({ num: p.num + 1 }))}>Num: {this.state.num}</button>
      </div>
    );
  }
}

```

*Note:* Don't use stateProxy's state as native `state`.
It may conflict with native `setState` method in a class component.


```jsx
export default class Welcome extends React.Component {
  // DO NOT DO THIS:
  state = stateProxy4CC(this, {
    num: 0,
  });

  render() { ... }
}
```

## Advanced Usage

**code-splitting**:

For a large application, you can separate your state data from your business codes.

```tsx
// models/num.ts
import { stateWrapper } from 'react-state-proxy';
// In general, stateWrapper method is optional, however, it is needed
// if you want to manage your states outside of a React component.
export default stateWrapper({
  num: 0,
  inc() {
    this.num++;
  },
  get sum() {
    return this.num + 10;
  },
});

// components/business.tsx
import { stateProxy } from 'react-state-proxy';
import state from '@/models/num';

// You can manage the states outsite of a React component.
setInterval(state.inc, 2000);

export default function Hello() {
  const { num, inc, sum } = stateProxy(state);
  return (
    <div>
      <button onClick={inc}>{num}</button> + 10 = <span>{sum}</span>
    </div>
  );
}
```


**Async state**:

`react-state-proxy` supplys an optional function to manage your async states.
Note: The async function will only be initialized once.

```tsx
import { stateProxy, asyncState } from 'react-state-proxy';

export default function AsyncComponent() {
  const state = stateProxy({
    status: asyncState(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return 'done';
    }, 'loading...'),
  });

  // the text of the button below will be changed from 'loading...' to 'done' after 1 second.
  return <button>{state.status.value}</button>;
}
```

## Batched re-render
Multiple synchronous state mutations will not result in multiple re-renders.

```jsx
import { stateProxy } from 'react-state-proxy';

let times = 0;
export default function Hello() {
  const state = stateProxy({
    name: 'Lucy',
    age: 18,
    email: 'lucy@gmail.com',
  });

  const updateUser = () => {
    state.name = 'Lily';
    state.age++;
    state.email = 'lily@gmail.com';
  };
  console.log('times:', ++times);

  // [updateUser] will trigger only once re-render even though it mutates the state 3 times.
  return <button onClick={updateUser}>User: {JSON.stringify(state)}</button>;
}
```


## API
### stateWrapper<State extends object>(stateTarget: State)

It returns a proxied state which is non-reactive but can be managed outside of a React component.
You can subscribe it in `stateProxy`, which will trigger re-render when state changes.
In general, it's optional, except for managing states outside of a component.

### stateProxy<State extends object>(stateTarget: State)

Subscribe & create a reactive state object for `Function Component`.
It must be used within a function component or it's children.

### stateProxyForClassComponent<State extends object>(component: React.Component, stateTarget: State)

Subscribe & create a reactive state object for `Class Component`.
It must be used within a class component or it's children.

Alias:

* stateProxyForCC
* stateProxy4ClassComponent
* stateProxy4CC

*Note:* `stateProxy` can not be used in a class component and vice versa for `stateProxyForClassComponent`.

### asyncState(asyncFunction: Function, initialValue: any = null, fallbackValue: any = null)

Return a dynamic asynchronous state like below.

```ts
type AsyncState = {
  value: any; // The dynamic state value. To be one of initialValue, resolvedValue or fallbackValue.
  resolved: boolean; // It'll be updated after resolving of asyncFunction
  rejected: boolean | Error; // It'll be updated after rejecting of asyncFunction
  valueOf: Function;
};
```

- asyncFunction: The asynchronous function used to get the dynamic state.
- initialValue: Initial state value before calling *asyncFunction*.
- fallbackValue: Fallback state value when an exception occurs.


## License

`react-state-proxy` is licensed under the MIT license.
