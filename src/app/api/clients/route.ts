import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { cleanCPF, formatCPF, validateCPF } from '@/lib/cpf-utils';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const userIdFilter = searchParams.get('userId');
    const period = searchParams.get('period') || undefined;
    const status = searchParams.get('status') || undefined;

    // If employee, can strictly only see their own clients
    const targetUserId = session.role === 'FUNCIONARIO' ? session.id : (userIdFilter || undefined);

    const clients = await db.getClients({
      userId: targetUserId,
      search,
      period,
      status,
    });

    return NextResponse.json({ clients });
  } catch (err: any) {
    console.error('Error fetching clients:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const data = await request.json();

    const name = String(data.name || '').trim();
    const rawCpf = String(data.cpf || '').trim();
    const doctorRequest = String(data.doctor_request || '').trim();

    // 1. Validate mandatory fields
    if (!name) {
      return NextResponse.json(
        { error: 'Por favor, informe o nome completo do cliente.' },
        { status: 400 }
      );
    }

    // 2. Strict CPF verification
    const digits = cleanCPF(rawCpf);
    if (digits.length !== 11) {
      return NextResponse.json(
        { error: `O CPF deve conter exatamente 11 números. Digitados: ${digits.length}/11.` },
        { status: 400 }
      );
    }

    const cpfValidation = validateCPF(digits);
    if (!cpfValidation.isValid) {
      return NextResponse.json(
        { error: `CPF inválido: ${cpfValidation.message}. Verifique os números digitados.` },
        { status: 400 }
      );
    }

    if (!doctorRequest) {
      return NextResponse.json(
        { error: 'Por favor, informe o nome do doutor responsável pelo encaminhamento.' },
        { status: 400 }
      );
    }

    // 3. Employee and Timestamp are AUTOMATIC
    const targetUserId = (session.role === 'ADM' && data.user_id) ? data.user_id : session.id;
    const formattedCpf = formatCPF(digits);
    const id = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const createdClient = await db.createClient({
      id,
      user_id: targetUserId,
      name,
      cpf: formattedCpf,
      rg: data.rg ? String(data.rg).trim() : '',
      birth_date: data.birth_date || '',
      gender: data.gender || 'Não informado',
      phone: data.phone ? String(data.phone).trim() : '',
      email: data.email ? String(data.email).trim() : '',
      zip_code: '',
      address: '',
      city: 'Belo Horizonte',
      state: 'MG',
      payment_type: (data.payment_type === 'Convênio' || data.payment_type === 'Convenio') ? 'Convênio' : 'Particular',
      health_insurance_name: data.health_insurance_name || '',
      insurance_card_number: '',
      requested_exams: data.requested_exams || 'Atendimento / Encaminhamento Clínico',
      doctor_request: doctorRequest,
      clinical_notes: data.clinical_notes || '',
      status: 'Aguardando Atendimento',
      created_at: nowIso,
      updated_at: nowIso,
    });

    return NextResponse.json({
      success: true,
      client: createdClient,
    });
  } catch (err: any) {
    console.error('Error creating client:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
