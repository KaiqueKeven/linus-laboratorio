import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADM') {
      return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
    }

    const employeesResult = await db.getAllUsers();

    // For each employee, calculate registration metrics
    const employees = await Promise.all(
      employeesResult.map(async (emp: any) => {
        const counts = await db.getEmployeeClientCounts(emp.id);
        return {
          ...emp,
          total_clients: counts.total_clients,
          week_clients: counts.week_clients,
          month_clients: counts.month_clients,
        };
      })
    );

    return NextResponse.json({ employees });
  } catch (err: any) {
    console.error('Error fetching employees:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADM') {
      return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
    }

    const { username, name, password, department, role } = await request.json();

    if (!username || !name || !password) {
      return NextResponse.json(
        { error: 'Nome de usuário, nome completo e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // Check if username already exists
    const existing = await db.findUserByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um colaborador cadastrado com este nome de usuário.' },
        { status: 400 }
      );
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const password_hash = bcrypt.hashSync(String(password), 10);
    const nowIso = new Date().toISOString();

    const created = await db.createUser({
      id,
      username: cleanUsername,
      name: String(name).trim(),
      password_hash,
      role: role === 'ADM' ? 'ADM' : 'FUNCIONARIO',
      department: department || 'Recepção',
      active: 1,
      created_at: nowIso,
    });

    return NextResponse.json({
      success: true,
      employee: created,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADM') {
      return NextResponse.json({ error: 'Acesso restrito ao administrador.' }, { status: 403 });
    }

    const { id, active, department, role, password } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    if (id === session.id && active === 0) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta de administrador.' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (typeof active === 'number') updates.active = active;
    if (department) updates.department = department;
    if (role && (role === 'ADM' || role === 'FUNCIONARIO')) updates.role = role;
    if (password && password.trim().length >= 3) {
      updates.password_hash = bcrypt.hashSync(password.trim(), 10);
    }

    await db.updateUser(id, updates);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
