import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import debounce from 'lodash/debounce';

import { useWords } from '../hooks/useWords';
import type { Word } from '../types';

// ----------------------------------------------------------------------

export default function DictionaryPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { words, deleteWord, searchWords } = useWords();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null);

  // Compute filtered words - use words directly when no search query
  const displayWords = useMemo(() => {
    if (!searchQuery.trim()) {
      return words;
    }
    return filteredWords;
  }, [words, searchQuery, filteredWords]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string, searchFn: typeof searchWords) => {
        const results = await searchFn(query);
        setFilteredWords(results);
      }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query, searchWords);
  };

  const handleWordClick = (word: Word) => {
    navigate(`/edit/${word.id}`);
  };

  const handleDeleteClick = (event: React.MouseEvent, word: Word) => {
    event.stopPropagation();
    setWordToDelete(word);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (wordToDelete) {
      try {
        await deleteWord(wordToDelete.id);
        enqueueSnackbar('Word deleted successfully', { variant: 'success' });
      } catch {
        enqueueSnackbar('Failed to delete word', { variant: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setWordToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWordToDelete(null);
  };

  const getDisplayGerman = (word: Word) => {
    if (word.wordType === 'noun' && word.gender) {
      return `${word.gender} ${word.german}`;
    }
    return word.german;
  };

  const getTranslationText = (word: Word) => {
    return word.translations.map((t) => t.text).join(' • ');
  };

  // Loading skeleton
  if (!words) {
    return (
      <Box>
        <Skeleton variant="rounded" height={56} sx={{ mb: 3 }} />
        <Stack spacing={1}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={72} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search words..."
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Icon icon="solar:magnifer-bold" width={20} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <Icon icon="solar:close-circle-bold" width={20} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Word Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {displayWords.length} {displayWords.length === 1 ? 'word' : 'words'}
        {searchQuery && ` matching "${searchQuery}"`}
      </Typography>

      {/* Word List */}
      {displayWords.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Icon icon="solar:book-2-bold-duotone" width={64} style={{ opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {searchQuery ? 'No words found' : 'No words yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchQuery
              ? 'Try a different search term'
              : 'Start by adding your first German word!'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Icon icon="solar:add-circle-bold" />}
              onClick={() => navigate('/add')}
              sx={{ mt: 3 }}
            >
              Add Word
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <List disablePadding>
            {displayWords.map((word, index) => (
              <ListItemButton
                key={word.id}
                onClick={() => handleWordClick(word)}
                divider={index < displayWords.length - 1}
                sx={{ py: 2 }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {getDisplayGerman(word)}
                      </Typography>
                      {word.frequencyLevel && (
                        <Chip
                          label={word.frequencyLevel}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  }
                  secondary={getTranslationText(word)}
                  secondaryTypographyProps={{ noWrap: true }}
                />
                <IconButton
                  edge="end"
                  onClick={(e) => handleDeleteClick(e, word)}
                  sx={{ ml: 1 }}
                >
                  <Icon icon="solar:trash-bin-trash-bold" width={20} color="error" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Word</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{wordToDelete?.german}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
