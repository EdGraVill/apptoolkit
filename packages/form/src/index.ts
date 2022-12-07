import Form from './Form';
import { HTMLInputWrapper, mergeEventHandlers } from './HTMLInputWrapper';
import { Context, defaultContextValue, useContext } from './context';
import { addEventListener, dispatchEvent, Event } from './events';
import useSignal from './useSignal';
import { commonValidators, feedbackize, Severity, validate } from './validation';

export type { Feedback, ValidatorFunction } from './validation';
export type { Signal } from './useSignal';
export type { HTMLInputLikeElement, InjectedInputProps, WithoutNameInjectedInputProps } from './HTMLInputWrapper';
export type { EventListener } from './events';
export type { Context } from './context';
export type { InputDefinition, InputState } from './state';
export type { Severity } from './validation';

export default Object.assign(Form, {
  Event,
  HTMLInputWrapper: Object.assign(HTMLInputWrapper, {
    mergeEventHandlers,
  }),
  Severity,
  addEventListener,
  commonValidators,
  context: Object.assign(Context, {
    defaultContextValue,
  }),
  dispatchEvent,
  feedbackize,
  useContext,
  useSignal,
  validate,
});
