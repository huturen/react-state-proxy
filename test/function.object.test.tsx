// import { render } from "@testing-library/react";
// import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { stateProxy } from '../src/index';

function State() {
  const state = stateProxy({
    object: {
      abc: {
        efg: {
          hij: 'abc'
        }
      }
    },
  });
  const setHij = () => {
    state.object.abc.efg.hij = '123';
  };
  const delHij = () => {
    delete state.object.abc.efg.hij;
  };
  return (
    <div>
      <button data-testid="object" onClick={setHij}>{JSON.stringify(state.object)}</button>
      <button data-testid="delete" onClick={delHij}>{JSON.stringify(state.object)}</button>
    </div>
  )
}

it('object: should re-render when object chagned', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId("object");
  expect(btn.innerHTML).toBe('{"abc":{"efg":{"hij":"abc"}}}');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('{"abc":{"efg":{"hij":"123"}}}'));
});

it('object: should re-render when object deleted', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId("delete");
  expect(btn.innerHTML).toBe('{"abc":{"efg":{"hij":"abc"}}}');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('{"abc":{"efg":{}}}'));
});
