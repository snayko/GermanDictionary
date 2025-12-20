import * as Yup from 'yup';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Icon } from '@iconify/react';

import { useResponsive } from '../../hooks/useResponsive';
import { FormProvider, RHFTextField, RHFSelect, RHFAutocomplete, RHFEditor } from '../hook-form';
import type { Word, WordFormData } from '../../types';
import { WORD_TYPES, GENDERS, FREQUENCY_LEVELS } from '../../types';

// ----------------------------------------------------------------------

// Validation schema
const WordSchema = Yup.object().shape({
  german: Yup.string().required('German word is required').trim(),
  englishTranslation: Yup.string().trim(),
  russianTranslation: Yup.string().trim(),
  ukrainianTranslation: Yup.string().trim(),
  wordType: Yup.string().required('Word type is required'),
  gender: Yup.string().when('wordType', {
    is: 'noun',
    then: (schema) => schema.required('Gender is required for nouns'),
    otherwise: (schema) => schema.notRequired(),
  }),
  frequencyLevel: Yup.string(),
  examples: Yup.array().of(
    Yup.object().shape({
      german: Yup.string().required('Example sentence is required'),
      translation: Yup.string(),
      source: Yup.string(),
    })
  ),
  synonyms: Yup.array().of(Yup.string()),
  antonyms: Yup.array().of(Yup.string()),
  collocations: Yup.array().of(Yup.string()),
  notes: Yup.string(),
  imageUrl: Yup.string().url().nullable(),
}).test(
  'at-least-one-translation',
  'At least one translation is required',
  (values) => {
    const { englishTranslation, russianTranslation, ukrainianTranslation } = values;
    return !!(englishTranslation?.trim() || russianTranslation?.trim() || ukrainianTranslation?.trim());
  }
);

// ----------------------------------------------------------------------

interface WordNewEditFormProps {
  currentWord?: Word;
  onSubmit: (data: WordFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function WordNewEditForm({ currentWord, onSubmit, onCancel }: WordNewEditFormProps) {
  const mdUp = useResponsive('up', 'md');

  const defaultValues = useMemo<WordFormData>(
    () => ({
      german: currentWord?.german || '',
      englishTranslation: currentWord?.translations.find((t) => t.language === 'english')?.text || '',
      russianTranslation: currentWord?.translations.find((t) => t.language === 'russian')?.text || '',
      ukrainianTranslation: currentWord?.translations.find((t) => t.language === 'ukrainian')?.text || '',
      wordType: currentWord?.wordType || 'noun',
      gender: currentWord?.gender,
      frequencyLevel: currentWord?.frequencyLevel,
      examples: currentWord?.examples || [],
      synonyms: currentWord?.synonyms || [],
      antonyms: currentWord?.antonyms || [],
      collocations: currentWord?.collocations || [],
      notes: currentWord?.notes || '',
      imageUrl: currentWord?.imageUrl || '',
    }),
    [currentWord]
  );

  const methods = useForm<WordFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(WordSchema) as any,
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'examples',
  });

  const wordType = watch('wordType');
  const isNoun = wordType === 'noun';

  useEffect(() => {
    if (currentWord) {
      reset(defaultValues);
    }
  }, [currentWord, defaultValues, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleAddExample = () => {
    append({ german: '', translation: '', source: '' });
  };

  // ----------------------------------------------------------------------
  // DETAILS SECTION - German word, translations, examples
  // ----------------------------------------------------------------------
  const renderDetails = (
    <>
      {mdUp && (
        <Grid size={{ md: 4 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Word Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            German word, translations, example sentences...
          </Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          {!mdUp && <CardHeader title="Word Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            {/* German Word */}
            <RHFTextField
              name="german"
              label="German Word"
              placeholder="e.g., Haus, laufen, schön"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="circle-flags:de" width={24} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Word Type & Gender */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFSelect
                name="wordType"
                label="Word Type"
                options={WORD_TYPES}
              />

              {isNoun && (
                <RHFSelect
                  name="gender"
                  label="Gender (Article)"
                  options={GENDERS}
                />
              )}
            </Stack>

            {/* Translations */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                Translations (at least one required)
              </Typography>
              
              {/* Show validation error for translations */}
              {errors.root?.message && (
                <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
                  {errors.root.message}
                </Typography>
              )}

              <Stack spacing={2}>
                <RHFTextField
                  name="englishTranslation"
                  label="English"
                  placeholder="e.g., house, to run, beautiful"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="circle-flags:gb" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                <RHFTextField
                  name="russianTranslation"
                  label="Russian"
                  placeholder="e.g., дом, бежать, красивый"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="circle-flags:ru" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />

                <RHFTextField
                  name="ukrainianTranslation"
                  label="Ukrainian"
                  placeholder="e.g., дім, бігти, гарний"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon icon="circle-flags:ua" width={20} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Box>

            {/* Example Sentences */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Example Sentences
                </Typography>
                <Button
                  size="small"
                  startIcon={<Icon icon="mingcute:add-line" />}
                  onClick={handleAddExample}
                >
                  Add Example
                </Button>
              </Stack>

              <Stack spacing={2}>
                {fields.map((field, index) => (
                  <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <RHFTextField
                          name={`examples.${index}.german`}
                          label="German sentence"
                          placeholder="e.g., Das Haus ist groß."
                          size="small"
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => remove(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <Icon icon="mingcute:delete-2-line" width={20} />
                        </IconButton>
                      </Stack>
                      <RHFTextField
                        name={`examples.${index}.translation`}
                        label="Translation (optional)"
                        placeholder="e.g., The house is big."
                        size="small"
                      />
                    </Stack>
                  </Card>
                ))}

                {fields.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    No examples yet. Add one to help remember the word in context.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  // ----------------------------------------------------------------------
  // PROPERTIES SECTION - Frequency, synonyms, notes, etc.
  // ----------------------------------------------------------------------
  const renderProperties = (
    <>
      {mdUp && (
        <Grid size={{ md: 4 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Level, related words, notes...
          </Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFSelect
              name="frequencyLevel"
              label="CEFR Level (optional)"
              options={[{ value: '', label: 'Not specified' }, ...FREQUENCY_LEVELS]}
              helperText="Common European Framework of Reference level"
            />

            <RHFAutocomplete
              name="synonyms"
              label="Synonyms"
              placeholder="+ Add synonym"
              multiple
              freeSolo
              helperText="Related German words with similar meaning"
            />

            <RHFAutocomplete
              name="antonyms"
              label="Antonyms"
              placeholder="+ Add antonym"
              multiple
              freeSolo
              helperText="German words with opposite meaning"
            />

            <RHFAutocomplete
              name="collocations"
              label="Collocations"
              placeholder="+ Add collocation"
              multiple
              freeSolo
              helperText="Common word combinations (e.g., 'einen Fehler machen')"
            />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Notes</Typography>
              <RHFEditor
                name="notes"
                placeholder="Any additional notes, grammar hints, memory tricks... You can add images, videos, formatting and more."
                simple
              />
            </Stack>

            <RHFTextField
              name="imageUrl"
              label="Image URL (optional)"
              placeholder="https://example.com/image.jpg"
              helperText="URL to an image that helps remember the word"
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  // ----------------------------------------------------------------------
  // ACTIONS
  // ----------------------------------------------------------------------
  const renderActions = (
    <>
      {mdUp && <Grid size={{ md: 4 }} />}
      <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && (
          <Button color="inherit" variant="outlined" size="large" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {!currentWord ? 'Create Word' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleFormSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}
