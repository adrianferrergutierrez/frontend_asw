import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert
} from '@mui/material';
import { deleteIssue } from '../services/api';
import type { Issue } from '../types/index';
import { useState } from 'react';

interface DeleteIssueDialogProps {
    open: boolean;
    onClose: () => void;
    onIssueDeleted: () => void;
    issue: Issue | null;
}

const DeleteIssueDialog = ({
    open,
    onClose,
    onIssueDeleted,
    issue
}: DeleteIssueDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!issue) return;

        setLoading(true);
        setError(null);

        try {
            await deleteIssue(issue.id);
            onIssueDeleted();
            onClose();
        } catch (err: any) {
            console.error('Error deleting issue:', err);
            setError(err.response?.data?.error || err.message || 'Error al eliminar el issue');
        } finally {
            setLoading(false);
        }
    };

    if (!issue) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Eliminar Issue</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography>
                    ¿Estás seguro de que deseas eliminar el issue "{issue.subject}"?
                    Esta acción no se puede deshacer.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleDelete} 
                    color="error" 
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteIssueDialog; 