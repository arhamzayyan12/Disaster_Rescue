
import floodImg from '../assets/disaster/flood.png';
import fireImg from '../assets/disaster/fire.png';
import cycloneImg from '../assets/disaster/cyclone.png';
import earthquakeImg from '../assets/disaster/earthquake.png';
import droughtImg from '../assets/disaster/drought.png';
import landslideImg from '../assets/disaster/landslide.png';
import thunderstormImg from '../assets/disaster/thunderstorm.png';
import coldwaveImg from '../assets/disaster/coldwave.png';
import dustImg from '../assets/disaster/dust.png';
import hailImg from '../assets/disaster/hail.png';

export type DisasterTypeKey = 'flood' | 'fire' | 'cyclone' | 'earthquake' | 'drought' | 'landslide' | 'thunderstorm' | 'heatwave' | 'coldwave' | 'fog' | 'hail' | 'dust' | 'default';

interface DisasterConfigItem {
    label: string;
    iconName: string; // Material Symbol name
    color: string;
    image: string;
    keywords: Record<string, number>; // Keyword -> Weight (0-1)
}

export const DISASTER_CONFIG: Record<DisasterTypeKey, DisasterConfigItem> = {
    flood: {
        label: 'Flood',
        iconName: 'flood',
        color: '#2196F3',
        image: floodImg,
        keywords: { 'flood': 0.9, 'overflow': 0.7, 'water level': 0.6, 'inundation': 0.8 }
    },
    fire: {
        label: 'Wildfire',
        iconName: 'local_fire_department',
        color: '#FF5722',
        image: fireImg,
        keywords: { 'fire': 0.9, 'burn': 0.6, 'flame': 0.7, 'forest': 0.4 }
    },
    cyclone: {
        label: 'Cyclone',
        iconName: 'cyclone',
        color: '#00BCD4',
        image: cycloneImg,
        keywords: { 'cyclone': 0.9, 'storm': 0.5, 'hurricane': 0.9, 'typhoon': 0.9, 'wind': 0.3 }
    },
    earthquake: {
        label: 'Earthquake',
        iconName: 'broken_image',
        color: '#795548',
        image: earthquakeImg,
        keywords: { 'earthquake': 0.9, 'seismic': 0.8, 'tremor': 0.7, 'magnitude': 0.5 }
    },
    drought: {
        label: 'Drought',
        iconName: 'water_loss',
        color: '#FFC107',
        image: droughtImg,
        keywords: { 'drought': 0.9, 'dry': 0.4, 'scarcity': 0.6 }
    },
    landslide: {
        label: 'Landslide',
        iconName: 'landslide',
        color: '#8D6E63',
        image: landslideImg,
        keywords: { 'landslide': 0.9, 'mudslide': 0.8, 'terrain': 0.4 }
    },
    thunderstorm: {
        label: 'Thunderstorm',
        iconName: 'thunderstorm',
        color: '#607D8B',
        image: thunderstormImg,
        keywords: { 'thunderstorm': 0.9, 'lightning': 0.8, 'thunder': 0.7 }
    },
    heatwave: {
        label: 'Heatwave',
        iconName: 'thermostat',
        color: '#FF9800',
        image: droughtImg,
        keywords: { 'heatwave': 0.9, 'heat': 0.5, 'temperature': 0.3 }
    },
    coldwave: {
        label: 'Coldwave',
        iconName: 'ac_unit',
        color: '#76A3D8', // Adjusted to be visible but cool
        image: coldwaveImg,
        keywords: { 'coldwave': 0.9, 'cold': 0.5, 'freeze': 0.7, 'snow': 0.6 }
    },
    fog: {
        label: 'Fog',
        iconName: 'foggy',
        color: '#9E9E9E',
        image: dustImg,
        keywords: { 'fog': 0.9, 'visibility': 0.7, 'dense': 0.5, 'smog': 0.8 }
    },
    hail: {
        label: 'Hail',
        iconName: 'weather_hail', // Check if valid, or use 'grain'
        color: '#78909C',
        image: hailImg,
        keywords: { 'hail': 0.9, 'hailstorm': 0.9, 'ice': 0.4 }
    },
    dust: {
        label: 'Dust Storm',
        iconName: 'air',
        color: '#BCAAA4',
        image: dustImg,
        keywords: { 'dust': 0.9, 'sandstorm': 0.9, 'sand': 0.5 }
    },
    default: {
        label: 'Alert',
        iconName: 'warning',
        color: '#607D8B',
        image: floodImg,
        keywords: {}
    }
};

export const SEVERITY_COLORS = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    critical: '#9C27B0'
};
