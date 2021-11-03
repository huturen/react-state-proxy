# react-state-proxy


## Introduction
React State Proxy is a react state management library that is extremely easy to use.
It supplys a new way to simplify your react state management with just one function to set up.


```jsx
import { stateProxy } from 'react-state-proxy';

type State = {
  num: number;
};
export default function Hello() {
  const state: State = stateProxy({ num: 0 });
  return <button onClick={() => state.num++}>Count: {state.num}</button>;
}
```


## Motivation
In other react state libraris(such as `Redux`, `Recoil`, `Mobx`, `Akita`),
there is a tons of concepts to understand and lots of work to set it up.
You must follow the specified instructions which is hard to use and less flexible.

Quick look at problems with the other react state libraris:

* Steep learning curve
* Too much boilerplate code
* Re-structure your project
* Lacks concurrent mode support
* Not intuitive
* Difficult to achieve code-splitting

In some cases, I think, we just need a simple react state management without complex concepts
and complicated API calls to set up. The state management should be as simple as managing normal
javascript variables.


## Installation


NPM: `npm install react-state-proxy`

YARN: `yarn add react-state-proxy`



## Usage


### For function component:

```jsx
import { stateWrapper as stateProxy } from 'react-state-proxy';

type State = {
  num: number;
  arr: any[];
  obj: Record<string, any>;
  str: string;
};
export default function Hello() {
  const state: State = stateProxy({
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
        <button onClick={() => state.arr.push(state.arr.length)}>Array push</button>
        <button onClick={() => state.arr.pop()}>Array pop</button>
        <button onClick={() => state.arr.shift()}>Array shfit</button>
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

```jsx
import { stateProxy4ClassComponent } from 'react-state-proxy';

export default class Welcome extends React.Component {
  state = stateProxy4ClassComponent(this, {
    num: 0,
  });

  render() {
    return (
      <div>
        <h1>Num: {this.state.num}</h1>
        <button onClick={() => this.state.num++}>Add</button>
      </div>
    );
  }
}
```


## License

react-state-proxy is licensed under the MIT license.
