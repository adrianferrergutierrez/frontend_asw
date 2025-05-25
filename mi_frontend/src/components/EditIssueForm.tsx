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
    Alert
} from '@mui/material';
import { updateIssue } from '../services/api';
import type { Issue, IssueType, Severity, Priority, Status } from '../types/index';

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
        status_id: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (issue) {
            setFormData({
                subject: issue.subject,
                content: issue.content,
                issue_type_id: issue.issue_type.id.toString(),
                severity_id: issue.severity.id.toString(),
                priority_id: issue.priority.id.toString(),
                status_id: issue.status.id.toString()
            });
        }
    }, [issue]);

    const handleChange = (field: string) => (event: any) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!issue) return;

        setLoading(true);
        setError(null);

        try {
            await updateIssue(issue.id, formData);
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditIssueForm; 