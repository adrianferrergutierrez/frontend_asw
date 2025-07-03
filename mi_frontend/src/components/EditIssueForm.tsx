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
import { updateIssue, getUsers } from '../services/api';
import type { Issue, IssueType, Severity, Priority, Status, User } from '../types/index';

interface EditIssueFormProps {
    open: boolean;
    onClose: () => void;
    onIssueUpdated: () => void;
    issue: Issue | null;
    issueTypes: IssueType[];
    severities: Severity[];
    priorities: Priority[];
    statuses: Status[];
}

const EditIssueForm = ({
    open,
    onClose,
    onIssueUpdated,
    issue,
    issueTypes,
    severities,
    priorities,
    statuses
}: EditIssueFormProps) => {
    const [formData, setFormData] = useState({
        subject: '',
        content: '',
        issue_type_id: '',
        severity_id: '',
        priority_id: '',
        status_id: '',
        assignee_id: '',
        deadline: null as Date | null,
        watcher_ids: [] as number[]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
            } catch (err: any) {
                console.error('Error fetching users:', err);
                setError(err.response?.data?.error || err.message || 'Error al cargar los usuarios');
            }
        };

        if (open) {
            fetchUsers();
        }
    }, [open]);

    useEffect(() => {
        if (issue) {
            setFormData({
                subject: issue.subject,
                content: issue.content,
                issue_type_id: issue.issue_type.id.toString(),
                severity_id: issue.severity.id.toString(),
                priority_id: issue.priority.id.toString(),
                status_id: issue.status.id.toString(),
                assignee_id: issue.assignee_id ? issue.assignee_id.toString() : '',
                deadline: issue.deadline ? new Date(issue.deadline) : null,
                watcher_ids: issue.watcher_ids || []
            });
        }
    }, [issue]);

    const handleChange = (field: string) => (event: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleDateChange = (newDate: Date | null) => {
        setFormData(prev => ({
            ...prev,
            deadline: newDate
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!issue) return;

        setLoading(true);
        setError(null);

        try {
            const issueData = {
                ...formData,
                issue_type_id: parseInt(formData.issue_type_id),
                severity_id: parseInt(formData.severity_id),
                priority_id: parseInt(formData.priority_id),
                status_id: parseInt(formData.status_id),
                assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
                deadline: formData.deadline ? formData.deadline.toISOString() : null,
                // Asegurarnos de que watcher_ids se incluya explícitamente
                watcher_ids: formData.watcher_ids
            };

            console.log('Updating issue with data:', issueData);
            await updateIssue(issue.id, issueData);
            onIssueUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error updating issue:', err);
            setError(err.response?.data?.error || err.message || 'Error al actualizar el issue');
        } finally {
            setLoading(false);
        }
    };

    if (!issue) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Editar Issue</DialogTitle>
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
                                <MenuItem value="">
                                    <em>Sin asignar</em>
                                </MenuItem>
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
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditIssueForm; 