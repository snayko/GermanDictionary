import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';

import WordNewEditForm from '../components/words/WordNewEditForm';
import { useSyncedWords } from '../hooks/useSyncedWords';
import type { WordFormData } from '../types';

// ----------------------------------------------------------------------

export default function AddWordPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { addWord } = useSyncedWords();

  const handleSubmit = async (data: WordFormData) => {
    try {
      await addWord(data);
      enqueueSnackbar('Word added successfully!', { variant: 'success' });
      navigate('/');
    } catch {
      enqueueSnackbar('Failed to add word', { variant: 'error' });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Add New Word
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Add a new German word to your dictionary
      </Typography>

      <WordNewEditForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </Container>
  );
}
