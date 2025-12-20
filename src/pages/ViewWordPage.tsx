import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';

import WordView from '../components/words/WordView';
import { useSyncedWords } from '../hooks/useSyncedWords';
import type { Word } from '../types';

// ----------------------------------------------------------------------

export default function ViewWordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { getWord } = useSyncedWords();

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

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loadingWord) {
    return (
      <Container maxWidth="sm" sx={{ pb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={100} height={40} />
        </Stack>
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Skeleton variant="text" width="60%" height={48} />
            <Skeleton variant="rounded" height={32} width={100} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        </Card>
      </Container>
    );
  }

  if (!word) {
    return (
      <Container maxWidth="sm" sx={{ pb: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Icon icon="solar:file-corrupted-bold-duotone" width={64} style={{ opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Word not found
          </Typography>
          <Button
            variant="contained"
            onClick={handleBack}
            startIcon={<Icon icon="solar:arrow-left-bold" />}
            sx={{ mt: 2 }}
          >
            Back to Dictionary
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Button
          color="inherit"
          onClick={handleBack}
          startIcon={<Icon icon="solar:arrow-left-bold" />}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleEdit}
          startIcon={<Icon icon="solar:pen-bold" />}
        >
          Edit
        </Button>
      </Stack>

      {/* Word View */}
      <WordView word={word} />
    </Container>
  );
}
