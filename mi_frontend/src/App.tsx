import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import IssueList from './components/IssueList';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', minHeight: '100vh' }}>
        <IssueList />
      </Box>
    </ThemeProvider>
  );
}

export default App;
