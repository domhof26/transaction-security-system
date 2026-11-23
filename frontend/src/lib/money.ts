export function parseEuroToCents(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const euros = Number(match[1]);
  const cents = Number((match[2] ?? '').padEnd(2, '0') || '0');
  const amountCents = euros * 100 + cents;

  return Number.isSafeInteger(amountCents) ? amountCents : null;
}
