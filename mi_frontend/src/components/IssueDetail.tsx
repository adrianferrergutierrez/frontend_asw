import { useState, useEffect, useRef } from 'react';
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
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Link,
    Tooltip
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Send as SendIcon, 
    AttachFile as AttachFileIcon,
    Download as DownloadIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import type { Issue, UserDetail, Comment, Attachment } from '../types/index';
import { 
    getUsers, 
    getIssueComments, 
    createComment, 
    getIssueAttachments, 
    uploadAttachment, 
    deleteAttachment 
} from '../services/api';

interface IssueDetailProps {
    open: boolean;
    onClose: () => void;
    issue: Issue | null;
    onEdit: (issue: Issue) => void;
    onDelete: (issue: Issue) => void;
    currentUser: UserDetail;
    onViewUserProfile?: (userId: number) => void;
}

const IssueDetail = ({ open, onClose, issue, onEdit, onDelete, currentUser, onViewUserProfile }: IssueDetailProps) => {
    console.log('IssueDetail mounted with user:', currentUser);
    
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setNewComment('');
            setComments([]);
        }
    }, [open]);

    useEffect(() => {
        console.log('IssueDetail effect running with user:', currentUser);
        const fetchData = async () => {
            if (issue && currentUser) {
                try {
                    setLoading(true);
                    const [usersResponse, commentsResponse, attachmentsResponse] = await Promise.all([
                        getUsers(),
                        getIssueComments(issue.id),
                        getIssueAttachments(issue.id)
                    ]);
                    setUsers(usersResponse.data);
                    setComments(commentsResponse.data);
                    setAttachments(attachmentsResponse.data);
                } catch (error) {
                    console.error('Error fetching issue details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [issue, currentUser]);

    const handleAddComment = async () => {
        console.log('Attempting to add comment with user:', currentUser);
        if (!issue || !newComment.trim() || !currentUser) {
            console.error('Cannot create comment: missing required data', {
                hasIssue: !!issue,
                hasComment: !!newComment.trim(),
                hasUser: !!currentUser,
                currentUser
            });
            return;
        }

        try {
            const response = await createComment(issue.id, { 
                content: newComment.trim(),
                user_id: currentUser.id 
            });
            
            const newCommentWithUser = {
                ...response.data,
                user: currentUser
            };
            setComments(prev => [...prev, newCommentWithUser]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!issue || !event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        try {
            setLoading(true);
            const response = await uploadAttachment(issue.id, file);
            setAttachments(prev => [...prev, response.data]);
        } catch (error) {
            console.error('Error uploading attachment:', error);
        } finally {
            setLoading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (!issue) return;

        try {
            setLoading(true);
            await deleteAttachment(issue.id, attachmentId);
            setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
        } catch (error) {
            console.error('Error deleting attachment:', error);
        } finally {
            setLoading(false);
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                                src={issue.user.avatar_url} 
                                alt={issue.user.name || issue.user.email}
                                sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography variant="subtitle2" color="textSecondary">
                                Creado por: {' '}
                                <Link 
                                    component="button" 
                                    variant="subtitle2" 
                                    onClick={() => onViewUserProfile && onViewUserProfile(issue.user.id)}
                                    underline="hover"
                                >
                                    {issue.user.name || issue.user.email}
                                </Link>
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {issue.assignee_id ? (
                                <Avatar 
                                    src={users.find(u => u.id === issue.assignee_id)?.avatar_url} 
                                    alt={getAssigneeName()}
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                />
                            ) : (
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                            )}
                            <Typography variant="subtitle2" color="textSecondary">
                                Asignado a: {' '}
                                {issue.assignee_id ? (
                                    <Link 
                                        component="button" 
                                        variant="subtitle2" 
                                        onClick={() => onViewUserProfile && onViewUserProfile(issue.assignee_id!)}
                                        underline="hover"
                                    >
                                        {getAssigneeName()}
                                    </Link>
                                ) : (
                                    'No asignado'
                                )}
                            </Typography>
                        </Box>
                        
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                            Fecha de creación: {new Date(issue.created_at).toLocaleString()}
                        </Typography>
                        {issue.deadline && (
                            <Typography variant="subtitle2" color="textSecondary">
                                Fecha límite: {new Date(issue.deadline).toLocaleString()}
                            </Typography>
                        )}
                        
                        {issue.watcher_ids && issue.watcher_ids.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                    Observadores:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {issue.watcher_ids.map(watcherId => {
                                        const watcher = users.find(u => u.id === watcherId);
                                        return (
                                            <Tooltip key={watcherId} title={watcher?.name || watcher?.email || 'Usuario'}>
                                                <Avatar 
                                                    src={watcher?.avatar_url} 
                                                    alt={watcher?.name || watcher?.email || 'Usuario'}
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => onViewUserProfile && onViewUserProfile(watcherId)}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Archivos adjuntos
                        </Typography>
                        <List>
                            {attachments.map(attachment => (
                                <ListItem key={attachment.id}>
                                    <ListItemText 
                                        primary={attachment.filename} 
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span">
                                                    {attachment.content_type} 
                                                </Typography>
                                                <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                                    {attachment.size ? `(${Math.round(attachment.size / 1024)} KB)` : ''}
                                                </Typography>
                                                <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                                                    Subido: {new Date(attachment.created_at).toLocaleString()}
                                                </Typography>
                                            </>
                                        } 
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton 
                                            edge="end" 
                                            aria-label="download" 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = attachment.url_directa;
                                                link.download = attachment.filename;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                        <IconButton 
                                            edge="end" 
                                            aria-label="delete" 
                                            onClick={() => handleDeleteAttachment(attachment.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                            {attachments.length === 0 && (
                                <Typography color="textSecondary" align="center">
                                    No hay archivos adjuntos
                                </Typography>
                            )}
                        </List>
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                id="attachment-upload"
                            />
                            <label htmlFor="attachment-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFileIcon />}
                                    disabled={loading}
                                >
                                    Añadir archivo adjunto
                                </Button>
                            </label>
                        </Box>

                        <Divider />

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
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