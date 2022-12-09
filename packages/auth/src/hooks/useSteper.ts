import { useCallback, useState } from 'react';

export default function useSteper(maxSteps: number, initialStep?: number) {
  const [step, setStep] = useState(initialStep ?? 0);

  const nextStep = useCallback(() => {
    setStep((currentStep) => {
      if (currentStep < maxSteps - 1) {
        return currentStep + 1;
      }

      return currentStep;
    });
  }, [maxSteps]);

  const previousStep = useCallback(() => {
    setStep((currentStep) => {
      if (currentStep > 0) {
        return currentStep - 1;
      }

      return currentStep;
    });
  }, []);

  const goToStep = useCallback(
    (newStep: number) => {
      if (newStep >= 0 && newStep < maxSteps) {
        setStep(newStep);
      }
    },
    [maxSteps],
  );

  return {
    goToStep,
    nextStep,
    previousStep,
    step,
  };
}
