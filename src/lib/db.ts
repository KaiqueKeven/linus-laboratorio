import bcrypt from 'bcryptjs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

let _localDb: any = null;

// Lazy initialization of local SQLite so it NEVER crashes in Vercel / AWS Lambda read-only environments
export function getLocalDb() {
  if (isSupabaseConfigured) {
    return null;
  }
  if (!_localDb) {
    try {
      const { createClient } = require('@libsql/client');
      // On serverless, only /tmp is writable; locally process.cwd() is used
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const dbPath = isServerless
        ? path.resolve('/tmp', 'linus_data.db')
        : path.resolve(process.cwd(), 'linus_data.db');

      _localDb = createClient({
        url: `file:${dbPath}`,
      });
    } catch (err) {
      console.warn('Local SQLite not available:', err);
    }
  }
  return _localDb;
}

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  // In production with Supabase, we rely 100% on cloud PostgreSQL!
  if (isSupabaseConfigured) {
    isInitialized = true;
    return;
  }

  const localDb = getLocalDb();
  if (!localDb) {
    isInitialized = true;
    return;
  }

  try {
    await localDb.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'FUNCIONARIO',
        department TEXT NOT NULL DEFAULT 'Geral',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );
    `);

    await localDb.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL,
        doctor_request TEXT NOT NULL,
        rg TEXT DEFAULT '',
        birth_date TEXT DEFAULT '',
        gender TEXT DEFAULT 'Não informado',
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        zip_code TEXT DEFAULT '',
        address TEXT DEFAULT '',
        city TEXT DEFAULT 'Belo Horizonte',
        state TEXT DEFAULT 'MG',
        payment_type TEXT NOT NULL DEFAULT 'Particular',
        health_insurance_name TEXT DEFAULT '',
        insurance_card_number TEXT DEFAULT '',
        requested_exams TEXT DEFAULT 'Atendimento Clínico',
        clinical_notes TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Aguardando Atendimento',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    const existingUsers = await localDb.execute('SELECT COUNT(*) as count FROM users');
    const count = Number(existingUsers.rows[0]?.count || 0);

    if (count === 0) {
      const now = new Date();
      const isoNow = now.toISOString();
      const defaultPasswordHash = bcrypt.hashSync('1234', 10);

      await localDb.batch([
        {
          sql: `INSERT INTO users (id, username, name, password_hash, role, department, active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            'usr_adm_01',
            'admin',
            'Dr. Roberto Linus',
            defaultPasswordHash,
            'ADM',
            'Diretoria Geral',
            1,
            isoNow,
          ],
        },
        {
          sql: `INSERT INTO users (id, username, name, password_hash, role, department, active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            'usr_func_kaique',
            'kaique',
            'Kaique Keven',
            defaultPasswordHash,
            'FUNCIONARIO',
            'Recepção e Atendimento',
            1,
            isoNow,
          ],
        },
        {
          sql: `INSERT INTO users (id, username, name, password_hash, role, department, active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            'usr_func_joao',
            'joao',
            'João Gustavo',
            defaultPasswordHash,
            'FUNCIONARIO',
            'Recepção e Atendimento',
            1,
            isoNow,
          ],
        },
      ]);
    }
  } catch (err) {
    console.warn('Local SQLite init notice:', err);
  }

  isInitialized = true;
}

/**
 * Unified Database Adapter supporting Supabase Cloud PostgreSQL and Local SQLite fallback.
 */
export const db = {
  async findUserByUsername(username: string) {
    await ensureDbInitialized();
    const cleanUsername = username.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (error) {
        console.error('Supabase findUserByUsername error:', error);
      }
      return data || null;
    }

    const localDb = getLocalDb();
    if (!localDb) return null;

    const res = await localDb.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = ?',
      args: [cleanUsername],
    });
    return res.rows[0] || null;
  },

  async findUserById(id: string) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, role, department, active')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Supabase findUserById error:', error);
      }
      return data || null;
    }

    const localDb = getLocalDb();
    if (!localDb) return null;

    const res = await localDb.execute({
      sql: 'SELECT id, username, name, role, department, active FROM users WHERE id = ?',
      args: [id],
    });
    return res.rows[0] || null;
  },

  async getAllUsers() {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, role, department, active, created_at')
        .order('role', { ascending: true })
        .order('name', { ascending: true });
      if (error) {
        console.error('Supabase getAllUsers error:', error);
        return [];
      }
      return data || [];
    }

    const localDb = getLocalDb();
    if (!localDb) return [];

    const res = await localDb.execute(`
      SELECT id, username, name, role, department, active, created_at
      FROM users
      ORDER BY role ASC, name ASC
    `);
    return res.rows;
  },

  async createUser(user: {
    id: string;
    username: string;
    name: string;
    password_hash: string;
    role: string;
    department: string;
    active: number;
    created_at: string;
  }) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      if (error) {
        console.error('Supabase createUser error:', error);
        throw error;
      }
      return data;
    }

    const localDb = getLocalDb();
    if (!localDb) throw new Error('Database not initialized');

    await localDb.execute({
      sql: `INSERT INTO users (id, username, name, password_hash, role, department, active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.id,
        user.username,
        user.name,
        user.password_hash,
        user.role,
        user.department,
        user.active,
        user.created_at,
      ],
    });
    return user;
  },

  async updateUser(id: string, updates: Partial<{
    name: string;
    department: string;
    role: string;
    active: number;
    password_hash: string;
  }>) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('users').update(updates).eq('id', id);
      if (error) {
        console.error('Supabase updateUser error:', error);
        throw error;
      }
      return;
    }

    const localDb = getLocalDb();
    if (!localDb) return;

    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClauses = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (updates as any)[f]);
    values.push(id);

    await localDb.execute({
      sql: `UPDATE users SET ${setClauses} WHERE id = ?`,
      args: values,
    });
  },

  async getClients(filters: {
    userId?: string;
    search?: string;
    status?: string;
    period?: string;
  }) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('clients')
        .select('*, users(name, username)')
        .order('created_at', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.status && filters.status !== 'Todos') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        const term = filters.search;
        query = query.or(`name.ilike.%${term}%,cpf.ilike.%${term}%,doctor_request.ilike.%${term}%`);
      }
      if (filters.period === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        query = query.gte('created_at', d.toISOString());
      } else if (filters.period === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        d.setHours(0, 0, 0, 0);
        query = query.gte('created_at', d.toISOString());
      } else if (filters.period === 'month') {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        query = query.gte('created_at', d.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error('Supabase getClients error:', error);
        return [];
      }

      return (data || []).map((c: any) => ({
        ...c,
        user_name: c.users?.name || '',
        user_username: c.users?.username || '',
      }));
    }

    const localDb = getLocalDb();
    if (!localDb) return [];

    let sql = `
      SELECT 
        c.*,
        u.name as user_name,
        u.username as user_username
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (filters.userId) {
      sql += ` AND c.user_id = ?`;
      args.push(filters.userId);
    }

    if (filters.search) {
      sql += ` AND (c.name LIKE ? OR c.cpf LIKE ? OR c.doctor_request LIKE ?)`;
      const term = `%${filters.search}%`;
      args.push(term, term, term);
    }

    if (filters.period === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      sql += ` AND c.created_at >= ?`;
      args.push(d.toISOString());
    } else if (filters.period === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      sql += ` AND c.created_at >= ?`;
      args.push(d.toISOString());
    } else if (filters.period === 'month') {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      sql += ` AND c.created_at >= ?`;
      args.push(d.toISOString());
    }

    sql += ` ORDER BY c.created_at DESC`;

    const res = await localDb.execute({ sql, args });
    return res.rows;
  },

  async getClientById(id: string) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*, users(name, username)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return {
        ...data,
        user_name: (data as any).users?.name || '',
        user_username: (data as any).users?.username || '',
      };
    }

    const localDb = getLocalDb();
    if (!localDb) return null;

    const res = await localDb.execute({
      sql: `
        SELECT c.*, u.name as user_name, u.username as user_username
        FROM clients c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `,
      args: [id],
    });
    return res.rows[0] || null;
  },

  async createClient(client: any) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select('*, users(name, username)')
        .single();

      if (error) {
        console.error('Supabase createClient error:', error);
        throw error;
      }

      return {
        ...data,
        user_name: (data as any).users?.name || '',
        user_username: (data as any).users?.username || '',
      };
    }

    const localDb = getLocalDb();
    if (!localDb) throw new Error('Database not initialized');

    await localDb.execute({
      sql: `
        INSERT INTO clients (
          id, user_id, name, cpf, rg, birth_date, gender, phone, email, zip_code, address, city, state,
          payment_type, health_insurance_name, insurance_card_number, requested_exams, doctor_request,
          clinical_notes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        client.id,
        client.user_id,
        client.name,
        client.cpf,
        client.rg || '',
        client.birth_date || '',
        client.gender || 'Não informado',
        client.phone || '',
        client.email || '',
        client.zip_code || '',
        client.address || '',
        client.city || '',
        client.state || '',
        client.payment_type || 'Particular',
        client.health_insurance_name || '',
        client.insurance_card_number || '',
        client.requested_exams || '',
        client.doctor_request || '',
        client.clinical_notes || '',
        client.status || 'Aguardando Atendimento',
        client.created_at,
        client.updated_at,
      ],
    });

    return this.getClientById(client.id);
  },

  async updateClient(id: string, updates: any) {
    await ensureDbInitialized();

    const nowIso = new Date().toISOString();
    const payload = { ...updates, updated_at: nowIso };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', id)
        .select('*, users(name, username)')
        .single();

      if (error) {
        console.error('Supabase updateClient error:', error);
        throw error;
      }

      return {
        ...data,
        user_name: (data as any).users?.name || '',
        user_username: (data as any).users?.username || '',
      };
    }

    const localDb = getLocalDb();
    if (!localDb) return null;

    const current = await this.getClientById(id);
    if (!current) return null;

    await localDb.execute({
      sql: `
        UPDATE clients SET
          name = ?,
          cpf = ?,
          doctor_request = ?,
          updated_at = ?
        WHERE id = ?
      `,
      args: [
        updates.name ?? current.name,
        updates.cpf ?? current.cpf,
        updates.doctor_request ?? current.doctor_request,
        nowIso,
        id,
      ],
    });

    return this.getClientById(id);
  },

  async deleteClient(id: string) {
    await ensureDbInitialized();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteClient error:', error);
        throw error;
      }
      return;
    }

    const localDb = getLocalDb();
    if (!localDb) return;

    await localDb.execute({
      sql: 'DELETE FROM clients WHERE id = ?',
      args: [id],
    });
  },

  async getMetrics(role: string, userId?: string) {
    await ensureDbInitialized();

    const isEmployee = role === 'FUNCIONARIO';
    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const startOfWeekD = new Date(now);
    const day = startOfWeekD.getDay();
    const diff = startOfWeekD.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(startOfWeekD.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Supabase Metrics Implementation
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      // 1. Total
      let totalQ = client.from('clients').select('*', { count: 'exact', head: true });
      if (isEmployee && userId) totalQ = totalQ.eq('user_id', userId);
      const totalRes = await totalQ;
      const totalClients = totalRes.count || 0;

      // 2. Today
      let todayQ = client.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay);
      if (isEmployee && userId) todayQ = todayQ.eq('user_id', userId);
      const todayRes = await todayQ;
      const todayClients = todayRes.count || 0;

      // 3. Week
      let weekQ = client.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString());
      if (isEmployee && userId) weekQ = weekQ.eq('user_id', userId);
      const weekRes = await weekQ;
      const weekClients = weekRes.count || 0;

      // 4. Month
      let monthQ = client.from('clients').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth);
      if (isEmployee && userId) monthQ = monthQ.eq('user_id', userId);
      const monthRes = await monthQ;
      const monthClients = monthRes.count || 0;

      // 5. Days
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const days: { date: string; label: string; count: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d.getTime() + 24 * 60 * 60 * 1000);

        let dayQ = client
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', d.toISOString())
          .lt('created_at', nextD.toISOString());

        if (isEmployee && userId) dayQ = dayQ.eq('user_id', userId);
        const dayRes = await dayQ;

        days.push({
          date: d.toISOString().split('T')[0],
          label: `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`,
          count: dayRes.count || 0,
        });
      }

      // 6. Employees ranking (only for ADM)
      let clientsPerEmployee: { name: string; username: string; count: number; weekCount: number; monthCount: number }[] = [];

      if (!isEmployee) {
        const { data: emps } = await client.from('users').select('id, username, name').eq('role', 'FUNCIONARIO');

        if (emps && emps.length > 0) {
          clientsPerEmployee = await Promise.all(
            emps.map(async (emp: any) => {
              const [tRes, wRes, mRes] = await Promise.all([
                client.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', emp.id),
                client.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', emp.id).gte('created_at', startOfWeek.toISOString()),
                client.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', emp.id).gte('created_at', startOfMonth),
              ]);

              return {
                name: emp.name as string,
                username: emp.username as string,
                count: tRes.count || 0,
                weekCount: wRes.count || 0,
                monthCount: mRes.count || 0,
              };
            })
          );

          clientsPerEmployee.sort((a, b) => b.weekCount - a.weekCount);
        }
      }

      return {
        totalClients,
        todayClients,
        weekClients,
        monthClients,
        clientsPerDay: days,
        clientsPerEmployee,
        paymentDistribution: [{ type: 'Particular', count: totalClients }],
        statusDistribution: [{ status: 'Concluído', count: totalClients }],
      };
    }

    const localDb = getLocalDb();
    if (!localDb) {
      return {
        totalClients: 0,
        todayClients: 0,
        weekClients: 0,
        monthClients: 0,
        clientsPerDay: [],
        clientsPerEmployee: [],
        paymentDistribution: [],
        statusDistribution: [],
      };
    }

    const userClause = (isEmployee && userId) ? 'WHERE user_id = ?' : '';
    const userArgs: string[] = (isEmployee && userId) ? [userId] : [];

    const totalRes = await localDb.execute({
      sql: `SELECT COUNT(*) as count FROM clients ${userClause}`,
      args: userArgs,
    });
    const totalClients = Number(totalRes.rows[0]?.count || 0);

    const todayRes = await localDb.execute({
      sql: `SELECT COUNT(*) as count FROM clients ${userClause ? userClause + ' AND' : 'WHERE'} created_at >= ?`,
      args: [...userArgs, startOfDay],
    });
    const todayClients = Number(todayRes.rows[0]?.count || 0);

    const weekRes = await localDb.execute({
      sql: `SELECT COUNT(*) as count FROM clients ${userClause ? userClause + ' AND' : 'WHERE'} created_at >= ?`,
      args: [...userArgs, startOfWeek.toISOString()],
    });
    const weekClients = Number(weekRes.rows[0]?.count || 0);

    const monthRes = await localDb.execute({
      sql: `SELECT COUNT(*) as count FROM clients ${userClause ? userClause + ' AND' : 'WHERE'} created_at >= ?`,
      args: [...userArgs, startOfMonth],
    });
    const monthClients = Number(monthRes.rows[0]?.count || 0);

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const days: { date: string; label: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d.getTime() + 24 * 60 * 60 * 1000);

      const dStart = d.toISOString();
      const dEnd = nextD.toISOString();

      const dayRes = await localDb.execute({
        sql: `SELECT COUNT(*) as count FROM clients ${userClause ? userClause + ' AND' : 'WHERE'} created_at >= ? AND created_at < ?`,
        args: [...userArgs, dStart, dEnd],
      });

      days.push({
        date: d.toISOString().split('T')[0],
        label: `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`,
        count: Number(dayRes.rows[0]?.count || 0),
      });
    }

    let clientsPerEmployee: { name: string; username: string; count: number; weekCount: number; monthCount: number }[] = [];

    if (!isEmployee) {
      const empRes = await localDb.execute(`
        SELECT id, username, name FROM users WHERE role = 'FUNCIONARIO' ORDER BY name ASC
      `);

      clientsPerEmployee = await Promise.all(
        empRes.rows.map(async (emp: any) => {
          const empTotal = await localDb.execute({
            sql: 'SELECT COUNT(*) as count FROM clients WHERE user_id = ?',
            args: [emp.id],
          });
          const empWeek = await localDb.execute({
            sql: 'SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND created_at >= ?',
            args: [emp.id, startOfWeek.toISOString()],
          });
          const empMonth = await localDb.execute({
            sql: 'SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND created_at >= ?',
            args: [emp.id, startOfMonth],
          });

          return {
            name: emp.name as string,
            username: emp.username as string,
            count: Number(empTotal.rows[0]?.count || 0),
            weekCount: Number(empWeek.rows[0]?.count || 0),
            monthCount: Number(empMonth.rows[0]?.count || 0),
          };
        })
      );

      clientsPerEmployee.sort((a, b) => b.weekCount - a.weekCount);
    }

    return {
      totalClients,
      todayClients,
      weekClients,
      monthClients,
      clientsPerDay: days,
      clientsPerEmployee,
      paymentDistribution: [{ type: 'Particular', count: totalClients }],
      statusDistribution: [{ status: 'Concluído', count: totalClients }],
    };
  },

  async getEmployeeClientCounts(userId: string) {
    await ensureDbInitialized();
    const now = new Date();

    const startOfWeekD = new Date(now);
    const day = startOfWeekD.getDay();
    const diff = startOfWeekD.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(startOfWeekD.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const [tRes, wRes, mRes] = await Promise.all([
        client.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        client.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', startOfWeek.toISOString()),
        client.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', startOfMonth),
      ]);

      return {
        total_clients: tRes.count || 0,
        week_clients: wRes.count || 0,
        month_clients: mRes.count || 0,
      };
    }

    const localDb = getLocalDb();
    if (!localDb) {
      return { total_clients: 0, week_clients: 0, month_clients: 0 };
    }

    const totalRes = await localDb.execute({
      sql: 'SELECT COUNT(*) as count FROM clients WHERE user_id = ?',
      args: [userId],
    });

    const weekRes = await localDb.execute({
      sql: 'SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND created_at >= ?',
      args: [userId, startOfWeek.toISOString()],
    });

    const monthRes = await localDb.execute({
      sql: 'SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND created_at >= ?',
      args: [userId, startOfMonth],
    });

    return {
      total_clients: Number(totalRes.rows[0]?.count || 0),
      week_clients: Number(weekRes.rows[0]?.count || 0),
      month_clients: Number(monthRes.rows[0]?.count || 0),
    };
  },
};
