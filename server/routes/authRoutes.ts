import { Router, Response } from 'express';
import {
  findUserByEmailOrUsername,
  createUser,
  getAllUsers,
  getDb,
  saveDb,
  createAuditLog,
} from '../db.js';
import {
  hashPassword,
  comparePassword,
  generateJwtToken,
  sanitizeUser,
  authenticateToken,
  AuthenticatedRequest,
  requireRole,
} from '../auth.js';
import { UserRole } from '../types.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, username, email, password, role = 'STUDENT', roomNumber, block, phone, specialty } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ error: 'Name, username, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = findUserByEmailOrUsername(email) || findUserByEmailOrUsername(username);
    if (existingUser) {
      res.status(409).json({ error: 'An account with that email or username already exists.' });
      return;
    }

    // Role validation
    const validRoles: UserRole[] = ['STUDENT', 'TECHNICIAN', 'ADMIN'];
    const chosenRole: UserRole = validRoles.includes(role) ? role : 'STUDENT';

    const passwordHash = hashPassword(password);

    const newUser = createUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: chosenRole,
      roomNumber: roomNumber ? roomNumber.trim() : undefined,
      block: block ? block.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      specialty: chosenRole === 'TECHNICIAN' ? specialty || 'General' : undefined,
    });

    const token = generateJwtToken(newUser);

    res.status(201).json({
      message: 'Registration successful.',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

// POST /api/auth/login
router.post('/login', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const identifier = req.body.usernameOrEmail || req.body.email || req.body.username;
    const { password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please provide your username/email and password.' });
      return;
    }

    const user = findUserByEmailOrUsername(identifier);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateJwtToken(user);

    createAuditLog({
      action: 'USER_LOGIN',
      performedBy: user.name,
      userRole: user.role,
      entityType: 'USER',
      entityId: user.id,
      details: `${user.name} logged into ${user.role} workspace.`,
    });

    res.json({
      message: 'Login successful.',
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/demo-switch (Quickly switches role for evaluation & testing)
router.post('/demo-switch', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { role } = req.body;
    const targetRole = role?.toUpperCase();

    if (!['STUDENT', 'TECHNICIAN', 'ADMIN'].includes(targetRole)) {
      res.status(400).json({ error: 'Invalid role. Must be STUDENT, TECHNICIAN, or ADMIN.' });
      return;
    }

    const all = getAllUsers();
    let demoUser = all.find((u) => u.role === targetRole);

    if (!demoUser) {
      res.status(404).json({ error: `No user found for role ${targetRole}` });
      return;
    }

    const token = generateJwtToken(demoUser);

    createAuditLog({
      action: 'DEMO_ROLE_SWITCH',
      performedBy: demoUser.name,
      userRole: demoUser.role,
      entityType: 'USER',
      entityId: demoUser.id,
      details: `Switched session to ${demoUser.role} workspace as ${demoUser.name}.`,
    });

    res.json({
      message: `Switched to demo ${targetRole} mode.`,
      user: sanitizeUser(demoUser),
      token,
    });
  } catch (error: any) {
    console.error('Demo switch error:', error);
    res.status(500).json({ error: 'Failed to switch demo role.' });
  }
});

// GET /api/users/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  res.json({ user: sanitizeUser(req.user) });
});

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  const users = getAllUsers().map(sanitizeUser);
  res.json({ users });
});

// GET /api/users/technicians (Admin or Technician)
router.get('/technicians', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const technicians = getAllUsers()
    .filter((u) => u.role === 'TECHNICIAN')
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      specialty: u.specialty || 'General',
      phone: u.phone,
    }));
  res.json({ technicians });
});

// POST /api/auth/logout
router.post('/logout', (req: AuthenticatedRequest, res: Response): void => {
  res.json({ message: 'Logged out successfully.' });
});

export default router;
