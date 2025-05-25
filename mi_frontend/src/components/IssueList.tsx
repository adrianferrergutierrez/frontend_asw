import { useState, useEffect } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Chip,
    IconButton,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
    Stack
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getIssues, getIssueTypes, getSeverities, getPriorities, getStatuses } from '../services/api';
import type { Issue, IssueType, Severity, Priority, Status } from '../types/index';
import CreateIssueForm from './CreateIssueForm';
import EditIssueForm from './EditIssueForm';
import DeleteIssueDialog from './DeleteIssueDialog';
import IssueDetail from './IssueDetail';

const IssueList = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
    const [severities, setSeverities] = useState<Severity[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
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

    const fetchData = async () => {
        try {
            console.log('Fetching data...');
            const [issuesRes, typesRes, severitiesRes, prioritiesRes, statusesRes] = await Promise.all([
                getIssues(),
                getIssueTypes(),
                getSeverities(),
                getPriorities(),
                getStatuses()
            ]);

            console.log('Data received:', {
                issues: issuesRes.data,
                types: typesRes.data,
                severities: severitiesRes.data,
                priorities: prioritiesRes.data,
                statuses: statusesRes.data
            });

            setIssues(issuesRes.data);
            setIssueTypes(typesRes.data);
            setSeverities(severitiesRes.data);
            setPriorities(prioritiesRes.data);
            setStatuses(statusesRes.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.error || err.message || 'Error al cargar los datos');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (field: string) => (event: any) => {
        const value = event.target.value;
        console.log(`Filter ${field} changed to:`, value);
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Filtrar los issues según los criterios seleccionados
    const filteredIssues = issues.filter(issue => {
        // Filtro por título (búsqueda parcial, no distingue mayúsculas/minúsculas)
        const matchesTitle = !filters.title || 
            issue.subject.toLowerCase().includes(filters.title.toLowerCase());

        // Filtro por tipo de issue
        const matchesType = !filters.issue_type_id || 
            issue.issue_type.id === parseInt(filters.issue_type_id);

        // Filtro por severidad
        const matchesSeverity = !filters.severity_id || 
            issue.severity.id === parseInt(filters.severity_id);

        // Filtro por prioridad
        const matchesPriority = !filters.priority_id || 
            issue.priority.id === parseInt(filters.priority_id);

        // Filtro por estado
        const matchesStatus = !filters.status_id || 
            issue.status.id === parseInt(filters.status_id);

        // Mostrar en consola para depuración
        console.log('Filtering issue:', {
            issue: issue.subject,
            title: filters.title,
            matchesTitle,
            type: issue.issue_type.id,
            filterType: filters.issue_type_id,
            matchesType,
            severity: issue.severity.id,
            filterSeverity: filters.severity_id,
            matchesSeverity,
            priority: issue.priority.id,
            filterPriority: filters.priority_id,
            matchesPriority,
            status: issue.status.id,
            filterStatus: filters.status_id,
            matchesStatus
        });

        return matchesTitle && matchesType && matchesSeverity && matchesPriority && matchesStatus;
    });

    const handleIssueClick = (issue: Issue) => {
        setSelectedIssue(issue);
        setDetailDialogOpen(true);
    };

    const handleEditClick = (event: React.MouseEvent, issue: Issue) => {
        event.stopPropagation();
        setSelectedIssue(issue);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (event: React.MouseEvent, issue: Issue) => {
        event.stopPropagation();
        setSelectedIssue(issue);
        setDeleteDialogOpen(true);
    };

    if (loading) return (
        <Box sx={{ p: 3 }}>
            <Typography>Cargando...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error">
                {error}
            </Alert>
        </Box>
    );

    return (
        <Box sx={{ 
            p: 3, 
            width: '100%', 
            maxWidth: '100%',
            minHeight: '100vh',
            boxSizing: 'border-box'
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4">
                    Issues
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{ minWidth: '150px' }}
                >
                    Crear Issue
                </Button>
            </Stack>

            {/* Filtros */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                        fullWidth
                        label="Título"
                        value={filters.title}
                        onChange={handleFilterChange('title')}
                        placeholder="Buscar por título..."
                    />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            value={filters.issue_type_id}
                            onChange={handleFilterChange('issue_type_id')}
                            label="Tipo"
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {issueTypes.map((type: IssueType) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <FormControl fullWidth>
                        <InputLabel>Severidad</InputLabel>
                        <Select
                            value={filters.severity_id}
                            onChange={handleFilterChange('severity_id')}
                            label="Severidad"
                        >
                            <MenuItem value="">Todas</MenuItem>
                            {severities.map((severity: Severity) => (
                                <MenuItem key={severity.id} value={severity.id}>
                                    {severity.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <FormControl fullWidth>
                        <InputLabel>Prioridad</InputLabel>
                        <Select
                            value={filters.priority_id}
                            onChange={handleFilterChange('priority_id')}
                            label="Prioridad"
                        >
                            <MenuItem value="">Todas</MenuItem>
                            {priorities.map((priority: Priority) => (
                                <MenuItem key={priority.id} value={priority.id}>
                                    {priority.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Lista de Issues */}
            <Stack spacing={2}>
                {filteredIssues.length === 0 ? (
                    <Alert severity="info">
                        No se encontraron issues que coincidan con los filtros.
                    </Alert>
                ) : (
                    filteredIssues.map((issue: Issue) => (
                        <Card 
                            key={issue.id}
                            onClick={() => handleIssueClick(issue)}
                            sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
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
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => handleEditClick(e, issue)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => handleDeleteClick(e, issue)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack>

            <CreateIssueForm
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onIssueCreated={fetchData}
                issueTypes={issueTypes}
                severities={severities}
                priorities={priorities}
                statuses={statuses}
            />

            <EditIssueForm
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedIssue(null);
                }}
                onIssueUpdated={fetchData}
                issue={selectedIssue}
                issueTypes={issueTypes}
                severities={severities}
                priorities={priorities}
                statuses={statuses}
            />

            <DeleteIssueDialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setSelectedIssue(null);
                }}
                onIssueDeleted={fetchData}
                issue={selectedIssue}
            />

            <IssueDetail
                open={detailDialogOpen}
                onClose={() => {
                    setDetailDialogOpen(false);
                    setSelectedIssue(null);
                }}
                issue={selectedIssue}
                onEdit={(issue) => {
                    setDetailDialogOpen(false);
                    setSelectedIssue(issue);
                    setEditDialogOpen(true);
                }}
                onDelete={(issue) => {
                    setDetailDialogOpen(false);
                    setSelectedIssue(issue);
                    setDeleteDialogOpen(true);
                }}
            />
        </Box>
    );
};

export default IssueList; 