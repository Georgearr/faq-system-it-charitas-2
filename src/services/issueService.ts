import { getAppAdapter } from '@/api';
import {
  Issue,
  IssueReply,
  IssuePriority,
  IssueStatus,
  CreateIssueRequest,
  IssueQuery,
  ReplyRequest,
} from '@/types';

export class IssueService {
  private get adapter() {
    return getAppAdapter();
  }

  async createIssue(request: CreateIssueRequest): Promise<Issue> {
    return this.adapter.createIssue(request);
  }

  async getIssue(id: string, guestToken?: string): Promise<Issue | null> {
    return this.adapter.getIssue(id, guestToken);
  }

  async getIssues(query?: IssueQuery): Promise<Issue[]> {
    return this.adapter.getIssues(query);
  }

  async getMyIssues(): Promise<Issue[]> {
    return this.adapter.getMyIssues();
  }

  async replyToIssue(request: ReplyRequest): Promise<IssueReply> {
    return this.adapter.replyToIssue(request);
  }

  async addInternalNote(issueId: string, message: string): Promise<IssueReply> {
    return this.adapter.addInternalNote(issueId, message);
  }

  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    return this.adapter.updateIssueStatus(issueId, status);
  }

  async assignIssue(issueId: string, staffUserId: string | null): Promise<Issue> {
    return this.adapter.assignIssue(issueId, staffUserId);
  }

  async updateIssuePriority(issueId: string, priority: IssuePriority): Promise<Issue> {
    return this.adapter.updateIssuePriority(issueId, priority);
  }

  async updateIssueCategory(issueId: string, categoryId: string): Promise<Issue> {
    return this.adapter.updateIssueCategory(issueId, categoryId);
  }

  async getIssueReplies(issueId: string, guestToken?: string): Promise<IssueReply[]> {
    return this.adapter.getIssueReplies(issueId, guestToken);
  }
}

export const issueService = new IssueService();
