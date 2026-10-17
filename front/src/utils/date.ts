export function formatToBrasilia(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return '-';
  const hasTimezone = dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr);
  const normalizedStr = hasTimezone ? dateStr : `${dateStr}Z`;

  return new Date(normalizedStr).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    ...options,
  });
}
