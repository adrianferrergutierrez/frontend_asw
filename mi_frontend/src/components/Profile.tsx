import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Tabs,
    Tab,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { getIssues, getUsers, updateUser, updateUserProfilePic, getIssueComments } from '../services/api';
import type { Issue, UserDetail, Comment } from '../types/index';
import IssueDetail from './IssueDetail';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface ProfileProps {
    selectedUserId?: number | null;
    onBackToIssues?: () => void;
}

const Profile = ({ selectedUserId, onBackToIssues }: ProfileProps) => {
    const [user, setUser] = useState<UserDetail | null>(() => {
        const savedUser = localStorage.getItem('selectedUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editedBio, setEditedBio] = useState('');
    const [userComments, setUserComments] = useState<Array<Comment & { issueSubject: string; issueId: number }>>([]);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [issueDetailOpen, setIssueDetailOpen] = useState(false);
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, issuesResponse] = await Promise.all([
                    getUsers(),
                    getIssues()
                ]);
                
                setUsers(usersResponse.data);
                setIssues(issuesResponse.data);
                
                // Si hay un userId específico, seleccionar ese usuario
                if (selectedUserId) {
                        const selectedUser = usersResponse.data.find((u: UserDetail) => u.id === selectedUserId);                    if (selectedUser) {
                        setUser(selectedUser);
                    }
                }
                // Si no hay usuario seleccionado, seleccionar el primero o el del localStorage
                else if (!user && usersResponse.data.length > 0) {
                    const firstUser = usersResponse.data[0];
                    setUser(firstUser);
                    localStorage.setItem('selectedUser', JSON.stringify(firstUser));
                }

                // Obtener comentarios para cada issue
                const commentsPromises = issuesResponse.data.map((issue: Issue) => 
                    getIssueComments(issue.id)
                        .then(response => ({
                            issueId: issue.id,
                            issueSubject: issue.subject,
                            comments: response.data
                        }))
                        .catch(error => {
                            console.error(`Error fetching comments for issue ${issue.id}:`, error);
                            return {
                                issueId: issue.id,
                                issueSubject: issue.subject,
                                comments: []
                            };
                        })
                );

                const commentsResults = await Promise.all(commentsPromises);
                const allComments = commentsResults.flatMap(result => 
                    result.comments.map((comment: Comment) => ({
                        ...comment,
                        issueSubject: result.issueSubject,
                        issueId: result.issueId
                    }))
                );

                setUserComments(allComments.filter(comment => comment.user.id === user?.id));
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Error al cargar los datos del perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (user && issues.length > 0) {
            const userComments = issues.flatMap(issue => {
                if (!issue.comments) return [];
                return issue.comments
                    .filter(comment => comment.user.id === user.id)
                    .map(comment => ({
                        ...comment,
                        issueSubject: issue.subject,
                        issueId: issue.id
                    }));
            });
            setUserComments(userComments);
        }
    }, [user, issues]);

    const handleUserChange = (event: any) => {
        const selectedUser = users.find(u => u.id === event.target.value);
        if (selectedUser) {
            setUser(selectedUser);
            localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleEditClick = () => {
        setEditedBio(user?.bio || '');
        setEditDialogOpen(true);
    };

    const handleSaveBio = async () => {
        if (!user) return;
        
        try {
            const updateData = {
                bio: editedBio.trim()
            };
            
            console.log('Sending update request with data:', updateData);
            
            const response = await updateUser(user.id, updateData);
            
            console.log('Update response:', response);
            if (response.data && response.data.bio) {
                setUser(prev => prev ? { ...prev, bio: response.data.bio } : null);
                setEditDialogOpen(false);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error('Error updating bio:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config
            });
            setError('Error al actualizar la biografía');
        }
    };
    
    const handleProfilePicClick = () => {
        if (!user) return;
        
        // Solo permitir editar la foto si es el usuario seleccionado actualmente
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !event.target.files || event.target.files.length === 0) return;
        
        try {
            setUploadingProfilePic(true);
            const file = event.target.files[0];
            const response = await updateUserProfilePic(user.id, file);
            
            if (response.data && response.data.avatar_url) {
                setUser(prev => prev ? { ...prev, avatar_url: response.data.avatar_url } : null);
                // Actualizar el usuario en localStorage
                if (user) {
                    const updatedUser = { ...user, avatar_url: response.data.avatar_url };
                    localStorage.setItem('selectedUser', JSON.stringify(updatedUser));
                }
            }
        } catch (err: any) {
            console.error('Error updating profile picture:', err);
            setError('Error al actualizar la foto de perfil');
        } finally {
            setUploadingProfilePic(false);
            // Limpiar el input de archivo
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleIssueClick = (issue: Issue) => {
        console.log('Current user when opening issue:', user);
        if (!user) {
            console.error('No user selected');
            return;
        }
        setSelectedIssue(issue);
        setIssueDetailOpen(true);
    };

    const handleCloseIssueDetail = () => {
        setIssueDetailOpen(false);
        setSelectedIssue(null);
    };

    const handleEditIssue = (issue: Issue) => {
        // Aquí podrías implementar la lógica de edición si es necesario
        console.log('Edit issue:', issue);
    };

    const handleDeleteIssue = (issue: Issue) => {
        // Aquí podrías implementar la lógica de eliminación si es necesario
        console.log('Delete issue:', issue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="warning">No se encontró información del usuario</Alert>
            </Box>
        );
    }

    const createdIssues = issues.filter(issue => issue.user_id === user.id);
    const assignedIssues = issues.filter(issue => issue.assignee_id === user.id);
    const watchedIssues = issues.filter(issue => issue.watcher_ids?.includes(user.id) || false);

    return (
        <Box sx={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }}>
            <Card sx={{ width: '100%', borderRadius: 0, mb: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {onBackToIssues && (
                        <Button 
                            variant="outlined" 
                            onClick={onBackToIssues}
                            sx={{ mr: 2 }}
                        >
                            Volver a Issues
                        </Button>
                    )}
                    <FormControl fullWidth>
                        <InputLabel>Seleccionar Usuario</InputLabel>
                        <Select
                            value={user.id}
                            label="Seleccionar Usuario"
                            onChange={handleUserChange}
                            disabled={!!selectedUserId}
                        >
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name || u.email}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: 0 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={user.avatar_url}
                                        alt={user.name}
                                        sx={{ 
                                            width: 120, 
                                            height: 120, 
                                            mb: 2,
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 }
                                        }}
                                        onClick={handleProfilePicClick}
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleProfilePicChange}
                                    />
                                    <Tooltip title="Cambiar foto de perfil">
                                        <IconButton 
                                            sx={{ 
                                                position: 'absolute', 
                                                bottom: 16, 
                                                right: 0,
                                                backgroundColor: 'white',
                                                '&:hover': { backgroundColor: '#f5f5f5' }
                                            }}
                                            size="small"
                                            onClick={handleProfilePicClick}
                                            disabled={uploadingProfilePic}
                                        >
                                            <PhotoCameraIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Typography variant="h5" gutterBottom>
                                    {user.name || user.email}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {user.email}
                                </Typography>
                                <Box sx={{ mt: 2, textAlign: 'center', position: 'relative', width: '100%' }}>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                        {user.bio ? (
                                            <Typography variant="body2" color="textSecondary">
                                                {user.bio}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                No hay biografía
                                            </Typography>
                                        )}
                                        <IconButton 
                                            size="small" 
                                            onClick={handleEditClick}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ width: { xs: '100%', md: '67%' } }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Estadísticas
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 8px)' } }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h4" align="center">
                                                    {createdIssues.length}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" align="center">
                                                    Issues creados
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                    <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 8px)' } }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h4" align="center">
                                                    {assignedIssues.length}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" align="center">
                                                    Issues asignados
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                    <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 8px)' } }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h4" align="center">
                                                    {watchedIssues.length}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" align="center">
                                                    Issues seguidos
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                    <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 8px)' } }}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h4" align="center">
                                                    {userComments.length}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" align="center">
                                                    Comentarios
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mt: 4, px: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                    <Tab label="Issues creados" />
                    <Tab label="Issues asignados" />
                    <Tab label="Issues seguidos" />
                    <Tab label="Mis comentarios" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Stack spacing={2}>
                        {createdIssues.map(issue => (
                            <Card 
                                key={issue.id}
                                onClick={() => handleIssueClick(issue)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <CardContent>
                                    <Typography variant="h6">{issue.subject}</Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {issue.content}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip 
                                            label={issue.issue_type.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.issue_type.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.severity.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.severity.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.priority.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.priority.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.status.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.status.color || '#e0e0e0' }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        {createdIssues.length === 0 && (
                            <Typography color="textSecondary" align="center">
                                No has creado ningún issue aún
                            </Typography>
                        )}
                    </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Stack spacing={2}>
                        {assignedIssues.map(issue => (
                            <Card 
                                key={issue.id}
                                onClick={() => handleIssueClick(issue)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <CardContent>
                                    <Typography variant="h6">{issue.subject}</Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {issue.content}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip 
                                            label={issue.issue_type.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.issue_type.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.severity.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.severity.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.priority.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.priority.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.status.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.status.color || '#e0e0e0' }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        {assignedIssues.length === 0 && (
                            <Typography color="textSecondary" align="center">
                                No tienes issues asignados
                            </Typography>
                        )}
                    </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Stack spacing={2}>
                        {watchedIssues.map(issue => (
                            <Card 
                                key={issue.id}
                                onClick={() => handleIssueClick(issue)}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <CardContent>
                                    <Typography variant="h6">{issue.subject}</Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        {issue.content}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip 
                                            label={issue.issue_type.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.issue_type.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.severity.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.severity.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.priority.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.priority.color || '#e0e0e0' }}
                                        />
                                        <Chip 
                                            label={issue.status.name} 
                                            size="small" 
                                            sx={{ mr: 1, backgroundColor: issue.status.color || '#e0e0e0' }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        {watchedIssues.length === 0 && (
                            <Typography color="textSecondary" align="center">
                                No estás siguiendo ningún issue
                            </Typography>
                        )}
                    </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Stack spacing={2}>
                        {userComments.map(comment => (
                            <Card key={`${comment.issueId}-${comment.id}`}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Comentario en: {comment.issueSubject}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {comment.content}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                        {userComments.length === 0 && (
                            <Typography color="textSecondary" align="center">
                                No has realizado ningún comentario
                            </Typography>
                        )}
                    </Stack>
                </TabPanel>
            </Box>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Editar Biografía</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Biografía"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveBio} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {issueDetailOpen && selectedIssue && user && (
                <IssueDetail
                    open={issueDetailOpen}
                    onClose={handleCloseIssueDetail}
                    issue={selectedIssue}
                    onEdit={handleEditIssue}
                    onDelete={handleDeleteIssue}
                    currentUser={user}
                />
            )}
        </Box>
    );
};

export default Profile; 