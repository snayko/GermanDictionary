import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';

import WordNewEditForm from '../components/words/WordNewEditForm';
import { useWords } from '../hooks/useWords';
import { useResponsive } from '../hooks/useResponsive';
import type { Word, WordFormData } from '../types';

// ----------------------------------------------------------------------

export default function EditWordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { getWord, updateWord } = useWords();
  const mdUp = useResponsive('up', 'md');

  const [word, setWord] = useState<Word | null>(null);
  const [loadingWord, setLoadingWord] = useState(true);

  useEffect(() => {
    const loadWord = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const foundWord = await getWord(id);
        if (foundWord) {
          setWord(foundWord);
        } else {
          enqueueSnackbar('Word not found', { variant: 'error' });
          navigate('/');
        }
      } catch {
        enqueueSnackbar('Failed to load word', { variant: 'error' });
        navigate('/');
      } finally {
        setLoadingWord(false);
      }
    };

    loadWord();
  }, [id, getWord, navigate, enqueueSnackbar]);

  const handleSubmit = async (data: WordFormData) => {
    if (!id) return;

    try {
      await updateWord(id, data);
      enqueueSnackbar('Word updated successfully!', { variant: 'success' });
      navigate('/');
    } catch {
      enqueueSnackbar('Failed to update word', { variant: 'error' });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loadingWord) {
    return (
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {mdUp && <Grid size={{ md: 4 }} />}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={100} />
                <Skeleton variant="rounded" height={56} />
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!word) {
    return (
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Icon icon="solar:file-corrupted-bold-duotone" width={64} style={{ opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Word not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon="solar:arrow-left-bold" />}
            onClick={() => navigate('/')}
            sx={{ mt: 3 }}
          >
            Back to Dictionary
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Edit Word
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Editing "{word.german}"
      </Typography>

      <WordNewEditForm currentWord={word} onSubmit={handleSubmit} onCancel={handleCancel} />
    </Container>
  );
}
