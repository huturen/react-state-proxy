// import { render } from "@testing-library/react";
// import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { stateProxy4CC } from '../src/index';

class State extends React.Component {
  statex = stateProxy4CC(this, {
    counter: 0,
    async __init__() {
      await new Promise(resolve => setTimeout(resolve, 20));
      this.counter = 999;
    }
  });

  render() {
    return (
      <div>
        <button data-testid="number">{this.statex.counter}</button>
      </div>
    )
  }
}

it('__init__: __init__ method should be called for class component', async () => {
  let btn = null;

  // To avoid: "Warning: An update to State inside a test was not wrapped in act(...)."
  act(() => {
    const { getByTestId } = render(<State />);
    btn = getByTestId("number");
  });

  expect(btn.innerHTML).toBe('0');
  waitFor(() => expect(btn.innerHTML).toBe('999'));
});
