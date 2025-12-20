

export const DISASTER_ICONS: Record<string, string> = {
    flood: 'flood',
    earthquake: 'broken_image',
    cyclone: 'cyclone',
    drought: 'water_loss',
    fire: 'local_fire_department',
    landslide: 'landslide',
    thunderstorm: 'thunderstorm',
    heatwave: 'thermostat',
    coldwave: 'ac_unit',
    fog: 'foggy',
    pollution: 'masks',
    default: 'warning'
};

export const SEVERITY_COLORS: Record<string, string> = {
    low: '#4CAF50', // Green
    medium: '#FF9800', // Orange
    high: '#F44336', // Red
    critical: '#9C27B0' // Purple
};

export const DISASTER_TYPE_COLORS: Record<string, string> = {
    flood: '#2196F3', // Blue
    cyclone: '#00BCD4', // Cyan
    fire: '#FF5722', // Deep Orange
    earthquake: '#795548', // Brown
    drought: '#FFC107', // Amber
    landslide: '#8D6E63', // Brownish
    thunderstorm: '#607D8B', // Blue Grey
    heatwave: '#FF9800', // Orange
    coldwave: '#FFFFFF', // White
    fog: '#9E9E9E', // Grey
    pollution: '#616161', // Dark Grey
    default: '#607D8B'
};

export const getDisasterIconName = (type: string): string => {
    return DISASTER_ICONS[type.toLowerCase()] || DISASTER_ICONS.default;
};

export const getSeverityColor = (severity: string): string => {
    return SEVERITY_COLORS[severity?.toLowerCase()] || SEVERITY_COLORS.medium;
};

export const getDisasterTypeColor = (type: string): string => {
    return DISASTER_TYPE_COLORS[type.toLowerCase()] || DISASTER_TYPE_COLORS.default;
};
