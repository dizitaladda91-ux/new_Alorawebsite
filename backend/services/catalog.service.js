export const parseList = (value, allowed) => {
    const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
    return [...new Set(values
        .map(item => String(item ?? '').trim().toLowerCase())
        .filter(item => item && allowed.includes(item)))];
};

export const getAllowedCatalogSlug = (value, allowed) => {
    if (typeof value !== 'string') return null;
    const slug = value.trim().toLowerCase();
    return allowed.includes(slug) ? slug : null;
};
