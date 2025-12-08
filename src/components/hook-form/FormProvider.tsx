import type { ReactNode } from 'react';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import { FormProvider as RHFFormProvider } from 'react-hook-form';

// ----------------------------------------------------------------------

interface FormProviderProps<T extends FieldValues> {
  children: ReactNode;
  methods: UseFormReturn<T>;
  onSubmit?: () => void;
}

export default function FormProvider<T extends FieldValues>({
  children,
  onSubmit,
  methods,
}: FormProviderProps<T>) {
  return (
    <RHFFormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate autoComplete="off">
        {children}
      </form>
    </RHFFormProvider>
  );
}
