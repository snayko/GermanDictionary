import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { Icon } from '@iconify/react';

import { useTextToSpeech } from '../../hooks/useTextToSpeech';

// ----------------------------------------------------------------------

interface SpeakButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  tooltip?: string;
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export default function SpeakButton({ 
  text, 
  size = 'small', 
  tooltip = 'Listen to pronunciation',
  color = 'default'
}: SpeakButtonProps) {
  const { speak, isLoading, isPlaying } = useTextToSpeech();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    speak(text);
  };

  const iconSize = size === 'small' ? 18 : size === 'medium' ? 22 : 26;

  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={handleClick}
        size={size}
        color={color}
        disabled={isLoading}
        sx={{
          transition: 'all 0.2s',
          ...(isPlaying && {
            color: 'primary.main',
            animation: 'pulse 1s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            },
          }),
        }}
      >
        {isLoading ? (
          <CircularProgress size={iconSize} color="inherit" />
        ) : (
          <Icon 
            icon={isPlaying ? 'mingcute:volume-fill' : 'mingcute:volume-line'} 
            width={iconSize} 
          />
        )}
      </IconButton>
    </Tooltip>
  );
}
