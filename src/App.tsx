import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from './theme';
import Router from './routes';

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <Router />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
