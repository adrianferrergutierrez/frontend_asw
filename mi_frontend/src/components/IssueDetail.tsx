import { useState, useEffect } from 'react';
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
    Divider,
    Avatar,
    TextField
} from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon, Send as SendIcon } from '@mui/icons-material';
import type { Issue, UserDetail, Comment } from '../types/index';
import { getUsers, getIssueComments, createComment } from '../services/api';

interface IssueDetailProps {
    open: boolean;
    onClose: () => void;
    issue: Issue | null;
    onEdit: (issue: Issue) => void;
    onDelete: (issue: Issue) => void;
}

const IssueDetail = ({ open, onClose, issue, onEdit, onDelete }: IssueDetailProps) => {
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (issue) {
                try {
                    setLoading(true);
                    const [usersResponse, commentsResponse] = await Promise.all([
                        getUsers(),
                        getIssueComments(issue.id)
                    ]);
                    setUsers(usersResponse.data);
                    setComments(commentsResponse.data);
                } catch (error) {
                    console.error('Error fetching issue details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [issue]);

    const handleAddComment = async () => {
        if (!issue || !newComment.trim()) return;

        try {
            const response = await createComment(issue.id, { content: newComment.trim() });
            const currentUser = users.find(u => u.id === response.data.user_id);
            const newCommentWithUser = {
                ...response.data,
                user: currentUser || response.data.user
            };
            setComments(prev => [...prev, newCommentWithUser]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    if (!issue) return null;

    const getAssigneeName = () => {
        const assignee = users.find(u => u.id === issue.assignee_id);
        return assignee ? assignee.name || assignee.email : 'No asignado';
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{issue.subject}</Typography>
                    <Box>
                        <IconButton onClick={() => onEdit(issue)} size="small">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => onDelete(issue)} size="small">
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
                    <Box>
                        <Typography variant="body1" paragraph>
                            {issue.content}
                        </Typography>
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
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                            Creado por: {issue.user.name || issue.user.email}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                            Asignado a: {getAssigneeName()}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                            Fecha de creación: {new Date(issue.created_at).toLocaleString()}
                        </Typography>
                        {issue.deadline && (
                            <Typography variant="subtitle2" color="textSecondary">
                                Fecha límite: {new Date(issue.deadline).toLocaleString()}
                            </Typography>
                        )}
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Comentarios
                        </Typography>
                        <Stack spacing={2}>
                            {comments.map(comment => (
                                <Box key={comment.id} sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar 
                                        src={comment.user?.avatar_url} 
                                        alt={comment.user?.name || comment.user?.email || 'Usuario'} 
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2">
                                            {comment.user?.name || comment.user?.email || 'Usuario'}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            {comment.content}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                            {comments.length === 0 && (
                                <Typography color="textSecondary" align="center">
                                    No hay comentarios
                                </Typography>
                            )}
                        </Stack>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Escribe un comentario..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                multiline
                                rows={2}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                sx={{ alignSelf: 'flex-end' }}
                            >
                                <SendIcon />
                            </Button>
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default IssueDetail; 