import { useFormContext, Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';

// ----------------------------------------------------------------------

type RHFAutocompleteProps = {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  options?: string[];
  multiple?: boolean;
  freeSolo?: boolean;
  size?: 'small' | 'medium';
  disableCloseOnSelect?: boolean;
};

export default function RHFAutocomplete({
  name,
  label,
  placeholder,
  helperText,
  options = [],
  multiple = false,
  freeSolo = false,
  size,
  disableCloseOnSelect,
}: RHFAutocompleteProps) {
  const { control } = useFormContext();

  // Sanitize name for use as HTML id (dots are invalid in ids)
  const fieldId = name.replace(/\./g, '-');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          multiple={multiple}
          freeSolo={freeSolo}
          options={options}
          size={size}
          disableCloseOnSelect={disableCloseOnSelect}
          value={field.value ?? (multiple ? [] : null)}
          onChange={(_, newValue) => {
            field.onChange(newValue);
          }}
          getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
          renderOption={(props, option) => (
            <li {...props} key={option}>
              {option}
            </li>
          )}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              id={fieldId}
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={error?.message || helperText}
            />
          )}
        />
      )}
    />
  );
}
