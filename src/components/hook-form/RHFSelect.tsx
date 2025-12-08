import { useFormContext, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

// ----------------------------------------------------------------------

interface Option {
  value: string;
  label: string;
}

type RHFSelectProps = {
  name: string;
  label?: string;
  options: Option[];
  helperText?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
};

export default function RHFSelect({
  name,
  label,
  options,
  helperText,
  placeholder,
  size,
  fullWidth = true,
}: RHFSelectProps) {
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
          select
          label={label}
          value={field.value ?? ''}
          onChange={(event) => {
            field.onChange(event.target.value);
          }}
          error={!!error}
          helperText={error?.message || helperText}
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
