import { Component, useEffect, useState } from 'react';

type Target = Record<string, any> | any[];

function isObjOrArr(obj: any) {
  return {}.toString.call(obj) === '[object Object]' || {}.toString.call(obj) === '[object Array]';
}

// All state targets
const targets: Map<object, Set<Function>> = new Map();

export function stateProxy<State extends object>(stateTarget: State): State {
  if (!isObjOrArr(stateTarget)) {
    throw new Error('react-state-proxy[stateProxy]: The [stateTarget] must be an object.');
  }
  if (!targets.has(stateTarget)) {
    targets.set(stateTarget, new Set());
  }
  const subscribers: Set<Function> = targets.get(stateTarget)!;

  const [, setState] = useState({});
  subscribers.add(setState);

  let timer: NodeJS.Timeout;
  useEffect(() => {
    return () => {
      clearTimeout(timer);
      subscribers.clear();
      targets.delete(stateTarget);
    };
  }, []);

  // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____rsp_proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      for (const setStateFun of subscribers) {
        setStateFun({}); // trigger re-render
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

  return new Proxy(stateTarget, handler) as State;
}

export function stateProxyForClassComponent<State extends object>(component: Component, stateTarget: State): State {
  if (!isObjOrArr(stateTarget)) {
    throw new Error('react-state-proxy[stateProxyForClassComponent]: The [stateTarget] must be an object.');
  }

  if (!targets.has(stateTarget)) {
    targets.set(stateTarget, new Set());
  }
  const subscribers: Set<Function> = targets.get(stateTarget)!;
  subscribers.add(component.setState.bind(component));

  let timer: NodeJS.Timeout;
  const original = component.componentWillUnmount?.bind(component);
  component.componentWillUnmount = function () {
    clearTimeout(timer);
    subscribers.clear();
    targets.delete(stateTarget);
    return original?.();
  };

  // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____rsp_proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      for (const setStateFun of subscribers) {
        setStateFun({}); // trigger re-render
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
  return new Proxy(stateTarget, handler) as State;
}

// alias
export const createState = stateProxy;

export const stateProxyForCC = stateProxyForClassComponent;
export const stateProxy4ClassComponent = stateProxyForClassComponent;
export const stateProxy4CC = stateProxyForClassComponent;
export const createState4ClassComponent = stateProxyForClassComponent;
export const createState4CC = stateProxyForClassComponent;
