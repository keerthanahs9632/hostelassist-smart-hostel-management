import {
  User,
  Complaint,
  ComplaintHistoryItem,
  Asset,
  AuditLog,
  PreventiveMaintenanceSchedule,
  RecurringIssueAlert,
  HealthScoreData,
  AiAnalysis,
  TechnicianMetric,
} from '../types';

// Initial Seed Data for Static Deployments (e.g. GitHub Pages)
const SEED_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Ramesh Sharma',
    email: 'admin@hostelassist.edu',
    username: 'admin',
    role: 'ADMIN',
    phone: '+91 98765 43210',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'usr-tech-1',
    name: 'Rahul Verma',
    email: 'rahul.tech@hostelassist.edu',
    username: 'rahul_tech',
    role: 'TECHNICIAN',
    specialty: 'Electrical',
    phone: '+91 98765 11223',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'usr-tech-2',
    name: 'Suresh Patil',
    email: 'suresh.tech@hostelassist.edu',
    username: 'suresh_tech',
    role: 'TECHNICIAN',
    specialty: 'Plumbing',
    phone: '+91 98765 33445',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'usr-student-1',
    name: 'Ananya Roy',
    email: 'ananya.roy@student.hostelassist.edu',
    username: 'ananya',
    role: 'STUDENT',
    roomNumber: '302',
    block: 'Block-B',
    phone: '+91 98765 99887',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const SEED_ASSETS: Asset[] = [
  {
    id: 'ast-elec-1',
    assetCode: 'AST-ELEC-001',
    name: 'Main Modular Distribution Switchboard (16A)',
    category: 'Electrical',
    block: 'Block-B',
    floor: 3,
    roomNumber: '302',
    condition: 'NEEDS_ATTENTION',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AST-ELEC-001',
    purchaseDate: '2023-06-15',
    purchaseCost: 3500,
    totalRepairCost: 450,
    nextMaintenanceDate: '2026-10-15',
    warrantyExpiryDate: '2025-06-15',
    maintenanceHistoryCount: 2,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-plumb-2',
    assetCode: 'AST-PLUMB-002',
    name: 'Commercial Storage Water Geyser (25L)',
    category: 'Plumbing',
    block: 'Block-B',
    floor: 3,
    roomNumber: 'Common Washroom B3',
    condition: 'CRITICAL',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AST-PLUMB-002',
    purchaseDate: '2022-09-10',
    purchaseCost: 14000,
    totalRepairCost: 1200,
    nextMaintenanceDate: '2026-09-25',
    warrantyExpiryDate: '2024-09-10',
    maintenanceHistoryCount: 3,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-wifi-4',
    assetCode: 'AST-WIFI-004',
    name: 'Dual-Band Wi-Fi 6 Ceiling Access Point',
    category: 'Internet',
    block: 'Block-A',
    floor: 2,
    roomNumber: 'Corridor A2-Central',
    condition: 'GOOD',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AST-WIFI-004',
    purchaseDate: '2024-01-20',
    purchaseCost: 8500,
    totalRepairCost: 0,
    nextMaintenanceDate: '2026-12-20',
    warrantyExpiryDate: '2027-01-20',
    maintenanceHistoryCount: 1,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-water-5',
    assetCode: 'AST-WATER-005',
    name: 'Multi-Stage RO Drinking Water Dispenser Plant',
    category: 'Water',
    block: 'Block-C',
    floor: 1,
    roomNumber: 'Mess Hall North',
    condition: 'GOOD',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AST-WATER-005',
    purchaseDate: '2023-01-12',
    purchaseCost: 45000,
    totalRepairCost: 800,
    nextMaintenanceDate: '2026-10-01',
    warrantyExpiryDate: '2025-01-12',
    maintenanceHistoryCount: 1,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'HST-2026-0089',
    studentId: 'usr-student-1',
    studentName: 'Ananya Roy',
    studentEmail: 'ananya.roy@student.hostelassist.edu',
    roomNumber: '302',
    block: 'Block-B',
    title: 'Sparking and burning smell from 16A modular switchboard',
    description: 'The wall socket sparks whenever laptop or phone charger is plugged in. Visible scorch marks on switchboard.',
    category: 'Electrical',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60',
    assetId: 'ast-elec-1',
    assetName: 'Main Modular Distribution Switchboard (16A)',
    assignedTechnicianId: 'usr-tech-1',
    assignedTechnicianName: 'Rahul Verma',
    aiAnalysis: {
      category: 'Electrical',
      suggestedPriority: 'CRITICAL',
      confidence: 0.98,
      detectedKeywords: ['sparking', 'burning smell', 'socket', 'scorch marks'],
      safetyRiskDetected: true,
      possibleRootCause: 'Loose terminal connection or internal dielectric breakdown',
      recommendedAction: 'Immediate isolation of circuit breaker and replacement of 16A modular socket unit',
      estimatedResolutionHours: 2,
      provider: 'rule-based-fallback',
    },
    slaDeadline: new Date(Date.now() + 2 * 3600000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cmp-2',
    ticketNumber: 'HST-2026-0088',
    studentId: 'usr-student-1',
    studentName: 'Ananya Roy',
    studentEmail: 'ananya.roy@student.hostelassist.edu',
    roomNumber: 'Common Washroom B3',
    block: 'Block-B',
    title: 'Geyser safety valve boiling pressure leak & heavy dripping',
    description: 'Hot water dripping continuously from safety valve outlet pipe. Temperature thermostat not shutting off.',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'ASSIGNED',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=60',
    assetId: 'ast-plumb-2',
    assetName: 'Commercial Storage Water Geyser (25L)',
    assignedTechnicianId: 'usr-tech-2',
    assignedTechnicianName: 'Suresh Patil',
    aiAnalysis: {
      category: 'Plumbing',
      suggestedPriority: 'HIGH',
      confidence: 0.94,
      detectedKeywords: ['geyser', 'safety valve', 'hot water', 'dripping', 'thermostat'],
      safetyRiskDetected: true,
      possibleRootCause: 'Faulty expansion relief valve or scaled heating element',
      recommendedAction: 'Shut inlet water valve and replace temperature release valve assembly',
      estimatedResolutionHours: 6,
      provider: 'rule-based-fallback',
    },
    slaDeadline: new Date(Date.now() + 5 * 3600000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cmp-3',
    ticketNumber: 'HST-2026-0085',
    studentId: 'usr-student-1',
    studentName: 'Ananya Roy',
    studentEmail: 'ananya.roy@student.hostelassist.edu',
    roomNumber: 'Corridor A2-Central',
    block: 'Block-A',
    title: 'Wi-Fi 6 Access Point no internet & amber LED blinking',
    description: 'High packet loss and DHCP timeout error for all devices connecting to corridor AP.',
    category: 'Internet',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60',
    assetId: 'ast-wifi-4',
    assetName: 'Dual-Band Wi-Fi 6 Ceiling Access Point',
    assignedTechnicianId: 'usr-tech-1',
    assignedTechnicianName: 'Rahul Verma',
    totalRepairCost: 150,
    workNotes: 'Re-crimped damaged RJ-45 patch cable header and rebooted PoE port on switch.',
    resolvedAt: new Date(Date.now() - 14400000).toISOString(),
    slaDeadline: new Date(Date.now() + 18 * 3600000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class MockStorage {
  private users: User[] = SEED_USERS;
  private complaints: Complaint[] = SEED_COMPLAINTS;
  private assets: Asset[] = SEED_ASSETS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedComplaints = localStorage.getItem('ha_mock_complaints');
      if (storedComplaints) this.complaints = JSON.parse(storedComplaints);
      const storedAssets = localStorage.getItem('ha_mock_assets');
      if (storedAssets) this.assets = JSON.parse(storedAssets);
    } catch {
      // Use defaults if localStorage error
    }
  }

  private save() {
    try {
      localStorage.setItem('ha_mock_complaints', JSON.stringify(this.complaints));
      localStorage.setItem('ha_mock_assets', JSON.stringify(this.assets));
    } catch {
      // ignore
    }
  }

  login(usernameOrEmail: string): { user: User; token: string } {
    const u = this.users.find(
      (x) => x.username.toLowerCase() === usernameOrEmail.toLowerCase() || x.email.toLowerCase() === usernameOrEmail.toLowerCase()
    ) || this.users[0]; // fallback to admin if not found

    return { user: u, token: `mock-token-${u.id}-${Date.now()}` };
  }

  getMe(token: string | null): { user: User } {
    if (token) {
      for (const u of this.users) {
        if (token.includes(u.id)) return { user: u };
      }
    }
    return { user: this.users[0] };
  }

  getUsers(): { users: User[] } {
    return { users: this.users };
  }

  getTechnicians() {
    const techs = this.users
      .filter((u) => u.role === 'TECHNICIAN')
      .map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        specialty: t.specialty || 'General Maintenance',
        phone: t.phone,
      }));
    return { technicians: techs };
  }

  getComplaints(params?: Record<string, string>) {
    let list = [...this.complaints];
    if (params?.status) list = list.filter((c) => c.status === params.status);
    if (params?.priority) list = list.filter((c) => c.priority === params.priority);
    if (params?.category) list = list.filter((c) => c.category === params.category);
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.ticketNumber.toLowerCase().includes(q));
    }
    return { total: list.length, complaints: list };
  }

  getComplaintById(id: string) {
    const complaint = this.complaints.find((c) => c.id === id) || this.complaints[0];
    const history: ComplaintHistoryItem[] = [
      {
        id: `h-1`,
        complaintId: complaint.id,
        action: 'CREATED',
        actorId: complaint.studentId,
        actorName: complaint.studentName,
        actorRole: 'STUDENT',
        notes: 'Complaint logged via portal',
        timestamp: complaint.createdAt,
      },
    ];
    return { complaint, history };
  }

  createComplaint(data: any, currentUser: User) {
    const count = this.complaints.length + 90;
    const ticketNumber = `HST-2026-00${count}`;
    const priority = data.priority || 'MEDIUM';
    const hours = priority === 'CRITICAL' ? 2 : priority === 'HIGH' ? 6 : priority === 'MEDIUM' ? 24 : 72;

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      roomNumber: data.roomNumber || currentUser.roomNumber || '302',
      block: data.block || currentUser.block || 'Block-B',
      title: data.title,
      description: data.description,
      category: data.category || 'Other',
      priority,
      status: 'REPORTED',
      imageUrl: data.imageUrl,
      assetId: data.assetId,
      assetName: this.assets.find((a) => a.id === data.assetId)?.name,
      slaDeadline: new Date(Date.now() + hours * 3600000).toISOString(),
      isOverdue: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.complaints.unshift(newComplaint);
    this.save();
    return { complaint: newComplaint };
  }

  updateComplaintStatus(id: string, updateData: any) {
    const idx = this.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.complaints[idx] = {
        ...this.complaints[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return { complaint: this.complaints[idx] };
    }
    return { complaint: this.complaints[0] };
  }

  getAssets(params?: Record<string, string>) {
    let list = [...this.assets];
    if (params?.code) {
      const c = params.code.trim().toLowerCase();
      list = list.filter((a) => a.assetCode.toLowerCase() === c || a.id.toLowerCase() === c);
    }
    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.assetCode.toLowerCase().includes(q) ||
          a.roomNumber.toLowerCase().includes(q)
      );
    }
    return { total: list.length, assets: list };
  }

  getAssetById(id: string) {
    const clean = id.trim().toLowerCase();
    const asset = this.assets.find((a) => a.id.toLowerCase() === clean || a.assetCode.toLowerCase() === clean);
    if (!asset) {
      throw new Error(`Asset "${id}" not found.`);
    }
    const pastComplaints = this.complaints.filter((c) => c.assetId === asset.id);
    return { asset, pastComplaints };
  }

  getDashboardStats() {
    const total = this.complaints.length;
    const resolved = this.complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'VERIFIED' || c.status === 'CLOSED').length;
    const critical = this.complaints.filter((c) => c.priority === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
    const overdue = this.complaints.filter((c) => c.isOverdue).length;

    return {
      stats: {
        totalTickets: total,
        openTickets: total - resolved,
        inProgressTickets: this.complaints.filter((c) => c.status === 'IN_PROGRESS').length,
        resolvedTickets: resolved,
        criticalUnresolved: critical,
        overdueTickets: overdue,
        avgResolutionHours: 3.4,
        slaComplianceRate: 94.2,
      },
      categoryBreakdown: [
        { category: 'Electrical', count: 18 },
        { category: 'Plumbing', count: 12 },
        { category: 'Internet', count: 9 },
        { category: 'Water', count: 6 },
        { category: 'Furniture', count: 4 },
      ],
      recentComplaints: this.complaints.slice(0, 5),
    };
  }

  getHealthScores(): { data: HealthScoreData } {
    return {
      data: {
        score: 89,
        grade: 'Good',
        breakdown: {
          unresolvedPenalty: 4,
          criticalPenalty: 3,
          slaPenalty: 2,
          recurringPenalty: 2,
          feedbackBonus: 5,
          assetConditionScore: 95,
        },
        metrics: {
          totalComplaints: this.complaints.length,
          openCount: 1,
          inProgressCount: 1,
          resolvedCount: 1,
          closedCount: 0,
          overdueCount: 0,
          avgResolutionHours: 3.2,
          avgRating: 4.8,
          totalMaintenanceCost: 2800,
        },
      },
    };
  }

  getRecurringAlerts(): { alerts: RecurringIssueAlert[] } {
    return {
      alerts: [
        {
          id: 'alt-1',
          block: 'Block-B',
          roomNumber: '302',
          category: 'Electrical',
          count: 3,
          descriptionSnippet: 'Sparking switchboard and breaker trips',
          firstReportedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          lastReportedAt: new Date().toISOString(),
          severity: 'CRITICAL',
          recommendation: 'Replace sub-panel circuit busbar and replace 16A modular plate',
        },
      ],
    };
  }

  getTechnicianMetrics(): { metrics: TechnicianMetric[] } {
    return {
      metrics: [
        {
          id: 'usr-tech-1',
          name: 'Rahul Verma',
          specialty: 'Electrical',
          phone: '+91 98765 11223',
          totalAssigned: 6,
          totalResolved: 28,
          openWorkload: 2,
          avgResolutionHours: 2.1,
          avgRating: 4.8,
          slaComplianceRate: 96.5,
        },
        {
          id: 'usr-tech-2',
          name: 'Suresh Patil',
          specialty: 'Plumbing',
          phone: '+91 98765 33445',
          totalAssigned: 4,
          totalResolved: 22,
          openWorkload: 1,
          avgResolutionHours: 3.8,
          avgRating: 4.6,
          slaComplianceRate: 91.0,
        },
      ],
    };
  }

  getAuditLogs(): { logs: AuditLog[] } {
    return {
      logs: [
        {
          id: 'log-1',
          action: 'STATUS_UPDATE',
          performedBy: 'Dr. Ramesh Sharma',
          userRole: 'ADMIN',
          entityType: 'COMPLAINT',
          entityId: 'cmp-1',
          details: 'Assigned to Rahul Verma (Electrical)',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  getPreventiveSchedules(): { schedules: PreventiveMaintenanceSchedule[] } {
    return {
      schedules: [
        {
          id: 'prev-1',
          title: 'Quarterly Electrical Busbar & Earthing Inspection',
          description: 'Inspect main breaker panel and earthing resistance.',
          targetCategory: 'Electrical',
          targetBlock: 'Block-B',
          suggestedAction: 'Isolate main breaker and test continuity.',
          frequencyDays: 90,
          nextScheduledDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          status: 'SCHEDULED',
          createdReason: 'AI_FAILURE_PATTERN_ALERT',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'prev-2',
          title: 'Monthly RO Membrane & TDS Filter Flush',
          description: 'Chemical cleaning of RO membrane and filter replacement.',
          targetCategory: 'Water',
          targetBlock: 'Block-C',
          suggestedAction: 'Check TDS value and replace sediment filter.',
          frequencyDays: 30,
          nextScheduledDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
          status: 'SCHEDULED',
          createdReason: 'MANUAL',
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  analyzeComplaint(title: string, description: string): { analysis: AiAnalysis } {
    const text = `${title} ${description}`.toLowerCase();
    let category = 'Other' as any;
    let priority = 'MEDIUM' as any;
    let safetyRisk = false;
    let hours = 24;

    if (text.includes('spark') || text.includes('burn') || text.includes('shock') || text.includes('fire') || text.includes('wire')) {
      category = 'Electrical';
      priority = 'CRITICAL';
      safetyRisk = true;
      hours = 2;
    } else if (text.includes('leak') || text.includes('geyser') || text.includes('pipe') || text.includes('water')) {
      category = 'Plumbing';
      priority = 'HIGH';
      hours = 6;
    } else if (text.includes('wifi') || text.includes('internet') || text.includes('router')) {
      category = 'Internet';
      priority = 'MEDIUM';
      hours = 12;
    }

    return {
      analysis: {
        category,
        suggestedPriority: priority,
        confidence: 0.95,
        detectedKeywords: ['automated-client-triage'],
        safetyRiskDetected: safetyRisk,
        possibleRootCause: 'Standard component wear or connection fault',
        recommendedAction: 'Dispatch certified campus technician for inspection',
        estimatedResolutionHours: hours,
        provider: 'rule-based-fallback',
      },
    };
  }
}

export const mockStorage = new MockStorage();
