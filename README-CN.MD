[![Build](https://api.travis-ci.com/huturen/react-state-proxy.svg?branch=main&status=passed)](https://app.travis-ci.com/github/huturen/react-state-proxy)
[![Latest version](https://img.shields.io/npm/v/react-state-proxy.svg?style=flat)](https://www.npmjs.com/package/react-state-proxy)
[![Coverage Status](https://coveralls.io/repos/github/huturen/react-state-proxy/badge.svg?branch=main)](https://coveralls.io/github/huturen/react-state-proxy?branch=main)
![License](https://img.shields.io/npm/l/react-state-proxy)


**中文** | [English](https://github.com/huturen/react-state-proxy/blob/main/README.MD)


# react-state-proxy

极简react状态管理。

## 特性

- 极其容易使用
- 只需一个API调用就能设置完毕
- 支持函数及类组件
- 对新手相当友好
- 针对大型应用有极强的可扩展性
- 批量重渲染
- 支持异步状态



## 简介
`React State Proxy`是一个react状态管理库。极易使用。其提供了一个新的方式来简化你的状态管理。


```jsx
import { stateProxy } from 'react-state-proxy';

export default function Hello() {
  const state = stateProxy({ num: 0 });

  return <button onClick={ () => state.num++ }>Count: {state.num}</button>;
}
```


## 写此库的动机
目前业界的一些其它状态管理库（如：`Redux`, `Recoil`, `Mobx`, `Akita`），设计过于雕琢，
成堆的概念，设置复杂，使用起来极其不方便，管理一个简单的状态，往往要书写很多的代码，不灵活。

目前现存的其它状态管理库的一些问题：

* 陡峭的学习曲线
* 太多的样板、套路代码
* 过于雕琢、概念成堆
* 设置复杂
* 理解起来非常不直观
* 难于实现代码分割

从大多数案例来看，我认为，我们只需要一个简单的状态管理库，不需要过多复杂的概念及难以处理的API调用。

状态管理应该像管理普通javascript对象那样简单，那样自然。正所谓，重剑无锋大巧不工。


## 安装


NPM: `npm install react-state-proxy`

YARN: `yarn add react-state-proxy`



## 使用

### 针对函数组件:

可以像普通javascript对象那样，来管理你的状态。

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

### 针对类组件:

你可以同时使用类组件提供的本地`state`及stateProxy返回的状态对象，两者不冲突。

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

*注意:* 不用使用stateProxy的状态对象来替换类组件中的原生`state`对象， 它会和类组件中的原生`setState`方法冲突。
```jsx
export default class Welcome extends React.Component {
  // 不要像下面这样使用:
  state = stateProxy4CC(this, {
    num: 0,
  });

  render() { ... }
}
```

## 高级使用方式

**代码分离**:

针对大型应用而言，你可能需要将你的状态数据和你的业务代码分离。

```tsx
// models/num.ts
import { stateProxy } from 'react-state-proxy';

// 注意：[stateTarget] 需要放置在 modelNum 方法外面。
// 如果你想在多个组件中共享同一个状态， [stateTarget]需要指向同一个对象。
const stateTarget = { num: 0 };
export default function modelNum() {
  const state = stateProxy(stateTarget);
  return {
    inc() {
      state.num++;
    },
    get num() {
      return state.num;
    },
    get sum() {
      return state.num + 10;
    },
  };
}

// components/business.tsx
import modelNum from '@/models/num';
export default function Hello() {
  const { num, inc, sum } = modelNum();
  return (
    <div>
      <button onClick={inc}>{num}</button> + 10 = <span>{sum}</span>
    </div>
  );
}
```

或者使用另外一种方式， 直接用 `stateProxy` 代理目标状态对象。

```tsx
// models/num.ts
export default {
  num: 0,
  inc() {
    this.num++;
  },
  get sum() {
    return this.num + 10;
  },
};

// components/business.tsx
import { stateProxy } from 'react-state-proxy';
import modelData from '@/models/num';
export default function Hello() {
  const { num, inc, sum } = stateProxy(modelData);
  return (
    <div>
      <button onClick={inc}>{num}</button> + 10 = <span>{sum}</span>
    </div>
  );
}
```


**异步状态**: 支持在异步方法中变更状态。

```tsx
// 方式 1: react-state-proxy 提供了一个可选的方法来管理你的异步状态。
import { stateProxy, asyncState } from 'react-state-proxy';

export default function AsyncComponent() {
  const state = stateProxy({
    status: asyncState(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return 'done';
    }, 'loading...'),
  });

  // 1秒后，下面按钮的文本将从 'loading...' 变成 'done'。
  return <button>{state.status.value}</button>;
}

// 方式 2: 使用 __init__ 方法
import { stateProxy } from 'react-state-proxy';

export default function AsyncComponent() {
  const state = stateProxy({
    status: 'pending',
    // 当stateProxy 初始化时， __init__ 会被自动调用
    async __init__() {
      this.status = 'loading';
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.status = 'loaded';
    },
  });
  return <button>{state.status}</button>;
}
```


## 批量重渲染
多个同步的状态变更不会引起多次重新渲染。

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

  // 在 [updateUser]方法中，尽管状态改变了3次，但只会触发一次重渲染。
  return <button onClick={updateUser}>User: {JSON.stringify(state)}</button>;
}
```


## API

### stateProxy<State extends object>(stateTarget: State)

针对函数组件，创建一个响应式的状态对象, 这个方法只能在函数组件或其子方法中调用。

### stateProxyForClassComponent<State extends object>(component: React.Component, stateTarget: State)

针对类组件，创建一个响应式的状态对象, 这个方法只能在类组件或其子方法中调用，创建的对象不能替换原生的`state`对象。

别名:

* stateProxyForCC
* stateProxy4ClassComponent
* stateProxy4CC

*注意:* `stateProxy` 不能用在类组件中，同样的，`stateProxyForClassComponent`也不能用于函数组件中。


### asyncState(asyncFunction: Function, initialValue: any = '', fallbackValue?: any)

返回一个异步状态，其数据结构如下所示：

```ts
type AsyncState = {
  value: any; // 动态状态值, 这个值将会是 initialValue、resolvedValue 或 fallbackValue 中的一个
  resolved: boolean; // 如果asyncFunction执行成功，这个值将被设置成 true
  rejected: boolean | Error; // 如果asyncFunction执行失败，这个值将被设置成 抛出的异常错误信息
  valueOf: Function;
};
```

- asyncFunction: 异步函数，用于获取动态状态。
- initialValue: 调用 *asyncFunction* 前的初始状态值。
- fallbackValue: 执行异常时的状态值。


### async(initialValue: any, asyncFunction: Function, fallbackValue: any = null)

`asyncState`的另一个更短的可选版本， 表现和`asyncState`一样, 只是参数顺序不一样。


## License

`react-state-proxy` is licensed under the MIT license.
