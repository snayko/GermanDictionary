import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

// ----------------------------------------------------------------------

interface LogoProps {
  disableLink?: boolean;
  sx?: object;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disableLink = false, sx, ...other }, ref) => {
    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          width: 40,
          height: 40,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
        {...other}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Green gradient background */}
          <defs>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004B50" />
              <stop offset="50%" stopColor="#007867" />
              <stop offset="100%" stopColor="#5BE49B" />
            </linearGradient>
          </defs>
          
          {/* Background circle with gradient */}
          <circle cx="20" cy="20" r="18" fill="url(#greenGradient)" />
          
          {/* Book icon in white */}
          <g transform="translate(10, 10) scale(0.5)">
            <path
              fill="#ffffff"
              d="M20 2C16.5 2 13.5 3.5 12 6C10.5 3.5 7.5 2 4 2C4 2 2 2 2 4V26C2 28 4 28 4 28C7.5 28 10.5 29.5 12 32C13.5 29.5 16.5 28 20 28C20 28 22 28 22 26V4C22 2 20 2 20 2M12 26C10.5 24.5 8 23 5 22.5V5C7.5 5.5 10 6.5 12 8.5V26M19 22.5C16 23 13.5 24.5 12 26V8.5C14 6.5 16.5 5.5 19 5V22.5Z"
              transform="translate(8, 6)"
            />
          </g>
        </svg>
      </Box>
    );

    if (disableLink) {
      return logo;
    }

    return (
      <Box component={RouterLink} to="/" sx={{ display: 'contents' }}>
        {logo}
      </Box>
    );
  }
);

Logo.displayName = 'Logo';

export default Logo;
