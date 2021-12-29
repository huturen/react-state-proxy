import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { stateProxy4CC } from '../src/index';

class State extends React.Component {
  statex = stateProxy4CC(this, {
    object: {
      abc: {
        efg: {
          hij: 'abc'
        }
      }
    },
  });

  render() {
    const setHij = () => {
      this.statex.object.abc.efg.hij = '123';
    };
    const delHij = () => {
      delete this.statex.object.abc.efg.hij;
    };
    return (
      <div>
        <button data-testid="object" onClick={setHij}>{JSON.stringify(this.statex.object)}</button>
        <button data-testid="delete" onClick={delHij}>{JSON.stringify(this.statex.object)}</button>
      </div>
    );
  }
}

it('object: should re-render when object chagned', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('object');
  expect(btn.innerHTML).toBe('{"abc":{"efg":{"hij":"abc"}}}');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('{"abc":{"efg":{"hij":"123"}}}'));
});

it('object: should re-render when object deleted', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('delete');
  expect(btn.innerHTML).toBe('{"abc":{"efg":{"hij":"abc"}}}');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('{"abc":{"efg":{}}}'));
});
