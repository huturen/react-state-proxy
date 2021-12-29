/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/react';
import React from 'react';
import { stateProxy4CC } from '../src/index';

class State1 extends React.Component {
  statex = stateProxy4CC(this, 0 as any);
}
class State2 extends React.Component {
  statex = stateProxy4CC(this, 0 as any);
}
class State3 extends React.Component {
  statex = stateProxy4CC(this, 0 as any);
}

it('exception: should throw an exception when stateTarget was not an object', async () => {
  const original = console.error;
  console.error = jest.fn();
  try {
    render(<State1 />);
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }

  try {
    render(<State2 />);
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }

  try {
    render(<State3 />);
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }
  console.error = original;
});
