import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Breakpoint } from '@mui/material/styles';

// ----------------------------------------------------------------------

type Query = 'up' | 'down' | 'between' | 'only';

type Value = Breakpoint | number;

export function useResponsive(query: Query, start?: Value, end?: Value): boolean {
  const theme = useTheme();

  const getQuery = (): string => {
    switch (query) {
      case 'up':
        return theme.breakpoints.up(start as Value);
      case 'down':
        return theme.breakpoints.down(start as Value);
      case 'between':
        return theme.breakpoints.between(start as Value, end as Value);
      case 'only':
        return theme.breakpoints.only(start as Breakpoint);
      default:
        return theme.breakpoints.up('xs');
    }
  };

  const mediaQueryResult = useMediaQuery(getQuery());

  return mediaQueryResult;
}

// ----------------------------------------------------------------------

type BreakpointOrNull = Breakpoint | null;

export function useWidth(): Breakpoint {
  const theme = useTheme();

  const keys = [...theme.breakpoints.keys].reverse();

  return (
    keys.reduce((output: BreakpointOrNull, key: Breakpoint) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key));

      return !output && matches ? key : output;
    }, null) || 'xs'
  );
}
