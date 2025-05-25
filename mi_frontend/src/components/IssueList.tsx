import { useState, useEffect } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Grid, 
    Chip,
    IconButton,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getIssues, getIssueTypes, getSeverities, getPriorities, getStatuses } from '../services/api';
import { Issue, IssueType, Severity, Priority, Status } from '../types';

const IssueList = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
    const [severities, setSeverities] = useState<Severity[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        title: '',
        description: '',
        issue_type_id: '',
        severity_id: '',
        priority_id: '',
        status_id: '',
        order_by: 'modified',
        order_direction: 'desc'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issuesRes, typesRes, severitiesRes, prioritiesRes, statusesRes] = await Promise.all([
                    getIssues(),
                    getIssueTypes(),
                    getSeverities(),
                    getPriorities(),
                    getStatuses()
                ]);

                setIssues(issuesRes.data);
                setIssueTypes(typesRes.data);
                setSeverities(severitiesRes.data);
                setPriorities(prioritiesRes.data);
                setStatuses(statusesRes.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFilterChange = (field: string) => (event: any) => {
        setFilters({
            ...filters,
            [field]: event.target.value
        });
    };

    if (loading) return <Typography>Cargando...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Issues
            </Typography>

            {/* Filtros */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Título"
                        value={filters.title}
                        onChange={handleFilterChange('title')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            value={filters.issue_type_id}
                            onChange={handleFilterChange('issue_type_id')}
                            label="Tipo"
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {issueTypes.map(type => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Severidad</InputLabel>
                        <Select
                            value={filters.severity_id}
                            onChange={handleFilterChange('severity_id')}
                            label="Severidad"
                        >
                            <MenuItem value="">Todas</MenuItem>
                            {severities.map(severity => (
                                <MenuItem key={severity.id} value={severity.id}>
                                    {severity.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Prioridad</InputLabel>
                        <Select
                            value={filters.priority_id}
                            onChange={handleFilterChange('priority_id')}
                            label="Prioridad"
                        >
                            <MenuItem value="">Todas</MenuItem>
                            {priorities.map(priority => (
                                <MenuItem key={priority.id} value={priority.id}>
                                    {priority.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Lista de Issues */}
            <Grid container spacing={2}>
                {issues.map(issue => (
                    <Grid item xs={12} key={issue.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
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
                                    </Box>
                                    <Box>
                                        <IconButton size="small">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default IssueList; 