import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { Icon } from '@iconify/react';

import type { Word } from '../../types';
import { SpeakButton } from '../speak-button';

// ----------------------------------------------------------------------

// CEFR level colors (similar to Longman dictionary notation)
const getCefrColor = (level: string): string => {
  switch (level) {
    case 'A1':
    case 'A2':
      return '#D32F2F'; // Red - Basic/Beginner
    case 'B1':
    case 'B2':
      return '#F57C00'; // Orange - Intermediate
    case 'C1':
    case 'C2':
      return '#7B1FA2'; // Purple - Advanced
    default:
      return '#1976D2'; // Blue - default
  }
};

interface WordViewProps {
  word: Word;
}

export default function WordView({ word }: WordViewProps) {
  const getDisplayGerman = () => {
    if (word.wordType === 'noun' && word.gender) {
      return `${word.gender} ${word.german}`;
    }
    return word.german;
  };

  const getWordTypeLabel = () => {
    const labels: Record<string, string> = {
      noun: 'Noun',
      verb: 'Verb',
      adjective: 'Adjective',
      adverb: 'Adverb',
      phrase: 'Phrase',
      preposition: 'Preposition',
      conjunction: 'Conjunction',
      pronoun: 'Pronoun',
      article: 'Article',
      other: 'Other',
    };
    return labels[word.wordType] || word.wordType;
  };

  const hasTranslations = word.translations.length > 0;
  const hasExamples = word.examples && word.examples.length > 0;
  const hasSynonyms = word.synonyms && word.synonyms.length > 0;
  const hasAntonyms = word.antonyms && word.antonyms.length > 0;
  const hasCollocations = word.collocations && word.collocations.length > 0;
  const hasNotes = word.notes && word.notes.trim().length > 0;
  const hasImage = word.imageUrl && word.imageUrl.trim().length > 0;

  return (
    <Stack spacing={3}>
      {/* Main Word Card */}
      <Card sx={{ p: 3 }}>
        {/* German Word */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography 
            variant="h3"
            sx={{ 
              color: word.frequencyLevel ? getCefrColor(word.frequencyLevel) : 'text.primary',
            }}
          >
            {getDisplayGerman()}
          </Typography>
          <SpeakButton 
            text={word.german} 
            size="medium" 
            tooltip="Listen to German word"
          />
        </Stack>

        {/* Word Type & Level */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip label={getWordTypeLabel()} size="small" color="primary" variant="filled" />
          {word.frequencyLevel && (
            <Chip 
              label={word.frequencyLevel} 
              size="small" 
              sx={{ 
                bgcolor: getCefrColor(word.frequencyLevel),
                color: 'white',
                fontWeight: 600,
              }} 
            />
          )}
        </Stack>

        {/* Translations */}
        {hasTranslations && (
          <Box sx={{ mb: 3 }}>
            <Stack spacing={1.5}>
              {word.translations.map((translation) => (
                <Stack key={translation.language} direction="row" alignItems="center" spacing={1.5}>
                  <Icon
                    icon={
                      translation.language === 'english'
                        ? 'circle-flags:gb'
                        : translation.language === 'russian'
                          ? 'circle-flags:ru'
                          : 'circle-flags:ua'
                    }
                    width={24}
                  />
                  <Typography variant="body1">{translation.text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {/* Examples */}
        {hasExamples && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Examples
              </Typography>
              <Stack spacing={2}>
                {word.examples!.map((example, index) => (
                  <Stack 
                    key={index} 
                    direction="row" 
                    alignItems="flex-start" 
                    spacing={1}
                    sx={{ pl: 2, borderLeft: 3, borderColor: 'primary.main' }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "{example.german}"
                      </Typography>
                      {example.translation && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {example.translation}
                        </Typography>
                      )}
                    </Box>
                    <SpeakButton 
                      text={example.german} 
                      size="small" 
                      tooltip="Listen to example sentence"
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Card>

      {/* Related Words Card - only show if there are related words */}
      {(hasSynonyms || hasAntonyms || hasCollocations) && (
        <Card sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Synonyms */}
            {hasSynonyms && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Synonyms
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {word.synonyms!.map((synonym) => (
                    <Chip key={synonym} label={synonym} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Antonyms */}
            {hasAntonyms && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Antonyms
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {word.antonyms!.map((antonym) => (
                    <Chip key={antonym} label={antonym} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Collocations */}
            {hasCollocations && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Collocations
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {word.collocations!.map((collocation) => (
                    <Chip key={collocation} label={collocation} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Card>
      )}

      {/* Notes Card - only show if there are notes */}
      {hasNotes && (
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Notes
          </Typography>
          <Box
            sx={{
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
              '& iframe': { maxWidth: '100%', borderRadius: 1 },
              '& p': { m: 0, mb: 1 },
              '& p:last-child': { mb: 0 },
              '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
              '& ul, & ol': { pl: 3 },
              '& blockquote': {
                borderLeft: 4,
                borderColor: 'grey.300',
                pl: 2,
                ml: 0,
                fontStyle: 'italic',
              },
              '& pre': {
                bgcolor: 'grey.900',
                color: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
              },
            }}
            dangerouslySetInnerHTML={{ __html: word.notes! }}
          />
        </Card>
      )}

      {/* Image Card - only show if there's an image */}
      {hasImage && (
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Image
          </Typography>
          <Box
            component="img"
            src={word.imageUrl}
            alt={word.german}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
        </Card>
      )}
    </Stack>
  );
}
