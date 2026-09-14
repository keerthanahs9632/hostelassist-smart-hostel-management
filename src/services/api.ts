import {
  User,
  Complaint,
  ComplaintHistoryItem,
  Asset,
  Notification,
  Feedback,
  AuditLog,
  PreventiveMaintenanceSchedule,
  RecurringIssueAlert,
  HealthScoreData,
  AiAnalysis,
  TechnicianMetric,
} from '../types';
import { mockStorage } from './mockStorage';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('hostelassist_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('hostelassist_token', token);
    } else {
      localStorage.removeItem('hostelassist_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async handleMockFallback<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    let body: any = {};
    try {
      if (options.body && typeof options.body === 'string') {
        body = JSON.parse(options.body);
      }
    } catch {
      // not JSON body
    }

    // Auth
    if (endpoint === '/auth/login' && method === 'POST') {
      const res = mockStorage.login(body.usernameOrEmail || 'admin');
      return res as unknown as T;
    }
    if (endpoint === '/users/me') {
      return mockStorage.getMe(this.token) as unknown as T;
    }
    if (endpoint === '/users/technicians') {
      return mockStorage.getTechnicians() as unknown as T;
    }
    if (endpoint === '/users') {
      return mockStorage.getUsers() as unknown as T;
    }

    // Complaints
    if (endpoint === '/complaints/analyze' && method === 'POST') {
      return mockStorage.analyzeComplaint(body.title, body.description) as unknown as T;
    }
    if (endpoint === '/complaints' && method === 'POST') {
      const user = mockStorage.getMe(this.token).user;
      return mockStorage.createComplaint(body, user) as unknown as T;
    }
    if (endpoint.startsWith('/complaints') && method === 'GET') {
      if (endpoint === '/complaints/student' || endpoint === '/complaints/technician') {
        const res = mockStorage.getComplaints();
        return { complaints: res.complaints } as unknown as T;
      }
      const parts = endpoint.split('?');
      const pathPart = parts[0];
      const matchId = pathPart.match(/^\/complaints\/([^/]+)$/);
      if (matchId) {
        return mockStorage.getComplaintById(matchId[1]) as unknown as T;
      }
      return mockStorage.getComplaints() as unknown as T;
    }
    if (endpoint.includes('/assign') && method === 'POST') {
      const match = endpoint.match(/\/complaints\/([^/]+)\/assign/);
      const id = match ? match[1] : '';
      return mockStorage.updateComplaintStatus(id, {
        assignedTechnicianId: body.technicianId,
        assignedTechnicianName: 'Rahul Verma',
        status: 'ASSIGNED',
      }) as unknown as T;
    }
    if (endpoint.includes('/status') && method === 'POST') {
      const match = endpoint.match(/\/complaints\/([^/]+)\/status/);
      const id = match ? match[1] : '';
      return mockStorage.updateComplaintStatus(id, body) as unknown as T;
    }
    if (endpoint.includes('/verify') && method === 'POST') {
      const match = endpoint.match(/\/complaints\/([^/]+)\/verify/);
      const id = match ? match[1] : '';
      return mockStorage.updateComplaintStatus(id, { status: 'VERIFIED' }) as unknown as T;
    }

    // Assets
    if (endpoint.startsWith('/assets')) {
      const matchId = endpoint.match(/^\/assets\/([^/?]+)/);
      if (matchId && !endpoint.includes('?')) {
        return mockStorage.getAssetById(matchId[1]) as unknown as T;
      }
      return mockStorage.getAssets() as unknown as T;
    }

    // Dashboards
    if (endpoint === '/dashboard/student') {
      const complaints = mockStorage.getComplaints().complaints;
      return {
        metrics: { total: complaints.length, open: 1, inProgress: 1, resolved: 1 },
        recentComplaints: complaints.slice(0, 5),
        notifications: [],
        hostelHealth: { score: 89, grade: 'B+' },
      } as unknown as T;
    }
    if (endpoint === '/dashboard/technician') {
      const complaints = mockStorage.getComplaints().complaints;
      return {
        metrics: {
          totalAssigned: complaints.length,
          critical: 1,
          pending: 1,
          inProgress: 1,
          completed: 1,
          averageResolutionHours: 2.4,
          averageRating: 4.8,
        },
        tasks: complaints,
        recentFeedbacks: [],
      } as unknown as T;
    }
    if (endpoint === '/dashboard/admin') {
      return {
        healthScore: mockStorage.getHealthScores().data,
        metrics: {
          totalUsers: 4,
          totalComplaints: 3,
          openCount: 1,
          inProgressCount: 1,
          resolvedCount: 1,
          overdueCount: 0,
          totalMaintenanceCost: 2800,
          assetCount: 4,
          avgResolutionHours: 2.6,
          avgRating: 4.8,
        },
        recurringIssues: mockStorage.getRecurringAlerts().alerts,
        overdueComplaints: [],
        technicianLeaderboard: mockStorage.getTechnicianMetrics().metrics,
        recentAuditLogs: mockStorage.getAuditLogs().logs,
      } as unknown as T;
    }

    // Analytics
    if (endpoint === '/analytics/health-score') {
      return mockStorage.getHealthScores().data as unknown as T;
    }
    if (endpoint === '/analytics/recurring-problems') {
      const alerts = mockStorage.getRecurringAlerts().alerts;
      return { count: alerts.length, recurringIssues: alerts } as unknown as T;
    }
    if (endpoint === '/analytics') {
      return {
        totalCost: 2800,
        costByCategory: { Electrical: 1200, Plumbing: 1200, Internet: 150, Water: 250 },
        countByCategory: { Electrical: 1, Plumbing: 1, Internet: 1 },
        costByBlock: { 'Block-A': 150, 'Block-B': 2400, 'Block-C': 250 },
        countByBlock: { 'Block-A': 1, 'Block-B': 2, 'Block-C': 0 },
        monthlySpending: [
          { month: 'Jan 2026', cost: 1800, complaints: 4 },
          { month: 'Feb 2026', cost: 2400, complaints: 6 },
          { month: 'Mar 2026', cost: 2800, complaints: 3 },
        ],
        insights: [
          'Electrical switchboards in Block-B show frequent voltage surge breakdown.',
          'Plumbing safety valve replacements accounted for 42% of monthly maintenance cost.',
        ],
      } as unknown as T;
    }
    if (endpoint === '/analytics/heatmap') {
      return {
        blocks: ['Block-A', 'Block-B', 'Block-C', 'Block-D'],
        categories: ['Electrical', 'Plumbing', 'Internet', 'Water'],
        matrix: {
          'Block-A': { Electrical: 2, Plumbing: 1, Internet: 3, Water: 0 },
          'Block-B': { Electrical: 5, Plumbing: 4, Internet: 1, Water: 1 },
          'Block-C': { Electrical: 1, Plumbing: 1, Internet: 1, Water: 3 },
          'Block-D': { Electrical: 0, Plumbing: 2, Internet: 0, Water: 0 },
        },
      } as unknown as T;
    }

    if (endpoint === '/notifications') {
      return { unreadCount: 0, notifications: [] } as unknown as T;
    }
    if (endpoint.startsWith('/audit-logs')) {
      return mockStorage.getAuditLogs() as unknown as T;
    }
    if (endpoint.startsWith('/preventive-maintenance')) {
      return mockStorage.getPreventiveSchedules() as unknown as T;
    }
    if (endpoint === '/upload') {
      return {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=60',
        fileName: 'upload.jpg',
        size: 1024,
      } as unknown as T;
    }

    return {} as unknown as T;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if response returned valid JSON
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return (await response.json()) as Promise<T>;
      }

      // If static host or 404/non-JSON returned, fallback to mockStorage
      if (!response.ok || !contentType.includes('application/json')) {
        return await this.handleMockFallback<T>(endpoint, options);
      }

      return (await response.json()) as Promise<T>;
    } catch {
      // Network error (e.g. static site host without Express server)
      return await this.handleMockFallback<T>(endpoint, options);
    }
  }

  // Authentication
  async login(usernameOrEmail: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: string;
    roomNumber?: string;
    block?: string;
    phone?: string;
    specialty?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me');
  }

  async getAllUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/users');
  }

  async getTechnicians(): Promise<{
    technicians: Array<{ id: string; name: string; email: string; specialty: string; phone?: string }>;
  }> {
    return this.request<{
      technicians: Array<{ id: string; name: string; email: string; specialty: string; phone?: string }>;
    }>('/users/technicians');
  }

  logout() {
    this.setToken(null);
  }

  // AI & Complaints
  async analyzeComplaint(data: {
    title: string;
    description: string;
    roomNumber?: string;
    block?: string;
  }): Promise<{ analysis: AiAnalysis }> {
    return this.request<{ analysis: AiAnalysis }>('/complaints/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createComplaint(data: {
    title: string;
    description: string;
    category?: string;
    priority?: string;
    roomNumber?: string;
    block?: string;
    imageUrl?: string;
    assetId?: string;
  }): Promise<{ complaint: Complaint }> {
    return this.request<{ complaint: Complaint }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComplaints(params?: Record<string, string>): Promise<{ total: number; complaints: Complaint[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ total: number; complaints: Complaint[] }>(`/complaints${query}`);
  }

  async getStudentComplaints(): Promise<{ complaints: Complaint[] }> {
    return this.request<{ complaints: Complaint[] }>('/complaints/student');
  }

  async getTechnicianComplaints(): Promise<{ complaints: Complaint[] }> {
    return this.request<{ complaints: Complaint[] }>('/complaints/technician');
  }

  async getComplaintById(
    id: string
  ): Promise<{ complaint: Complaint; history: ComplaintHistoryItem[]; feedback?: Feedback }> {
    return this.request<{ complaint: Complaint; history: ComplaintHistoryItem[]; feedback?: Feedback }>(
      `/complaints/${id}`
    );
  }

  async assignTechnician(complaintId: string, technicianId: string): Promise<{ complaint: Complaint }> {
    return this.request<{ complaint: Complaint }>(`/complaints/${complaintId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId }),
    });
  }

  async updateComplaintStatus(
    complaintId: string,
    data: {
      status: string;
      workNotes?: string;
      repairCost?: number;
      evidenceImageUrl?: string;
    }
  ): Promise<{ complaint: Complaint }> {
    return this.request<{ complaint: Complaint }>(`/complaints/${complaintId}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyComplaint(complaintId: string): Promise<{ complaint: Complaint }> {
    return this.request<{ complaint: Complaint }>(`/complaints/${complaintId}/verify`, {
      method: 'POST',
    });
  }

  async submitFeedback(
    complaintId: string,
    data: { rating: number; comment?: string }
  ): Promise<{ feedback: Feedback }> {
    return this.request<{ feedback: Feedback }>(`/complaints/${complaintId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Assets & QR
  async getAssets(params?: Record<string, string>): Promise<{ total: number; assets: Asset[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ total: number; assets: Asset[] }>(`/assets${query}`);
  }

  async getAssetById(id: string): Promise<{ asset: Asset; pastComplaints: Complaint[] }> {
    return this.request<{ asset: Asset; pastComplaints: Complaint[] }>(`/assets/${id}`);
  }

  async createAsset(data: Partial<Asset>): Promise<{ asset: Asset }> {
    return this.request<{ asset: Asset }>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: Partial<Asset>): Promise<{ asset: Asset }> {
    return this.request<{ asset: Asset }>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dashboards
  async getStudentDashboard(): Promise<{
    metrics: { total: number; open: number; inProgress: number; resolved: number };
    recentComplaints: Complaint[];
    notifications: Notification[];
    hostelHealth: { score: number; grade: string };
  }> {
    return this.request('/dashboard/student');
  }

  async getTechnicianDashboard(): Promise<{
    metrics: {
      totalAssigned: number;
      critical: number;
      pending: number;
      inProgress: number;
      completed: number;
      averageResolutionHours: number;
      averageRating: number;
    };
    tasks: Complaint[];
    recentFeedbacks: Feedback[];
  }> {
    return this.request('/dashboard/technician');
  }

  async getAdminDashboard(): Promise<{
    healthScore: HealthScoreData;
    metrics: {
      totalUsers: number;
      totalComplaints: number;
      openCount: number;
      inProgressCount: number;
      resolvedCount: number;
      overdueCount: number;
      totalMaintenanceCost: number;
      assetCount: number;
      avgResolutionHours: number;
      avgRating: number;
    };
    recurringIssues: RecurringIssueAlert[];
    overdueComplaints: Complaint[];
    technicianLeaderboard: TechnicianMetric[];
    recentAuditLogs: AuditLog[];
  }> {
    return this.request('/dashboard/admin');
  }

  // Analytics
  async getHealthScore(): Promise<HealthScoreData> {
    return this.request<HealthScoreData>('/analytics/health-score');
  }

  async getRecurringProblems(): Promise<{ count: number; recurringIssues: RecurringIssueAlert[] }> {
    return this.request<{ count: number; recurringIssues: RecurringIssueAlert[] }>('/analytics/recurring-problems');
  }

  async getAnalytics(): Promise<{
    totalCost: number;
    costByCategory: Record<string, number>;
    countByCategory: Record<string, number>;
    costByBlock: Record<string, number>;
    countByBlock: Record<string, number>;
    monthlySpending: Array<{ month: string; cost: number; complaints: number }>;
    insights: string[];
  }> {
    return this.request('/analytics');
  }

  async getHeatmap(): Promise<{
    blocks: string[];
    categories: string[];
    matrix: Record<string, Record<string, number>>;
  }> {
    return this.request('/analytics/heatmap');
  }

  // Notifications
  async getNotifications(): Promise<{ unreadCount: number; notifications: Notification[] }> {
    return this.request<{ unreadCount: number; notifications: Notification[] }>('/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'PUT' });
  }

  // Audit Logs
  async getAuditLogs(params?: Record<string, string>): Promise<{ total: number; logs: AuditLog[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<{ total: number; logs: AuditLog[] }>(`/audit-logs${query}`);
  }

  // Preventive Maintenance
  async getPreventiveSchedules(): Promise<{ schedules: PreventiveMaintenanceSchedule[] }> {
    return this.request<{ schedules: PreventiveMaintenanceSchedule[] }>('/preventive-maintenance');
  }

  async createPreventiveSchedule(data: {
    title: string;
    description?: string;
    targetCategory: string;
    targetBlock: string;
    suggestedAction: string;
    frequencyDays?: number;
    nextScheduledDate?: string;
  }): Promise<{ schedule: PreventiveMaintenanceSchedule }> {
    return this.request<{ schedule: PreventiveMaintenanceSchedule }>('/preventive-maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePreventiveScheduleStatus(
    id: string,
    status: string
  ): Promise<{ schedule: PreventiveMaintenanceSchedule }> {
    return this.request<{ schedule: PreventiveMaintenanceSchedule }>(`/preventive-maintenance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // File Upload
  async uploadFile(file: File): Promise<{ url: string; fileName: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ url: string; fileName: string; size: number }>('/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient();
