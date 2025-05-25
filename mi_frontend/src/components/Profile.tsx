import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Tabs,
    Tab,
    Grid,
    Chip,
    Divider,
    Stack,
    CircularProgress,
    Alert
} from '@mui/material';
import { getIssues, getUsers } from '../services/api';
import type { Issue, UserDetail } from '../types/index';

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

const Profile = () => {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, issuesResponse] = await Promise.all([
                    getUsers(),
                    getIssues()
                ]);
                
                // Por ahora, tomamos el primer usuario como ejemplo
                // En una implementación real, esto vendría de la autenticación
                const currentUser = usersResponse.data[0];
                setUser(currentUser);
                setIssues(issuesResponse.data);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Error al cargar los datos del perfil');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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
            <Card sx={{ width: '100%', borderRadius: 0 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        <Box sx={{ width: { xs: '100%', md: '33%' } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    src={user.avatar_url}
                                    alt={user.name}
                                    sx={{ width: 120, height: 120, mb: 2 }}
                                />
                                <Typography variant="h5" gutterBottom>
                                    {user.name || user.email}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {user.email}
                                </Typography>
                                {user.bio && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                                        {user.bio}
                                    </Typography>
                                )}
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
                                                    {issues.reduce((count, issue) => count + (issue.comments?.length || 0), 0)}
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
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Stack spacing={2}>
                        {createdIssues.map(issue => (
                            <Card key={issue.id}>
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
                            <Card key={issue.id}>
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
                            <Card key={issue.id}>
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
            </Box>
        </Box>
    );
};

export default Profile; 