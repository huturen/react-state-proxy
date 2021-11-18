import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { stateProxy } from '../src/index';

function State() {
  const state = stateProxy({
    counter: 0,
    async __init__() {
      await new Promise(resolve => setTimeout(resolve, 20));
      this.counter = 999;
    }
  });
  return (
    <div>
      <button data-testid="number">{state.counter}</button>
    </div>
  )
}

it('__init__: __init__ method should be called for function component', async () => {
  let btn = null;

  // To avoid: "Warning: An update to State inside a test was not wrapped in act(...)."
  act(() => {
    const { getByTestId } = render(<State />);
    btn = getByTestId("number");
  });

  expect(btn.innerHTML).toBe('0');
  waitFor(() => expect(btn.innerHTML).toBe('999'));
  // await call of 'save' function
  await new Promise(resolve => setTimeout(resolve, 1));
});
