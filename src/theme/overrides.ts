import type { Theme, Components } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { buttonClasses } from '@mui/material/Button';

// ----------------------------------------------------------------------

// Declare the soft variant for Button
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function componentsOverrides(theme: Theme): Components<any> {
  const lightMode = theme.palette.mode === 'light';
  const borderRadius = Number(theme.shape.borderRadius);

  return {
    // CSS BASELINE
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        a: {
          color: theme.palette.primary.main,
          textDecoration: 'none',
        },
      },
    },

    // CARD
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxShadow: theme.customShadows.card,
          borderRadius: borderRadius * 2,
          zIndex: 0,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },

    // BUTTON
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          minHeight: 48,
        },
        sizeMedium: {
          minHeight: 40,
        },
        sizeSmall: {
          minHeight: 32,
        },
        // Soft variant
        containedInherit: {
          color: lightMode ? theme.palette.common.white : theme.palette.grey[800],
          backgroundColor: lightMode ? theme.palette.grey[800] : theme.palette.common.white,
          '&:hover': {
            backgroundColor: lightMode ? theme.palette.grey[700] : theme.palette.grey[400],
          },
        },
        outlinedInherit: {
          borderColor: alpha(theme.palette.grey[500], 0.32),
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
      variants: [
        {
          props: { variant: 'soft', color: 'primary' },
          style: {
            color: theme.palette.primary[lightMode ? 'dark' : 'light'],
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.32),
            },
            [`&.${buttonClasses.disabled}`]: {
              backgroundColor: theme.palette.action.disabledBackground,
            },
          },
        },
        {
          props: { variant: 'soft', color: 'secondary' },
          style: {
            color: theme.palette.secondary[lightMode ? 'dark' : 'light'],
            backgroundColor: alpha(theme.palette.secondary.main, 0.16),
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.32),
            },
          },
        },
        {
          props: { variant: 'soft', color: 'error' },
          style: {
            color: theme.palette.error[lightMode ? 'dark' : 'light'],
            backgroundColor: alpha(theme.palette.error.main, 0.16),
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.32),
            },
          },
        },
        {
          props: { variant: 'soft', color: 'inherit' },
          style: {
            color: theme.palette.text.primary,
            backgroundColor: alpha(theme.palette.grey[500], 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.24),
            },
          },
        },
      ],
    },

    // LOADING BUTTON (from @mui/lab)
    // @ts-expect-error - MuiLoadingButton is from @mui/lab
    MuiLoadingButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-text': {
            '& .MuiLoadingButton-startIconPendingStart': {
              marginLeft: 0,
            },
            '& .MuiLoadingButton-endIconPendingEnd': {
              marginRight: 0,
            },
          },
        },
      },
    },

    // TEXT FIELD
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: theme.spacing(1),
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.grey[500], 0.2),
            transition: theme.transitions.create(['border-color'], {
              duration: theme.transitions.duration.shortest,
            }),
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
          '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.16),
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.grey[500], 0.16),
          },
        },
      },
    },

    // SELECT
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    // DIALOG
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.dialog,
          borderRadius: borderRadius * 2,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0, 3),
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },

    // PAPER
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: borderRadius * 2,
        },
      },
    },

    // FAB
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: theme.customShadows.z8,
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: alpha(theme.palette.grey[500], 0.08),
          },
        },
        primary: {
          boxShadow: theme.customShadows.primary,
        },
      },
    },

    // APP BAR
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },

    // BOTTOM NAVIGATION
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: theme.palette.primary.main,
          },
        },
      },
    },

    // LIST
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
        },
      },
    },

    // CHIP
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },

    // TOOLTIP
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.palette.grey[800],
        },
        arrow: {
          color: theme.palette.grey[800],
        },
      },
    },

    // SKELETON
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.grey[400], 0.24),
        },
      },
    },
  };
}
