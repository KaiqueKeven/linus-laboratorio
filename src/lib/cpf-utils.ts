/**
 * CPF Utilities: Formatting and Brazilian Federal Revenue Validation Algorithm.
 */

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '').slice(0, 11);
}

export function formatCPF(val: string): string {
  const digits = cleanCPF(val);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Validates CPF with official check-digit algorithm
 */
export function validateCPF(cpf: string): { isValid: boolean; message: string } {
  const digits = cleanCPF(cpf);

  if (digits.length === 0) {
    return { isValid: false, message: 'Digite o CPF do cliente' };
  }

  if (digits.length < 11) {
    return {
      isValid: false,
      message: `CPF incompleto (${digits.length}/11 dígitos)`,
    };
  }

  // Check known invalid CPFs (all repeated digits like 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) {
    return { isValid: false, message: 'CPF inválido (dígitos repetidos)' };
  }

  // 1st digit check
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9), 10)) {
    return { isValid: false, message: 'Dígito verificador do CPF inválido' };
  }

  // 2nd digit check
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(10), 10)) {
    return { isValid: false, message: 'Dígito verificador do CPF inválido' };
  }

  return { isValid: true, message: 'CPF válido e verificado' };
}
