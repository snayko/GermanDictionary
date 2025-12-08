import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Icon } from '@iconify/react';
import { useContext } from 'react';
import { ThemeContext } from '../theme/theme-context';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  const themeContext = useContext(ThemeContext);
  const isDarkMode = themeContext?.themeMode === 'dark';

  const handleThemeToggle = () => {
    themeContext?.toggleThemeMode();
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize your app experience
      </Typography>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <List>
            {/* Theme Toggle */}
            <ListItem>
              <ListItemIcon>
                <Icon 
                  icon={isDarkMode ? 'solar:moon-bold' : 'solar:sun-bold'} 
                  width={24} 
                />
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary="Toggle between light and dark theme"
              />
              <Switch
                edge="end"
                checked={isDarkMode}
                onChange={handleThemeToggle}
              />
            </ListItem>

            <Divider component="li" />

            {/* App Info */}
            <ListItem>
              <ListItemIcon>
                <Icon icon="solar:info-circle-bold" width={24} />
              </ListItemIcon>
              <ListItemText
                primary="Version"
                secondary="1.0.0 (MVP)"
              />
            </ListItem>

            <Divider component="li" />

            {/* Future Settings Placeholder */}
            <ListItem sx={{ opacity: 0.5 }}>
              <ListItemIcon>
                <Icon icon="solar:bell-bold" width={24} />
              </ListItemIcon>
              <ListItemText
                primary="Notifications"
                secondary="Coming soon..."
              />
            </ListItem>

            <Divider component="li" />

            <ListItem sx={{ opacity: 0.5 }}>
              <ListItemIcon>
                <Icon icon="solar:cloud-bold" width={24} />
              </ListItemIcon>
              <ListItemText
                primary="Cloud Sync"
                secondary="Coming soon..."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            About
          </Typography>
          <Typography variant="body2">
            German Dictionary is a personal vocabulary learning app. 
            Add words, review them with flashcards, and track your progress.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
