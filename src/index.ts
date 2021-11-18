import { Component, useLayoutEffect, useState } from 'react';
// import { Component, useEffect, useState } from 'react';

type Target = Record<string, any>;

function isObjOrArr(obj: any) {
  return {}.toString.call(obj) === '[object Object]' || {}.toString.call(obj) === '[object Array]';
}

function isObj(obj: any) {
  return {}.toString.call(obj) === '[object Object]';
}

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
    getAsyncState: async (proxy: object) => {
      try {
        const result = await asyncFunction.call(proxy);
        res.value = result;
        res.resolved = true;
      } catch (err: any) {
        res.value = fallbackValue;
        res.rejected = err;
      }
    },
  };
  return res;
}

// The same as asyncState, but with different parameters
export function async(initialValue: any, asyncFunction: Function, fallbackValue: any = null) {
  return asyncState(asyncFunction, initialValue, fallbackValue);
}

// subscribers: Map<setStateFunction, cachedStateProxy>
const subscribers: Map<Function, Target> = new Map();

const stateProxySymbol = Symbol('stateProxySymbol');
export function stateWrapper<State extends Target>(stateTarget: State): State {
  if (!isObj(stateTarget)) {
    throw new Error('react-state-proxy[stateWrapper]: The [stateTarget] must be an object.');
  }
  if (stateTarget.____rsp_proxy____ === stateProxySymbol) {
    return stateTarget;
  }

  let timer: NodeJS.Timeout;

  const wrap = (obj: any) => {
    // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
    return isObjOrArr(obj) && obj.____rsp_proxy____ !== stateProxySymbol ? new Proxy(obj, handler) : obj;
  };

  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // fix setTimeout violation problem
      Promise.resolve().then(() => {
        for (const [setStateFun, cachedProxy] of subscribers) {
          if (proxy === cachedProxy || stateTarget === cachedProxy.____rsp_target____) {
            // trigger re-render, only for the same state target
            setStateFun({});
          }
        }
      });
    });
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      // react state proxy object identity
      if (key === '____rsp_proxy____') {
        return stateProxySymbol;
      }
      // original state target identity
      if (key === '____rsp_target____' && target === stateTarget) {
        return stateTarget;
      }
      // bind proxy object for function configuration option
      const res = wrap(Reflect.get(target, key, receiver));
      if (typeof res === 'function' && target === stateTarget) {
        return res.bind(proxy);
      }
      return res;
    },

    set(target: Target, key: string, value: any, receiver: any) {
      const prev = Reflect.get(target, key as string, receiver);
      const res = Reflect.set(target, key as string, wrap(value), receiver);
      // avoid unnecessary re-render
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

  const proxy = new Proxy(stateTarget as State, handler) as State;
  initializeStateTarget(stateTarget, proxy, save);
  return proxy;
}

function initializeStateTarget(stateData: Target, proxy: object, save: Function) {
  for (let key in stateData) {
    const item = stateData[key];
    if (isObj(item) && item.asyncStateSymbol === asyncStateSymbol) {
      delete item.asyncStateSymbol;
      item.getAsyncState(proxy).finally(() => save());
      delete item.getAsyncState;
    } else if (key === '__init__' && typeof item === 'function') {
      delete stateData[key];
      (async () => {
        await item.call(proxy);
        save();
      })();
    }
  }
}

export function stateProxy<State extends Target>(stateTarget: State): State {
  if (!isObj(stateTarget)) {
    throw new Error('react-state-proxy[stateWrapper]: The [stateTarget] must be an object.');
  }
  const [, setState] = useState({});

  // wrap the specified stateTarget & add proxy instance to the subscriber list
  if (!subscribers.has(setState)) {
    subscribers.set(setState, stateWrapper(stateTarget));
  }

  useLayoutEffect(() => {
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return subscribers.get(setState) as State;
}

export function stateProxyForClassComponent<State extends Target>(component: Component, stateTarget: State) {
  if (!isObj(stateTarget)) {
    throw new Error('react-state-proxy[stateProxyForClassComponent]: The [stateTarget] must be an object.');
  }

  // bind is required here, otherwise setState will always point to the same object even if different components
  const setState = component.setState.bind(component);
  if (!subscribers.has(setState)) {
    subscribers.set(setState, stateWrapper(stateTarget));
  }

  const original = component.componentWillUnmount?.bind(component);
  component.componentWillUnmount = function () {
    subscribers.delete(setState);
    return original?.();
  };

  return subscribers.get(setState) as State;
}

// alias
export const createState = stateWrapper;
export const stateProxyForCC = stateProxyForClassComponent;
export const stateProxy4ClassComponent = stateProxyForClassComponent;
export const stateProxy4CC = stateProxyForClassComponent;
