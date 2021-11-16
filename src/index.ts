import { Component, useLayoutEffect, useState } from 'react';
// import { Component, useEffect, useState } from 'react';

type Target = Record<string, any> | any[];

function isObjOrArr(obj: any) {
  return {}.toString.call(obj) === '[object Object]' || {}.toString.call(obj) === '[object Array]';
}

function isObj(obj: any) {
  return {}.toString.call(obj) === '[object Object]';
}

// function isPrimitive(variable: any) {
//   return (
//     typeof variable === 'number' ||
//     typeof variable === 'string' ||
//     typeof variable === 'boolean' ||
//     typeof variable === 'undefined' ||
//     typeof variable === 'symbol' ||
//     variable === null
//   );
// }

type AsyncState = {
  value: any; // The dynamic state value. To be one of initialValue, resolvedValue or fallbackValue.
  resolved: boolean; // It'll be updated after resolving of asyncFunction
  rejected: boolean | Error; // It'll be updated after rejecting of asyncFunction
  valueOf: Function;
  asyncStateSymbol?: Symbol;
  getAsyncState?: Function;
};

const asyncStateSymbol = Symbol('asyncState');
export function asyncState(asyncFunction: Function, initialValue: any = null, fallbackValue: any = null) {
  const res: AsyncState = {
    value: initialValue,
    resolved: false,
    rejected: false,
    valueOf() {
      return res.value;
    },
    asyncStateSymbol,
    getAsyncState: async () => {
      try {
        const result = await asyncFunction();
        res.value = result;
        res.resolved = true;
      } catch (err: any) {
        res.rejected = err;
        res.value = fallbackValue;
      }
    },
  };
  return res;
}

// The same as asyncState, but with different parameters
export function async(initialValue: any, asyncFunction: Function, fallbackValue: any = null) {
  return asyncState(asyncFunction, initialValue, fallbackValue);
}

const subscribers: Map<Function, object> = new Map();

export function stateProxy<State extends object>(stateTarget: State): State {
  if (!isObj(stateTarget)) {
    throw new Error('react-state-proxy[stateProxy]: The [stateTarget] must be an object.');
  }
  const [, setState] = useState({});
  if (!subscribers.has(setState)) {
    subscribers.set(setState, stateTarget); // add subscriber & set a cache
  }
  const stateData: Record<string, any> = subscribers.get(setState)!;

  let timer: NodeJS.Timeout;
  useLayoutEffect(() => {
    return () => {
      clearTimeout(timer);
      subscribers.delete(setState);
    };
  }, []);

  // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____rsp_proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      Promise.resolve().then(() => {
        for (const [setStateFun, cachedStateTarget] of subscribers) {
          // trigger re-render, only for the same state target
          if (stateData === cachedStateTarget) {
            setStateFun({});
          }
        }
      });
    });
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      return key === '____rsp_proxy____' ? true : wrap(Reflect.get(target, key, receiver));
    },
    set(target: Target, key: string, value: any, receiver: any) {
      const prev = Reflect.get(target, key, receiver);
      const res = Reflect.set(target, key, wrap(value), receiver);
      if (prev !== value) {
        save();
      }
      return res;
    },
    deleteProperty(target: Target, key: string) {
      const res = Reflect.deleteProperty(target, key);
      save();
      return res;
    },
  };

  const proxy = new Proxy(stateData as State, handler) as State;
  initializeStates(stateData, proxy, save);
  return proxy;
}

function initializeStates(stateData: Record<string, any>, proxy: object, save: Function) {
  for (let key in stateData) {
    const item = stateData[key];
    if (isObj(item) && item.asyncStateSymbol === asyncStateSymbol) {
      delete item.asyncStateSymbol;
      item.getAsyncState().finally(() => save());
      delete item.getAsyncState;
    } else if (key === '__init__' && typeof item === 'function') {
      delete stateData[key];
      (async () => {
        await item.call(stateData);
        save();
      })();
    } else if (typeof item === 'function') {
      // bind this for function configuration
      stateData[key] = stateData[key].bind(proxy);
    }
  }
}

export function stateProxyForClassComponent<State extends object>(component: Component, stateTarget: State): State {
  if (!isObj(stateTarget)) {
    throw new Error('react-state-proxy[stateProxyForClassComponent]: The [stateTarget] must be an object.');
  }

  // bind is required here, otherwise setState will always point to the same object even if different components
  const setState = component.setState.bind(component);
  if (!subscribers.has(setState)) {
    subscribers.set(setState, stateTarget);
  }
  const stateData: Record<string, any> = subscribers.get(setState)!;

  let timer: NodeJS.Timeout;
  const original = component.componentWillUnmount?.bind(component);
  component.componentWillUnmount = function () {
    clearTimeout(timer);
    subscribers.delete(setState);
    return original?.();
  };

  // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____rsp_proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      Promise.resolve().then(() => {
        for (const [setStateFun, cachedStateTarget] of subscribers) {
          // trigger re-render, only for the same state target
          if (stateData === cachedStateTarget) {
            setStateFun({});
          }
        }
      });
    });
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      return key === '____rsp_proxy____' ? true : wrap(Reflect.get(target, key, receiver));
    },
    set(target: Target, key: string, value: any, receiver: any) {
      const prev = Reflect.get(target, key, receiver);
      const res = Reflect.set(target, key, wrap(value), receiver);
      if (prev !== value) {
        save();
      }
      return res;
    },
    deleteProperty(target: Target, key: string) {
      const res = Reflect.deleteProperty(target, key);
      save();
      return res;
    },
  };

  const proxy = new Proxy(stateData!, handler) as State;
  initializeStates(stateData, proxy, save);
  return proxy;
}

export const stateProxyForCC = stateProxyForClassComponent;
export const stateProxy4ClassComponent = stateProxyForClassComponent;
export const stateProxy4CC = stateProxyForClassComponent;
