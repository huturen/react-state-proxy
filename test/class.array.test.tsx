import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { stateProxy4CC } from '../src/index';

class State extends React.Component {
  statex = stateProxy4CC(this, {
    array: [0, 1, 2, 3],
  });

  render(){
    return (
      <div>
        <button data-testid="array-push" onClick={() => this.statex.array.push(this.statex.array.length)}>
          {this.statex.array.join(',')}
        </button>
        <button data-testid="array-pop" onClick={() => this.statex.array.pop()}>
          {this.statex.array.join(',')}
        </button>
        <button data-testid="array-shift" onClick={() => this.statex.array.shift()}>
          {this.statex.array.join(',')}
        </button>
        <button data-testid="array-unshift" onClick={() => this.statex.array.unshift(999)}>
          {this.statex.array.join(',')}
        </button>
        <button data-testid="array-splice" onClick={() => this.statex.array.splice(0, 1)}>
          {this.statex.array.join(',')}
        </button>
        <button data-testid="array-assign" onClick={() => this.statex.array = [11, 22, 33]}>
          {this.statex.array.join(',')}
        </button>
      </div>
    );
  }
}

it('array-push: should re-render when array pushed', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('array-push');
  expect(btn.innerHTML).toBe('0,1,2,3');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('0,1,2,3,4'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('0,1,2,3,4,5'));
});

it('array-pop: should re-render when array poped', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('array-pop');
  expect(btn.innerHTML).toBe('0,1,2,3');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('0,1,2'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('0,1'));
});

it('array-shift: should re-render when array shifted', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('array-shift');
  expect(btn.innerHTML).toBe('0,1,2,3');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('1,2,3'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('2,3'));
});

it('array-unshift: should re-render when array unshifted', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('array-unshift');
  expect(btn.innerHTML).toBe('0,1,2,3');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('999,0,1,2,3'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('999,999,0,1,2,3'));
});

it('array-splice: should re-render when array spliced', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('array-splice');
  expect(btn.innerHTML).toBe('0,1,2,3');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('1,2,3'));

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('2,3'));
});

it('array-assign: should re-render when array assigned', async () => {
  const { getByTestId } = render(<State />);

  const btn = getByTestId('array-assign');
  expect(btn.innerHTML).toBe('0,1,2,3');

  fireEvent.click(btn);
  await waitFor(() => expect(btn.innerHTML).toBe('11,22,33'));
});
