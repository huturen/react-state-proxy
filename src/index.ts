// react-state-proxy
import React, { useState } from 'react';

type Target = Record<string, any> | any[];

function isObjOrArr(obj: any) {
  return {}.toString.call(obj) === '[object Object]' || {}.toString.call(obj) === '[object Array]';
}

let saveStateTimer: NodeJS.Timeout;
export function stateWrapper(stateData: any): any {
  if (!isObjOrArr(stateData)) {
    throw new Error('react-state-proxy[stateWrapper]: The [stateData] must be an object or an array.');
  }

  // Instead of using Symbol.toStringTag, we use ____proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(saveStateTimer);
    saveStateTimer = setTimeout(() => setState(new Proxy(stateData, handler)));
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      return key === '____proxy____' ? true : wrap(Reflect.get(target, key, receiver));
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

  const [state, setState] = useState<any>(new Proxy(stateData, handler));
  return state;
}

let saveStateTimer4class: NodeJS.Timeout;
export function stateWrapperForClassComponent(component: React.Component, stateData: any): any {
  if (!isObjOrArr(stateData)) {
    throw new Error('react-state-proxy[stateWrapper]: The [stateData] must be an object or an array.');
  }

  // Instead of using Symbol.toStringTag, we use ____proxy____ property to check Proxy instance.
  const wrap = (obj: any) => (isObjOrArr(obj) && !obj.____proxy____ ? new Proxy(obj, handler) : obj);
  const save = () => {
    clearTimeout(saveStateTimer4class);
    saveStateTimer4class = setTimeout(() => {
      component.setState(new Proxy(stateData, handler));
      component.state = new Proxy(stateData, handler);
    });
  };

  const handler = {
    get(target: Target, key: string, receiver: any): any {
      return key === '____proxy____' ? true : wrap(Reflect.get(target, key, receiver));
    },
    set(target: Target, key: string, value: any, receiver: any) {
      console.log('set:', key, value);
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
  return new Proxy(stateData, handler);
}

// alias
export const stateProxy = stateWrapper;
export const stateProxyForClassComponent = stateWrapperForClassComponent;
export const stateProxy4ClassComponent = stateWrapperForClassComponent;
