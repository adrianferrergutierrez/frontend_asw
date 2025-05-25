export interface Issue {
    id: number;
    subject: string;
    content: string;
    issue_type: IssueType;
    severity: Severity;
    priority: Priority;
    status: Status;
    created_at: string;
    modified_at: string;
}

export interface IssueType {
    id: number;
    name: string;
    color?: string;
}

export interface Severity {
    id: number;
    name: string;
    color?: string;
}

export interface Priority {
    id: number;
    name: string;
    color?: string;
}

export interface Status {
    id: number;
    name: string;
    color?: string;
} 