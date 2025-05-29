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
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    InputAdornment, // Added for search icon
    type SelectChangeEvent // Added for sort Select - type-only import
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload as CloudUploadIcon, Search as SearchIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material'; // Added SearchIcon // Added CloudUploadIcon for bulk // Added Sort Icons
import { getIssues, getIssueTypes, getSeverities, getPriorities, getStatuses, getUsers } from '../services/api';
import type { Issue, IssueType, Severity, Priority, Status, UserDetail } from '../types/index';
import CreateIssueForm from './CreateIssueForm';
import BulkIssueCreator from './BulkIssueCreator'; // Import BulkIssueCreator
import EditIssueForm from './EditIssueForm';
import DeleteIssueDialog from './DeleteIssueDialog';
import IssueDetail from './IssueDetail';
import React, {useImperativeHandle, forwardRef, useState, useEffect} from 'react';

interface IssueListFilters {
    title: string;
    description: string;
    issue_type_id: string;
    severity_id: string;
    priority_id: string;
    status_id: string;
    user_id: string;
    assignee_id: string;
    order_by: 'type' | 'severity' | 'priority' | 'issue' | 'status' | 'modified' | 'assign_to';
    order_direction: 'asc' | 'desc';
}

const IssueList = forwardRef((_props, ref) => { // props replaced with _props as it's unused
    const [issues, setIssues] = useState<Issue[]>([]);
    const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
    const [severities, setSeverities] = useState<Severity[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [users, setUsers] = useState<UserDetail[]>([]); // State for users list
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false); // State for bulk create dialog
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [currentUser] = useState<UserDetail | null>(() => {
        const savedUser = localStorage.getItem('selectedUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useImperativeHandle(ref, () => ({
        fetchData
    }))

    const [filters, setFilters] = useState<IssueListFilters>({
        title: '',
        description: '',
        issue_type_id: '',
        severity_id: '',
        priority_id: '',
        status_id: '',
        user_id: '',
        assignee_id: '',
        order_by: 'modified', // Default sort field aligned with API
        order_direction: 'desc' // Default sort direction
    });

    const fetchData = async () => {
        try {
            console.log('Fetching data...');
            const [issuesRes, typesRes, severitiesRes, prioritiesRes, statusesRes, usersRes] = await Promise.all([
                getIssues({ order_by: filters.order_by, order_direction: filters.order_direction }), // Pass sorting parameters
                getIssueTypes(),
                getSeverities(),
                getPriorities(),
                getStatuses(),
                getUsers()
            ]);

            console.log('Data received:', {
                issues: issuesRes.data,
                types: typesRes.data,
                severities: severitiesRes.data,
                priorities: prioritiesRes.data,
                statuses: statusesRes.data,
                users: usersRes.data
            });

            setIssues(issuesRes.data);
            setIssueTypes(typesRes.data);
            setSeverities(severitiesRes.data);
            setPriorities(prioritiesRes.data);
            setStatuses(statusesRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.error || err.message || 'Error al cargar los datos');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.order_by, filters.order_direction]); // Re-fetch when sort params change

    const handleFilterChange = (field: string) => (event: any) => {
        const value = event.target.value;
        console.log(`Filter ${field} changed to:`, value);
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const sortOptions = [
        { value: 'issue', label: 'Issue (ID/Título)' }, // Corresponds to API 'issue'
        { value: 'type', label: 'Tipo' },               // Corresponds to API 'type'
        { value: 'severity', label: 'Severidad' },         // Corresponds to API 'severity'
        { value: 'priority', label: 'Prioridad' },         // Corresponds to API 'priority'
        { value: 'status', label: 'Estado' },             // Corresponds to API 'status'
        { value: 'modified', label: 'Fecha de Modificación' }, // Corresponds to API 'modified'
        { value: 'assign_to', label: 'Asignado a' }      // Corresponds to API 'assign_to'
    ];

    const handleSortByChange = (event: SelectChangeEvent<string>) => {
        const newSortBy = event.target.value as IssueListFilters['order_by']; // Cast to the specific type
        console.log(`Sort by changed to:`, newSortBy);
        setFilters(prev => ({
            ...prev,
            order_by: newSortBy
        }));
    };

    const handleSortDirectionToggle = () => {
        const newDirection = filters.order_direction === 'asc' ? 'desc' : 'asc';
        console.log(`Sort direction changed to:`, newDirection);
        setFilters(prev => ({
            ...prev,
            order_direction: newDirection
        }));
    };

    // Filtrar los issues según los criterios seleccionados
    const filteredIssues = issues.filter(issue => {
        // Filtro por título o descripción (búsqueda parcial, no distingue mayúsculas/minúsculas)
        const searchTerm = filters.title.toLowerCase();
        const matchesSearchText = !filters.title || 
            issue.subject.toLowerCase().includes(searchTerm) || 
            (issue.content && typeof issue.content === 'string' && issue.content.toLowerCase().includes(searchTerm));

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

        // Filtro por creador
        const matchesCreator = !filters.user_id || 
            issue.user_id === parseInt(filters.user_id);

        // Filtro por asignado
        const matchesAssignee = !filters.assignee_id || 
            (filters.assignee_id === 'null' ? issue.assignee_id === null : issue.assignee_id === parseInt(filters.assignee_id));

        // Mostrar en consola para depuración
        console.log('Filtering issue:', {
            issue: issue.subject,
            searchText: filters.title,
            matchesSearchText,
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
            matchesStatus,
            creator: issue.user_id,
            filterCreator: filters.user_id,
            matchesCreator,
            assignee: issue.assignee_id,
            filterAssignee: filters.assignee_id,
            matchesAssignee
        });

        return matchesSearchText && matchesType && matchesSeverity && matchesPriority && matchesStatus && matchesCreator && matchesAssignee;
    });

    const handleIssueClick = (issue: Issue) => {
        if (!currentUser) {
            setError('Por favor, selecciona un usuario en la pestaña de Perfil antes de ver los detalles del issue');
            return;
        }
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{ minWidth: '150px' }}
                    >
                        Crear Issue
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => setBulkCreateDialogOpen(true)}
                        sx={{ minWidth: '150px', ml: 2 }}
                    >
                        Bulk Issues
                    </Button>
                </Box>
            </Stack>

            {/* Filtros */}
            <Box sx={{ mb: 3 }}> {/* Main container for all filters */}
                <Box sx={{ width: '100%', mb: 2 }}> {/* Search bar container */}
                    <TextField
                        fullWidth
                        label="Buscar"
                        value={filters.title}
                        onChange={handleFilterChange('title')}
                        placeholder="Buscar por título o descripción..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}> {/* Dropdowns container */}
                    {/* Tipo Filter */}
                    <Box sx={{ flex: '1 1 auto', minWidth: '180px' }}>
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
                    {/* Severidad Filter */}
                    <Box sx={{ flex: '1 1 auto', minWidth: '180px' }}>
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
                    {/* Prioridad Filter */}
                    <Box sx={{ flex: '1 1 auto', minWidth: '180px' }}>
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
                    {/* Estado Filter */}
                    <Box sx={{ flex: '1 1 auto', minWidth: '180px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={filters.status_id}
                                onChange={handleFilterChange('status_id')}
                                label="Estado"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {statuses.map((status: Status) => (
                                    <MenuItem key={status.id} value={status.id}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    {/* Creador Filter */}
                    <Box sx={{ flex: '1 1 auto', minWidth: '180px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Creador</InputLabel>
                            <Select
                                value={filters.user_id}
                                onChange={handleFilterChange('user_id')}
                                label="Creador"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {users.map((user: UserDetail) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name || user.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    {/* Asignado a Filter */}
                    <Box sx={{ flex: '1 1 auto', minWidth: '180px' }}>
                        <FormControl fullWidth>
                            <InputLabel>Asignado a</InputLabel>
                            <Select
                                value={filters.assignee_id}
                                onChange={handleFilterChange('assignee_id')}
                                label="Asignado a"
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="null">Nadie (Sin asignar)</MenuItem>
                                {users.map((user: UserDetail) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name || user.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
                {/* Sorting Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    <FormControl sx={{ minWidth: 220, flexGrow: 1, maxWidth: { xs: 'calc(100% - 60px)', sm: 300 } }} size="small">
                        <InputLabel id="sort-by-label">Ordenar por</InputLabel>
                        <Select
                            labelId="sort-by-label"
                            value={filters.order_by}
                            label="Ordenar por"
                            onChange={handleSortByChange}
                        >
                            {sortOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <IconButton onClick={handleSortDirectionToggle} color="primary" aria-label="toggle sort direction">
                        {filters.order_direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    </IconButton>
                </Box>
            </Box>
            {/* Lista de Issues */}
            <Stack spacing={2}>
                {filteredIssues.length === 0 ? (
                    <Alert severity="info">
                        No se encontraron issues que coincidan con los filtros.
                    </Alert>
                ) : (
                    filteredIssues.map((issue: Issue) => {
                        const assignee = issue.assignee_id ? users.find(u => u.id === issue.assignee_id) : null;
                        const assigneeName = assignee ? (assignee.name || assignee.username) : 'Sin asignar';
                        const creatorDetail = issue.user ? users.find(u => u.id === issue.user.id) : null;
                        const creatorName = creatorDetail ? (creatorDetail.name || creatorDetail.username) : (issue.user ? issue.user.email : 'Desconocido');

                        return (
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
                                        <Typography variant="h6">{`#${issue.id} ${issue.subject}`}</Typography>
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
                                        {/* NEW SECTION FOR ADDITIONAL INFO */}
                                        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
                                            <Typography variant="body2" color="textSecondary" component="div" sx={{ mb: 0.25 }}>
                                                <strong>Creador:</strong> {creatorName}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" component="div" sx={{ mb: 0.25 }}>
                                                <strong>Asignado a:</strong> {assigneeName}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" component="div">
                                                <strong>Última mod.:</strong> {new Date(issue.updated_at).toLocaleDateString()}
                                            </Typography>
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
                    );
                })
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
                currentUser={currentUser!}
            />

            {/* Bulk Issue Creator Dialog */}
            <Dialog open={bulkCreateDialogOpen} onClose={() => setBulkCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Issues</DialogTitle>
                <DialogContent>
                    <BulkIssueCreator 
                        onClose={() => setBulkCreateDialogOpen(false)} 
                        onSuccess={() => {
                            fetchData(); // Refresh issues list
                            setBulkCreateDialogOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
});

export default IssueList; 