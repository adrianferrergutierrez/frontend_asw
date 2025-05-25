import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
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
      <IssueList />
    </ThemeProvider>
  );
}

export default App;
