// import { render } from "@testing-library/react";
// import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { stateProxy } from '../src/index';

const stateTarget = {
  counter: 0,
}
function ModelState() {
  const state = stateProxy(stateTarget);
  return (
    <div>
      <button data-testid="number" onClick={() => state.counter++}>{state.counter}</button>
    </div>
  )
}

it('model: should re-render when stateTarget chagned', async () => {
  const { getByTestId } = render(<ModelState />);

  const btn = getByTestId("number");
  expect(btn.innerHTML).toBe('0');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('1'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('2'));
});

it('model: should get updated state when the second ModelState initialized', async () => {
  const { getByTestId } = render(<ModelState />);

  const btn = getByTestId("number");
  expect(btn.innerHTML).toBe('2');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('3'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('4'));
});
