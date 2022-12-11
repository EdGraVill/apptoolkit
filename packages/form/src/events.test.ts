import { Event, addEventListener, clearAllListeners, dispatchEvent } from './events';

describe('events', () => {
  it('Should listen for all events when is dispatched', () => {
    Object.keys(Event).forEach((event) => {
      const listener = jest.fn();
      const payload = { name: 'test' };
      const removeListener = addEventListener(Event[event], listener);

      dispatchEvent(Event[event], payload);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith(payload);

      removeListener();
    });
  });

  it('Should listen for all events when is dispatched and stop listen when was removed', () => {
    Object.keys(Event).forEach((event) => {
      const listener = jest.fn();
      const payload = { name: 'test' };
      const removeListener = addEventListener(Event[event], listener);

      dispatchEvent(Event[event], payload);
      removeListener();
      dispatchEvent(Event[event], payload);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toBeCalledWith(payload);
    });
  });
});

describe('clearAllListeners', () => {
  it('Should clear all different listeners if no specific listener is set as input', () => {
    const listeners = Object.keys(Event).map((event) => {
      const listener = jest.fn();

      addEventListener(Event[event], listener);

      dispatchEvent(Event[event], {});

      return listener;
    });

    clearAllListeners();

    Object.keys(Event).forEach((event) => dispatchEvent(Event[event], {}));

    listeners.forEach((listener) => {
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  it('Should clear all specific listener set as input', () => {
    const listeners = Object.keys(Event).map((event) => {
      const listener = jest.fn();

      addEventListener(Event[event], listener);

      dispatchEvent(Event[event], {});

      return Object.assign(listener, { event: Event[event] });
    });
    const listenerToClear = Event.set;
    clearAllListeners(listenerToClear);

    Object.keys(Event).forEach((event) => dispatchEvent(Event[event], {}));

    listeners.forEach((listener) => {
      if (listener.event === listenerToClear) {
        expect(listener).toHaveBeenCalledTimes(1);
      } else {
        expect(listener).toHaveBeenCalledTimes(2);
      }
    });

    const listenersToClear = [Event.clear, Event.clearAll, Event.get];
    clearAllListeners(listenersToClear);

    Object.keys(Event).forEach((event) => dispatchEvent(Event[event], {}));

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
