import type { RegionCode } from '~/composables/useRegion'

// Origin coordinates for animated driving routes [lng, lat]
export const mockDriverOriginsByRegion: Record<RegionCode, Record<string, [number, number]>> = {
  us: {
    'DRV-001': [-94.57, 29.76], // Houston → Dallas
    'DRV-002': [-122.67, 45.52], // Portland → LA
    'DRV-004': [-93.09, 44.97], // Minneapolis → Chicago
    'DRV-007': [-105.07, 40.57], // Denver → Phoenix
    'DRV-009': [-97.74, 30.27], // Austin → Houston
  },
  mx: {
    'DRV-MX-001': [-99.13, 19.43], // CDMX → Guadalajara
    'DRV-MX-002': [-103.35, 20.67], // Guadalajara → Monterrey
    'DRV-MX-004': [-100.31, 25.67], // Monterrey → Puebla
    'DRV-MX-007': [-96.72, 17.06], // Oaxaca → Veracruz
    'DRV-MX-009': [-89.62, 21.16], // Merida → Cancun
  },
  uk: {
    'DRV-UK-001': [-0.13, 51.51], // London → Birmingham
    'DRV-UK-002': [-1.9, 52.48], // Birmingham → Manchester
    'DRV-UK-004': [-2.24, 53.48], // Manchester → Leeds
    'DRV-UK-007': [-1.55, 53.8], // Leeds → Edinburgh
    'DRV-UK-009': [-3.19, 55.95], // Edinburgh → Glasgow
  },
}

// Speeds for driving drivers (mph for US/UK, km/h for MX)
export const mockDriverSpeedsByRegion: Record<RegionCode, Record<string, number>> = {
  us: {
    'DRV-001': 62,
    'DRV-002': 58,
    'DRV-004': 65,
    'DRV-007': 71,
    'DRV-009': 55,
  },
  mx: {
    'DRV-MX-001': 95,
    'DRV-MX-002': 88,
    'DRV-MX-004': 100,
    'DRV-MX-007': 92,
    'DRV-MX-009': 85,
  },
  uk: {
    'DRV-UK-001': 56,
    'DRV-UK-002': 52,
    'DRV-UK-004': 58,
    'DRV-UK-007': 60,
    'DRV-UK-009': 48,
  },
}
