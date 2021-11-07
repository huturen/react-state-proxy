import { Component, useEffect, useState } from 'react';

type Target = Record<string, any> | any[];

function isObjOrArr(obj: any) {
  return {}.toString.call(obj) === '[object Object]' || {}.toString.call(obj) === '[object Array]';
}

function isObj(obj: any) {
  return {}.toString.call(obj) === '[object Object]';
}

type AsyncState = {
  value: any; // The dynamic state value. To be one of initialValue, resolvedValue or fallbackValue.
  resolved: any; // It'll be updated after resolving of asyncFunction
  rejected: any; // It'll be updated after rejecting of asyncFunction
  valueOf: Function;
  asyncStateSymbol?: Symbol;
  getAsyncState?: Function;
};

const asyncStateSymbol = Symbol('asyncState');
export function asyncState(asyncFunction: Function, initialValue: any = '', fallbackValue?: any) {
  const getAsyncState = async () => {
    try {
      const result = await asyncFunction();
      res.value = result;
      res.resolved = result;
    } catch (err: any) {
      res.rejected = err;
      if (fallbackValue === undefined) {
        throw err;
      } else {
        res.value = fallbackValue;
      }
    }
  };
  const res: AsyncState = {
    value: initialValue,
    resolved: false,
    rejected: false,
    valueOf() {
      return res.value;
    },
    asyncStateSymbol,
    getAsyncState,
  };
  return res;
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
  useEffect(() => {
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
      for (const [setStateFun, cachedStateTarget] of subscribers) {
        // trigger re-render, only for the same state target
        if (stateData === cachedStateTarget) {
          setStateFun({});
        }
      }
    });
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      return key === '____rsp_proxy____' ? true : wrap(Reflect.get(target, key, receiver));
    },
    set(target: Target, key: string, value: any, receiver: any) {
      const res = Reflect.set(target, key, wrap(value), receiver);
      save();
      return res;
    },
    deleteProperty(target: Target, key: string) {
      const res = Reflect.deleteProperty(target, key);
      save();
      return res;
    },
  };

  initializeAsyncStates(stateData, save);
  return new Proxy(stateData as State, handler) as State;
}

function initializeAsyncStates(stateData: Record<string, any>, save: Function) {
  for (let key in stateData) {
    const item = stateData[key];
    if (isObj(item) && item.asyncStateSymbol === asyncStateSymbol) {
      item.getAsyncState().finally(() => {
        delete item.asyncStateSymbol;
        delete item.getAsyncState;
        save();
      });
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
      for (const [setStateFun, cachedStateTarget] of subscribers) {
        // trigger re-render, only for the same state target
        if (stateData === cachedStateTarget) {
          setStateFun({});
        }
      }
    });
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      return key === '____rsp_proxy____' ? true : wrap(Reflect.get(target, key, receiver));
    },
    set(target: Target, key: string, value: any, receiver: any) {
      const res = Reflect.set(target, key, wrap(value), receiver);
      save();
      return res;
    },
    deleteProperty(target: Target, key: string) {
      const res = Reflect.deleteProperty(target, key);
      save();
      return res;
    },
  };

  initializeAsyncStates(stateData, save);
  return new Proxy(stateData!, handler) as State;
}

// alias
export const stateProxyForCC = stateProxyForClassComponent;
export const stateProxy4ClassComponent = stateProxyForClassComponent;
export const stateProxy4CC = stateProxyForClassComponent;
