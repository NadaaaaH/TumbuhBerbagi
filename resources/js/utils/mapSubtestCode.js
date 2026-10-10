export default function mapSubtestCode(category) {
    const value = (category || '').trim();
    const lower = value.toLowerCase();

    if (value === 'PU' || lower.includes('penalaran umum')) return 'PU';
    if (value === 'PPU' || (lower.includes('pemahaman') && lower.includes('umum')) ||
        (lower.includes('pengetahuan') && lower.includes('umum'))) return 'PPU';
    if (value === 'PBM' || (lower.includes('bacaan') && lower.includes('menulis'))) return 'PBM';
    if (value === 'PK' || lower.includes('kuantitatif')) return 'PK';
    if (value === 'LBI' || (lower.includes('indonesia') && lower.includes('literasi')) ||
        lower.includes('bahasa indonesia')) return 'LBI';
    if (['LBE', 'LBING'].includes(value.toUpperCase()) || lower.includes('inggris') ||
        lower.includes('english')) return 'LBING';
    if (value === 'PM' || lower.includes('matematika')) return 'PM';
    if (lower.includes('literasi')) return 'LBI';

    return value || 'Umum';
}
