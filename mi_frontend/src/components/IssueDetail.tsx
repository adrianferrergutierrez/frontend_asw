import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Button,
    Stack,
    Divider
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Issue } from '../types/index';

interface IssueDetailProps {
    open: boolean;
    onClose: () => void;
    issue: Issue | null;
    onEdit: (issue: Issue) => void;
    onDelete: (issue: Issue) => void;
}

const IssueDetail = ({ open, onClose, issue, onEdit, onDelete }: IssueDetailProps) => {
    if (!issue) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '80vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5">
                        {issue.subject}
                    </Typography>
                    <Box>
                        <IconButton 
                            size="small"
                            onClick={() => onEdit(issue)}
                            sx={{ mr: 1 }}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton 
                            size="small"
                            onClick={() => onDelete(issue)}
                            sx={{ mr: 1 }}
                        >
                            <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    {/* Estado y metadatos */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                            label={issue.issue_type.name} 
                            size="small" 
                            sx={{ backgroundColor: issue.issue_type.color || '#e0e0e0' }}
                        />
                        <Chip 
                            label={issue.severity.name} 
                            size="small" 
                            sx={{ backgroundColor: issue.severity.color || '#e0e0e0' }}
                        />
                        <Chip 
                            label={issue.priority.name} 
                            size="small" 
                            sx={{ backgroundColor: issue.priority.color || '#e0e0e0' }}
                        />
                        <Chip 
                            label={issue.status.name} 
                            size="small" 
                            sx={{ backgroundColor: issue.status.color || '#e0e0e0' }}
                        />
                    </Box>

                    <Divider />

                    {/* Descripción */}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Descripción
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {issue.content}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Información adicional */}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Información
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                <strong>Creado por:</strong> {issue.user?.username || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Asignado a:</strong> {issue.assignee?.username || 'No asignado'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Fecha de creación:</strong> {new Date(issue.created_at).toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Última modificación:</strong> {new Date(issue.updated_at).toLocaleString()}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default IssueDetail; 