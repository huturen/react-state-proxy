// import { render } from "@testing-library/react";
// import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { asyncState, stateProxy } from '../src/index';

function ResolvedState() {
  const state = stateProxy({
    dynamic: asyncState(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'done';
    }, 'loading...'),
  });
  return (
    <div>
      <button data-testid="async">{state.dynamic.value}</button>
      <button data-testid="async-valueof">{state.dynamic+''}</button>
    </div>
  )
}

function RejectedState() {
  const state = stateProxy({
    dynamic: asyncState(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw new Error('rejected error');
    }, 'loading...', 'failed'),
  });
  return (
    <div>
      <button data-testid="async">{state.dynamic.value}</button>
    </div>
  )
}

function DefaultState() {
  const state = stateProxy({
    dynamic: asyncState(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      throw new Error('exception error');
    }),
  });
  return (
    <div>
      <button data-testid="default">{state.dynamic.value}</button>
    </div>
  )
}

it('async: should re-render when dynamic state resolved', async () => {
  const { getByTestId } = render(<ResolvedState />);

  const btn = getByTestId("async");
  expect(btn.innerHTML).toBe('loading...');

  await waitFor(() => expect(btn.innerHTML).toBe('done'));
});

it('async: should re-render when dynamic state rejected', async () => {
  const { getByTestId } = render(<RejectedState />);

  const btn = getByTestId("async");
  expect(btn.innerHTML).toBe('loading...');

  await waitFor(() => expect(btn.innerHTML).toBe('failed'));
});

it('async: should get the same state value by valueOf', async () => {
  const { getByTestId } = render(<ResolvedState />);

  const btn = getByTestId("async-valueof");
  expect(btn.innerHTML).toBe('loading...');

  await waitFor(() => expect(btn.innerHTML).toBe('done'));
});

it('async: should get a default value if not specified initialValue or fallbackValue', async () => {
  const { getByTestId } = render(<DefaultState />);

  const btn = getByTestId("default");
  expect(btn.innerHTML).toBe('');

  await waitFor(() => expect(btn.innerHTML).toBe(''));
});
