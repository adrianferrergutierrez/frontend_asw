import { useState, useEffect, useRef } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Button,
  Dialog, DialogTitle, DialogContent, Tabs, Tab, List, ListItem, ListItemText, IconButton, TextField, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import IssueList from './components/IssueList';
import Profile from './components/Profile';
import {
  getIssueTypes, getSeverities, getPriorities, getStatuses,
  createIssueType, createSeverity, createPriority, createStatus,
  updateIssueType, updateSeverity, updatePriority, updateStatus,
  deleteIssueType, deleteSeverity, deletePriority, deleteStatus
} from './services/api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function ColorCircle({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: color,
        marginRight: 12,
        border: '1px solid #ccc',
        verticalAlign: 'middle'
      }}
    />
  );
}

function SettingsDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [replaceId, setReplaceId] = useState<number | null>(null);
  // Campos para añadir/editar
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#1976d2');
  const [newPosition, setNewPosition] = useState(0);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    let fetchFn;
    switch (tab) {
      case 0: fetchFn = getIssueTypes; break;
      case 1: fetchFn = getStatuses; break;
      case 2: fetchFn = getPriorities; break;
      case 3: fetchFn = getSeverities; break;
      default: fetchFn = () => Promise.resolve([]);
    }
    fetchFn()
      .then(res => setItems((res as any).data ? (res as any).data : res))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab, open, addOpen, editOpen, deleteOpen]);

  // Añadir
  const handleAdd = async () => {
    let addFn;
    let payload: any = {
      name: newName,
      color: newColor,
      position: newPosition
    };
    if (tab === 1) payload.is_closed = isClosed;
    switch (tab) {
      case 0: addFn = createIssueType; break;
      case 1: addFn = createStatus; break;
      case 2: addFn = createPriority; break;
      case 3: addFn = createSeverity; break;
      default: return;
    }
    await addFn(payload);
    setAddOpen(false);
    setNewName('');
    setNewColor('#1976d2');
    setNewPosition(0);
    setIsClosed(false);
  };

  // Editar
  const handleEdit = async () => {
    let updateFn;
    let payload: any = {
      name: newName,
      color: newColor,
      position: newPosition
    };
    if (tab === 1) payload.is_closed = isClosed;
    switch (tab) {
      case 0: updateFn = updateIssueType; break;
      case 1: updateFn = updateStatus; break;
      case 2: updateFn = updatePriority; break;
      case 3: updateFn = updateSeverity; break;
      default: return;
    }
    await updateFn(selectedItem.id, payload);
    setEditOpen(false);
    setSelectedItem(null);
    setNewName('');
    setNewColor('#1976d2');
    setNewPosition(0);
    setIsClosed(false);
  };

  // Eliminar
  const handleDelete = async () => {
  let deleteFn;
  switch (tab) {
    case 0: deleteFn = deleteIssueType; break;
    case 1: deleteFn = deleteStatus; break;
    case 2: deleteFn = deletePriority; break;
    case 3: deleteFn = deleteSeverity; break;
    default: return;
  }
  try {
    console.log('Intentando borrar:', selectedItem.id, 'Reemplazar por:', replaceId);
    await deleteFn(selectedItem.id, replaceId === null ? undefined : replaceId);
    console.log('Borrado exitoso');
    setDeleteOpen(false);
    setSelectedItem(null);
    setReplaceId(null);
  } catch (error: any) {
    console.error('Error al borrar:', error?.response?.data || error);
  }
};

  // Opciones para la posición
  const positionOptions = Array.from({ length: items.length + 1 }, (_, i) => i);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Configuración
        <IconButton
          aria-label="add"
          size="small"
          sx={{ float: 'right' }}
          onClick={() => {
            setAddOpen(true);
            setNewName('');
            setNewColor('#1976d2');
            setNewPosition(0);
            setIsClosed(false);
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 'bold' }}>+</span>
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Types" />
          <Tab label="Statuses" />
          <Tab label="Priorities" />
          <Tab label="Severities" />
        </Tabs>
        <Box>
          {loading ? "Cargando..." : (
            <List>
              {items.map((item: any, idx: number) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => {
                          setSelectedItem(item);
                          setNewName(item.name);
                          setNewColor(item.color);
                          setNewPosition(item.position ?? idx);
                          setIsClosed(item.is_closed ?? false);
                          setEditOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {
                          setSelectedItem(item);
                          setReplaceId(null);
                          setDeleteOpen(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ColorCircle color={item.color || '#ccc'} />
                  <ListItemText
                    primary={
                      <>
                        {item.name}
                        {tab === 1 && (
                          <span style={{
                            marginLeft: 8,
                            color: item.is_closed ? 'red' : 'green',
                            fontWeight: 500,
                            fontSize: 13
                          }}>
                            {item.is_closed ? 'Cerrado' : 'Abierto'}
                          </span>
                        )}
                      </>
                    }
                    secondary={`Posición: ${item.position ?? idx}`}
                  />
                </ListItem>
              ))}
              {items.length === 0 && <ListItem><ListItemText primary="No hay elementos" /></ListItem>}
            </List>
          )}
        </Box>
      </DialogContent>
      {/* Diálogo para añadir */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Añadir nuevo {['Type', 'Status', 'Priority', 'Severity'][tab]}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nombre"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Color"
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              sx={{ width: 80, mr: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <span style={{ marginLeft: 8 }}>{newColor}</span>
          </Box>
          <TextField
            select
            label="Posición"
            value={newPosition}
            onChange={e => setNewPosition(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          >
            {positionOptions.map(pos => (
              <MenuItem key={pos} value={pos}>
                {pos === items.length ? `Al final (${pos})` : pos}
              </MenuItem>
            ))}
          </TextField>
          {tab === 1 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isClosed}
                  onChange={e => setIsClosed(e.target.checked)}
                />
              }
              label="¿Es cerrado?"
              sx={{ mb: 2 }}
            />
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setAddOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleAdd} disabled={!newName.trim()}>Añadir</Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Diálogo para editar */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar {['Type', 'Status', 'Priority', 'Severity'][tab]}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nombre"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Color"
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              sx={{ width: 80, mr: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <span style={{ marginLeft: 8 }}>{newColor}</span>
          </Box>
          <TextField
            select
            label="Posición"
            value={newPosition}
            onChange={e => setNewPosition(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          >
            {positionOptions.map(pos => (
              <MenuItem key={pos} value={pos}>
                {pos === items.length ? `Al final (${pos})` : pos}
              </MenuItem>
            ))}
          </TextField>
          {tab === 1 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isClosed}
                  onChange={e => setIsClosed(e.target.checked)}
                />
              }
              label="¿Es cerrado?"
              sx={{ mb: 2 }}
            />
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setEditOpen(false)} sx={{ mr: 1 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleEdit} disabled={!newName.trim()}>Guardar</Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Diálogo para eliminar */}
      <Dialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setReplaceId(null); }}>
        <DialogTitle>¿Eliminar este elemento?</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que quieres eliminar <b>{selectedItem?.name}</b>?</Typography>
          <TextField
            select
            label="Reemplazar por"
            value={replaceId ?? ''}
            onChange={e => setReplaceId(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            {items
              .filter((item: any) => item.id !== selectedItem?.id)
              .map((item: any) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
          </TextField>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setDeleteOpen(false); setReplaceId(null); }} sx={{ mr: 1 }}>Cancelar</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={replaceId === null}
            >
              Eliminar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<'issues' | 'profile'>('issues');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const issueListRef = useRef<{ fetchData: () => void }>(null);

  useEffect(() => {
    if (currentPage === 'issues') {
      issueListRef.current?.fetchData(); // Llama a fetchData cuando se cambia a Issues
    }
  }, [currentPage]);
  
  // Función para ver el perfil de un usuario específico
  const handleViewUserProfile = (userId: number) => {
    setSelectedUserId(userId);
    setCurrentPage('profile');
  };

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
            <IconButton
              color="inherit"
              onClick={() => setSettingsOpen(true)}
              sx={{ ml: 2 }}
              aria-label="settings"
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
          {currentPage === 'issues' ? (
            <IssueList 
              ref={issueListRef} 
              onViewUserProfile={handleViewUserProfile}
            />
          ) : (
            <Profile 
              selectedUserId={selectedUserId} 
              onBackToIssues={() => {
                setSelectedUserId(null);
                setCurrentPage('issues');
              }}
            />
          )}
        </Box>
        <SettingsDialog open={settingsOpen} onClose={() => { setSettingsOpen(false); issueListRef.current?.fetchData();}} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
