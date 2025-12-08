import { useFormContext, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material';

// ----------------------------------------------------------------------

type RHFTextFieldProps = TextFieldProps & {
  name: string;
};

export default function RHFTextField({ name, helperText, ...other }: RHFTextFieldProps) {
  const { control } = useFormContext();

  // Sanitize name for use as HTML id (dots are invalid in ids)
  const fieldId = name.replace(/\./g, '-');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          id={fieldId}
          fullWidth
          value={field.value ?? ''}
          onChange={(event) => {
            field.onChange(event.target.value);
          }}
          error={!!error}
          helperText={error?.message || helperText}
          {...other}
        />
      )}
    />
  );
}
