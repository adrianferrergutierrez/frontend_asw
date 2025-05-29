import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    OutlinedInput,
    Checkbox,
    ListItemText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { createIssue, getUsers } from '../services/api';
import type { IssueType, Severity, Priority, Status } from '../types';

interface CreateIssueFormProps {
    open: boolean;
    onClose: () => void;
    onIssueCreated: () => void;
    issueTypes: IssueType[];
    severities: Severity[];
    priorities: Priority[];
    statuses: Status[];
    currentUser?: any;
}

const CreateIssueForm = ({ 
    open, 
    onClose, 
    onIssueCreated,
    issueTypes,
    severities,
    priorities,
    statuses,
    currentUser 
}: CreateIssueFormProps) => {
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        issue_type_id: '',
        severity_id: '',
        priority_id: '',
        status_id: '',
        assignee_id: '',
        deadline: null as Date | null,
        watcher_ids: [] as number[],
        user_id: currentUser?.id || ''
    });
    
    const [users, setUsers] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        
        fetchUsers();
    }, []);
    
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                user_id: currentUser.id
            }));
        }
    }, [currentUser]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string) => (event: any) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };
    
    const handleDateChange = (newDate: Date | null) => {
        setFormData({
            ...formData,
            deadline: newDate
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Preparar los datos para enviar
            const issueData = {
                ...formData,
                // Convertir el deadline a formato ISO si existe
                deadline: formData.deadline ? formData.deadline.toISOString() : null,
                // Asegurarse de que los IDs sean números
                issue_type_id: parseInt(formData.issue_type_id as string),
                severity_id: parseInt(formData.severity_id as string),
                priority_id: parseInt(formData.priority_id as string),
                status_id: parseInt(formData.status_id as string),
                assignee_id: formData.assignee_id ? parseInt(formData.assignee_id as string) : null,
                user_id: parseInt(formData.user_id as string),
                // Asegurarse de que watcher_ids se incluya explícitamente
                watcher_ids: formData.watcher_ids
            };
            
            console.log('Sending issue data:', issueData);
            await createIssue(issueData);
            onIssueCreated();
            onClose();
            setFormData({
                subject: '',
                content: '',
                issue_type_id: '',
                severity_id: '',
                priority_id: '',
                status_id: '',
                assignee_id: '',
                deadline: null,
                watcher_ids: [],
                user_id: currentUser?.id || ''
            });
        } catch (err: any) {
            console.error('Error creating issue:', err);
            setError(err.response?.data?.error || err.message || 'Error al crear el issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Crear Nuevo Issue</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Título"
                            value={formData.subject}
                            onChange={handleChange('subject')}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Descripción"
                            value={formData.content}
                            onChange={handleChange('content')}
                            required
                            fullWidth
                            multiline
                            rows={4}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={formData.issue_type_id}
                                onChange={handleChange('issue_type_id')}
                                label="Tipo"
                                required
                            >
                                {issueTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Severidad</InputLabel>
                            <Select
                                value={formData.severity_id}
                                onChange={handleChange('severity_id')}
                                label="Severidad"
                                required
                            >
                                {severities.map((severity) => (
                                    <MenuItem key={severity.id} value={severity.id}>
                                        {severity.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Prioridad</InputLabel>
                            <Select
                                value={formData.priority_id}
                                onChange={handleChange('priority_id')}
                                label="Prioridad"
                                required
                            >
                                {priorities.map((priority) => (
                                    <MenuItem key={priority.id} value={priority.id}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={formData.status_id}
                                onChange={handleChange('status_id')}
                                label="Estado"
                                required
                            >
                                {statuses.map((status) => (
                                    <MenuItem key={status.id} value={status.id}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Asignar a</InputLabel>
                            <Select
                                value={formData.assignee_id}
                                onChange={handleChange('assignee_id')}
                                label="Asignar a"
                            >
                                <MenuItem value="">Sin asignar</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name || user.email}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Observadores</InputLabel>
                            <Select
                                multiple
                                value={formData.watcher_ids}
                                onChange={handleChange('watcher_ids')}
                                input={<OutlinedInput label="Observadores" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as number[]).map((value) => {
                                            const user = users.find(u => u.id === value);
                                            return (
                                                <Chip 
                                                    key={value} 
                                                    label={user ? (user.name || user.email) : `Usuario ${value}`} 
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        <Checkbox checked={formData.watcher_ids.indexOf(user.id) > -1} />
                                        <ListItemText primary={user.name || user.email} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Fecha límite"
                                value={formData.deadline}
                                onChange={handleDateChange}
                                slotProps={{ 
                                    textField: { 
                                        fullWidth: true,
                                        variant: 'outlined'
                                    } 
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear Issue'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateIssueForm; 