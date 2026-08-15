import { defineTheme } from '@astryxdesign/core/theme'

export const airbnbTheme = defineTheme({
  name: 'airbnb',
  color: { accent: '#FF385C', neutralStyle: 'neutral' },
  typography: {
    body: {
      family: '"Noto Sans TC"',
      fallbacks: 'Inter, "PingFang TC", "Microsoft JhengHei", sans-serif',
    },
    heading: {
      family: '"Noto Sans TC"',
      fallbacks: 'Inter, "PingFang TC", "Microsoft JhengHei", sans-serif',
    },
  },
  radius: { base: 8, multiplier: 1 },
  tokens: {
    '--color-accent': ['#FF385C', '#FF6B85'],
    '--color-text-primary': ['#222222', '#E8E8E8'],
    '--color-text-secondary': ['#3F3F3F', '#BBBBBB'],
    '--color-text-accent': ['#E00B41', '#FF8DA0'],
    '--color-icon-accent': ['#FF385C', '#FF6B85'],
    '--color-background-body': ['#FFFFFF', '#111112'],
    '--color-background-surface': ['#FFFFFF', '#1F1F22'],
    '--color-background-card': ['#FFFFFF', '#242428'],
  },
})
