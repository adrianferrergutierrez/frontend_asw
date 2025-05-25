import { CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useState } from 'react';
import IssueList from './components/IssueList';
import Profile from './components/Profile';

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
  const [currentPage, setCurrentPage] = useState<'issues' | 'profile'>('issues');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Issue Tracker
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => setCurrentPage('issues')}
              sx={{ 
                backgroundColor: currentPage === 'issues' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                mr: 1
              }}
            >
              Issues
            </Button>
            <Button 
              color="inherit" 
              onClick={() => setCurrentPage('profile')}
              sx={{ 
                backgroundColor: currentPage === 'profile' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              Perfil
            </Button>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
          {currentPage === 'issues' ? <IssueList /> : <Profile />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
