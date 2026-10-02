import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const client = await db.getClientById(id);

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    if (session.role === 'FUNCIONARIO' && client.user_id !== session.id) {
      return NextResponse.json({ error: 'Acesso negado a esta ficha.' }, { status: 403 });
    }

    return NextResponse.json({ client });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const currentClient = await db.getClientById(id);
    if (!currentClient) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    if (session.role === 'FUNCIONARIO' && currentClient.user_id !== session.id) {
      return NextResponse.json({ error: 'Permissão negada para alterar este cliente.' }, { status: 403 });
    }

    const payload = { ...data };
    if (payload.payment_type) {
      payload.payment_type = (payload.payment_type === 'Convênio' || payload.payment_type === 'Convenio') ? 'Convênio' : 'Particular';
    }

    const updated = await db.updateClient(id, payload);
    return NextResponse.json({ success: true, client: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = await params;
    const currentClient = await db.getClientById(id);

    if (!currentClient) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    if (session.role === 'FUNCIONARIO' && currentClient.user_id !== session.id) {
      return NextResponse.json({ error: 'Permissão negada para excluir este cliente.' }, { status: 403 });
    }

    await db.deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
