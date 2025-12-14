import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Icon } from '@iconify/react';
import { Logo } from '../logo';
import { useSyncStatus } from '../../hooks/useSync';
import { apiService } from '../../services/api';

// ----------------------------------------------------------------------

// App version - update this when deploying
const APP_VERSION = '1.0.4';

const NAV_ITEMS = [
  { label: 'Dictionary', icon: 'solar:book-bold', path: '/' },
  { label: 'Add Word', icon: 'solar:add-circle-bold', path: '/add' },
  { label: 'Settings', icon: 'solar:settings-bold', path: '/settings' },
];

// ----------------------------------------------------------------------

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, isApiAvailable, isSyncing, syncEnabled, currentUser, isAuthenticated, checkApiHealth } = useSyncStatus();

  const currentIndex = NAV_ITEMS.findIndex((item) => item.path === location.pathname);
  const [value, setValue] = useState(currentIndex >= 0 ? currentIndex : 0);

  // Clear auth cache and recheck on page load (handles post-login redirect)
  useEffect(() => {
    apiService.clearAuthCache();
    checkApiHealth();
  }, []);

  const handleNavChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(NAV_ITEMS[newValue].path);
  };

  const handleLogin = () => {
    // Redirect to Azure SWA Entra ID login
    window.location.href = '/.auth/login/aad?post_login_redirect_uri=' + encodeURIComponent(window.location.pathname);
  };

  const handleLogout = () => {
    apiService.clearAuthCache();
    window.location.href = '/.auth/logout?post_logout_redirect_uri=' + encodeURIComponent('/');
  };

  const currentPage = NAV_ITEMS[value]?.label || 'German Dictionary';

  // Sync status info
  const getSyncStatus = () => {
    if (!syncEnabled) return { label: 'Local', color: 'default' as const, icon: 'solar:database-bold' };
    if (!isAuthenticated) return { label: 'Sign In', color: 'warning' as const, icon: 'solar:user-circle-bold' };
    if (isSyncing) return { label: 'Syncing', color: 'info' as const, icon: 'solar:refresh-bold' };
    if (!isOnline) return { label: 'Offline', color: 'warning' as const, icon: 'solar:cloud-cross-bold' };
    if (!isApiAvailable) return { label: 'API Down', color: 'error' as const, icon: 'solar:server-square-cloud-bold' };
    return { label: 'Synced', color: 'success' as const, icon: 'solar:cloud-check-bold' };
  };

  const syncStatus = getSyncStatus();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(135deg, #004B50 0%, #007867 50%, #00A76F 100%)',
          color: 'white',
          borderBottom: '3px solid',
          borderImage: 'linear-gradient(90deg, #004B50, #00A76F, #5BE49B) 1',
        }}
      >
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
            <Logo disableLink sx={{ width: 36, height: 36 }} />
            <Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  lineHeight: 1.2,
                  background: 'linear-gradient(90deg, #ffffff 0%, #C8FAD6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                German Dictionary
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.65rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {currentPage} • v{APP_VERSION}
              </Typography>
            </Box>
          </Stack>
          {/* User Info & Sync Status */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {syncEnabled && !isAuthenticated ? (
              <Button
                size="small"
                variant="contained"
                color="inherit"
                onClick={handleLogin}
                startIcon={<Icon icon="mdi:microsoft" width={18} />}
                sx={{ 
                  height: 28,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                }}
              >
                Sign In
              </Button>
            ) : (
              <>
                {/* User email */}
                {currentUser?.email && (
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                    {currentUser.email}
                  </Typography>
                )}
                {/* Sync status chip - NOT clickable */}
                <Tooltip title={syncStatus.label}>
                  <Chip
                    size="small"
                    color={syncStatus.color}
                    icon={isSyncing ? <CircularProgress size={14} color="inherit" /> : <Icon icon={syncStatus.icon} width={16} />}
                    label={syncStatus.label}
                    sx={{ 
                      height: 24,
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { ml: 0.5 },
                    }}
                  />
                </Tooltip>
                {/* Logout button */}
                <Tooltip title="Sign out">
                  <Button
                    size="small"
                    color="inherit"
                    onClick={handleLogout}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <Icon icon="solar:logout-2-bold" width={20} />
                  </Button>
                </Tooltip>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // AppBar height
          pb: 8, // BottomNav height
          px: 2,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
        }}
        elevation={3}
      >
        <BottomNavigation value={value} onChange={handleNavChange} showLabels>
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={<Icon icon={item.icon} width={24} />}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
