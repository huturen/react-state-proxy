import { Component, useEffect, useState } from 'react';

type Target = Record<string, any> | any[];

function isObjOrArr(obj: any) {
  return {}.toString.call(obj) === '[object Object]' || {}.toString.call(obj) === '[object Array]';
}

export function stateProxy<State extends object>(stateTarget: State): State {
  if (!isObjOrArr(stateTarget)) {
    throw new Error('react-state-proxy[stateProxy]: The [stateTarget] must be an object.');
  }

  let timer: NodeJS.Timeout;
  useEffect(() => {
    return () => clearTimeout(timer);
  }, []);

  // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____rsp_proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => setState(new Proxy(stateTarget, handler)));
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

  const [state, setState] = useState<any>(new Proxy(stateTarget, handler));
  return state as State;
}

export function stateProxyForClassComponent<State extends object>(component: Component, stateTarget: State): State {
  if (!isObjOrArr(stateTarget)) {
    throw new Error('react-state-proxy[stateProxyForClassComponent]: The [stateTarget] must be an object.');
  }

  let timer: NodeJS.Timeout;
  const original = component.componentWillUnmount?.bind(component);
  component.componentWillUnmount = function () {
    clearTimeout(timer);
    return original?.();
  };

  // Instead of using Symbol.toStringTag, we use ____rsp_proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____rsp_proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      component.setState({}); // trigger render
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
