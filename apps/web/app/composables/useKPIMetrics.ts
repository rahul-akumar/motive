import type { KpiMetric } from '@motive/shared'

export function useKPIMetrics() {
  const metrics = ref<KpiMetric[]>([
    {
      id: 'active-drivers',
      title: 'Active Drivers',
      value: 47,
      displayValue: '47',
      unit: '/ 52',
      delta: 3,
      deltaLabel: '+3 from yesterday',
      deltaType: 'increase',
      icon: 'drivers',
      color: 'cyan',
      subtitle: '5 offline',
    },
    {
      id: 'miles-today',
      title: 'Miles Today',
      value: 12847,
      displayValue: '12,847',
      unit: 'mi',
      delta: 8.4,
      deltaLabel: '+8.4% vs avg',
      deltaType: 'increase',
      icon: 'miles',
      color: 'blue',
      subtitle: 'Across 47 drivers',
    },
    {
      id: 'on-time',
      title: 'On-Time Delivery',
      value: 94.2,
      displayValue: '94.2',
      unit: '%',
      delta: -1.3,
      deltaLabel: '-1.3% this week',
      deltaType: 'decrease',
      icon: 'ontime',
      color: 'emerald',
      subtitle: '3 delayed loads',
    },
    {
      id: 'active-alerts',
      title: 'Active Alerts',
      value: 3,
      displayValue: '3',
      unit: 'critical',
      delta: 2,
      deltaLabel: '+2 since 8am',
      deltaType: 'decrease',
      icon: 'alerts',
      color: 'red',
      subtitle: '7 warnings',
    },
  ])

  return { metrics }
}
