import { Event, addEventListener, clearAllListeners, dispatchEvent } from './events';

const events = Object.values(Event).filter((value): value is Event => typeof value === 'number');

describe('events', () => {
  it('Should listen for all events when is dispatched', () => {
    events.forEach((event) => {
      const listener = jest.fn();
      const payload = { name: 'test' };
      const removeListener = addEventListener(event, listener);

      dispatchEvent(event, payload);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith(payload);

      removeListener();
    });
  });

  it('Should listen for all events when is dispatched and stop listen when was removed', () => {
    events.forEach((event) => {
      const listener = jest.fn();
      const payload = { name: 'test' };
      const removeListener = addEventListener(event, listener);

      dispatchEvent(event, payload);
      removeListener();
      dispatchEvent(event, payload);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith(payload);
    });
  });
});

describe('clearAllListeners', () => {
  it('Should clear all different listeners if no specific listener is set as input', () => {
    const listeners = events.map((event) => {
      const listener = jest.fn();

      addEventListener(event, listener);

      dispatchEvent(event, {} as never);

      return listener;
    });

    clearAllListeners();

    events.forEach((event) => dispatchEvent(event, {} as never));

    listeners.forEach((listener) => {
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  it('Should clear all specific listener set as input', () => {
    const listeners = events.map((event) => {
      const listener = jest.fn();

      addEventListener(event, listener);

      dispatchEvent(event, {} as never);

      return Object.assign(listener, { event });
    });
    const listenerToClear = Event.set;
    clearAllListeners(listenerToClear);

    events.forEach((event) => dispatchEvent(event, {} as never));

    listeners.forEach((listener) => {
      if (listener.event === listenerToClear) {
        expect(listener).toHaveBeenCalledTimes(1);
      } else {
        expect(listener).toHaveBeenCalledTimes(2);
      }
    });

    const listenersToClear = [Event.clear, Event.clearAll, Event.get];
    clearAllListeners(listenersToClear);

    events.forEach((event) => dispatchEvent(event, {} as never));

    listeners.forEach((listener) => {
      if (listener.event === listenerToClear) {
        expect(listener).toHaveBeenCalledTimes(1);
      } else if (listenersToClear.includes(listener.event)) {
        expect(listener).toHaveBeenCalledTimes(2);
      } else {
        expect(listener).toHaveBeenCalledTimes(3);
      }
    });
  });
});
