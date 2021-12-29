// import { render } from "@testing-library/react";
// import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { stateProxy } from '../src/index';

function State() {
  const state = stateProxy({
    counter: 0,
  });
  return (
    <div>
      <button data-testid="number" onClick={() => state.counter++}>{state.counter}</button>
    </div>
  );
}

it('number: should re-render when counter chagned', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('number');
  expect(btn.innerHTML).toBe('0');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('1'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('2'));
});
