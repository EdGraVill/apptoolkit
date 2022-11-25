import type { Context } from './context';
import type { InputDefinition, InputState } from './state';
import type { Feedback } from './validation';

export enum Event {
  clear,
  clearAll,
  get,
  getMany,
  inputDefinitionsUpdate,
  reset,
  resetAll,
  set,
  setMany,
  submit,
  validate,
}

interface MapEventWithListener {
  [Event.clear]: (payload: { name: string }) => void;
  [Event.clearAll]: (payload: { names: string[] }) => void;
  [Event.get]: (payload: InputState) => void;
  [Event.getMany]: (payload: Array<InputState | undefined>) => void;
  [Event.inputDefinitionsUpdate]: (payload: InputDefinition[]) => void;
  [Event.reset]: (payload: { name: string }) => void;
  [Event.resetAll]: (payload: { names: string[]; values: string[] }) => void;
  [Event.set]: (payload: { name: string; value: string }) => void;
  [Event.setMany]: (payload: { names: string[]; values: string[] }) => void;
  [Event.submit]: (payload: Context) => void;
  [Event.validate]: (payload: { feedback: Feedback[]; name: string; result: boolean }) => void;
}

export interface EventListener {
  <T extends Event>(event: T, listener: MapEventWithListener[T]): () => void;
}

type EventListeners = {
  readonly [T in keyof MapEventWithListener]: Array<MapEventWithListener[T]>;
};

const eventListeners = Object.keys(Event).reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: [],
  }),
  {},
) as EventListeners;

export const addEventListener: EventListener = function addEventListener(event, listener) {
  eventListeners[event].push(listener);

  return function remove() {
    const ix = eventListeners[event].findIndex((fn) => listener === fn);

    eventListeners[event].splice(ix, 1);
  };
};

export function dispatchEvent<T extends Event>(event: T, payload: Parameters<MapEventWithListener[T]>[0]): void {
  const listeners = eventListeners[event] as Array<MapEventWithListener[T]>;

  if (listeners.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listeners.forEach((listener) => listener?.(payload as any));
  }
}

export function clearAllListeners(event?: Event | Event[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emptyStorage = (store: any) => store?.splice?.(0);

  if (!event) {
    Object.values(eventListeners).forEach(emptyStorage);
  }

  ((event instanceof Array ? event : [event]) as Event[]).map((event) => eventListeners[event]).forEach(emptyStorage);
}
