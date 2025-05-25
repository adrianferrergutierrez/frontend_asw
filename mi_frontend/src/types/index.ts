export interface User {
    id: number;
    email: string;
}

export interface UserDetail extends User {
    name: string;
    username: string;
    bio: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
    stats: {
        issues_count: number;
        assigned_issues_count: number;
        watched_issues_count: number;
        comments_count: number;
    };
}

export interface IssueType {
    id: number;
    name: string;
    color?: string;
    position?: number;
}

export interface Severity {
    id: number;
    name: string;
    color?: string;
    position?: number;
}

export interface Priority {
    id: number;
    name: string;
    color?: string;
    position?: number;
}

export interface Status {
    id: number;
    name: string;
    color?: string;
    is_closed?: boolean;
    position?: number;
}

export interface Attachment {
    id: number;
    filename: string;
    content_type: string;
    created_at: string;
    url_directa: string;
    url_redireccion: string;
}

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user: User;
    issue: Issue;
}

export interface Issue {
    id: number;
    subject: string;
    content: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    status_id: number;
    issue_type_id: number;
    severity_id: number;
    priority_id: number;
    assignee_id: number | null;
    deadline: string | null;
    issue_type: IssueType;
    severity: Severity;
    priority: Priority;
    status: Status;
    user: User;
    comments: Comment[];
    watcher_ids: number[];
}

export interface IssueInput {
    subject: string;
    content?: string;
    issue_type_id?: number;
    severity_id?: number;
    priority_id?: number;
    status_id?: number;
    assignee_id?: number;
    user_id?: number;
    watcher_ids?: number[];
}

export interface CommentInput {
    content: string;
    user_id?: number;
}

export interface Error {
    error: string;
} 