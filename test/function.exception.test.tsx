import { render } from '@testing-library/react';
import React from 'react';
import { stateProxy } from '../src/index';

it('number: should throw an exception when stateTarget was not an object', async () => {
  const State1 = () => stateProxy(0 as any);
  const original = console.error;
  console.error = jest.fn();
  try {
    render(<State1 />)
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }

  const State2 = () => stateProxy('str' as any);
  try {
    render(<State2 />)
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }

  const State3 = () => stateProxy(false as any);
  try {
    render(<State3 />)
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }
  console.error = original;
});
