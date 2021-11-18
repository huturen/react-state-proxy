import { stateWrapper } from '../src/index';

it('wrapper: should throw an exception when stateTarget was not an object', async () => {
  const original = console.error;
  console.error = jest.fn();
  try {
    // @ts-ignore
    stateWrapper(0);
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }

  try {
    // @ts-ignore
    stateWrapper('str');
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }

  try {
    // @ts-ignore
    stateWrapper(true);
  } catch(e) {
    expect(e.message).toContain('The [stateTarget] must be an object.');
  }
  console.error = original;
});

it('wrapper: should get the same proxied object when overlapped calls', async () => {
  const target = { num: 1 };
    const state1 = stateWrapper(target);
    const state2 = stateWrapper(state1);
    expect(state1).toBe(state2);
});

it('wrapper: should get the different proxied object for different target', async () => {
    const state1 = stateWrapper({ num: 1 });
    const state2 = stateWrapper({ num: 1 });
    expect(state1).not.toBe(state2);
});

it('wrapper: should get the original target by ____rsp_target____', async () => {
  const target = { num: 1 };
  const state = stateWrapper(target);
  // @ts-ignore
  expect(state.____rsp_target____).toBe(target);
});

it('wrapper: should bind proxy object for function configuration option', async () => {
  const target = {
    num: 1,
    instance() {
      return this;
    }
  };
  const state = stateWrapper(target);

  expect(state.instance()).toBe(state);
});
