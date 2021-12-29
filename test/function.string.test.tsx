// import { render } from "@testing-library/react";
// import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { stateProxy } from '../src/index';

function State() {
  const state = stateProxy({
    string: 'hello',
  });
  return (
    <div>
      <button data-testid="string" onClick={() => state.string += 'world'}>{state.string}</button>
    </div>
  );
}

it('string: should re-render when string chagned', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('string');
  expect(btn.innerHTML).toBe('hello');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('helloworld'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('helloworldworld'));
});
