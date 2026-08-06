// SPDX-FileCopyrightText: 2026 Yaoyao(Freax) Qian <limyoonaxi@gmail.com>
// SPDX-License-Identifier: GPL-3.0-only

import { IconType } from 'react-icons'
import {
  FaRobot, FaBrain, FaGlobe, FaChartBar, FaWrench, FaHeartbeat, FaBookOpen, FaUsers,
} from 'react-icons/fa'
import type { ProjectItem } from '../types'

/**
 * Terminal palette, category themes, and color config.
 *
 * Template users: customise these to match your own brand.
 */

/* ── LaST-HD-inspired terminal palette (single source of truth) ── */
export const terminalPalette = {
  /** 7-color rainbow bar palette — orange → magenta → purple → blue signature ramp */
  rainbow: ['#ee6a3a', '#f0854e', '#d76ad4', '#c44fbf', '#9b45c6', '#5c78e0', '#3a5fd9'] as const,

  /** All semantic terminal colors, dark/light variants */
  colors: (dk: boolean) => ({
    bg:        dk ? '#18171f' : '#fffefb',
    text:      dk ? '#e9e7ef' : '#23252c',
    header:    dk ? '#201e29' : '#f0ece3',
    border:    dk ? '#34313f' : '#e7e3d9',
    prompt:    dk ? '#f0925e' : '#be4519',
    command:   dk ? '#8aa2f2' : '#2542a6',
    param:     dk ? '#b877dd' : '#8a3bb0',
    info:      dk ? '#9aa8e8' : '#3f5bb5',
    highlight: dk ? '#e8b96a' : '#a3721f',
    error:     dk ? '#e56b6b' : '#b0302f',
    success:   dk ? '#8ab87a' : '#37795c',
    warning:   dk ? '#f0854e' : '#a8541f',
    secondary: dk ? '#a09eae' : '#565d68',
    muted:     dk ? '#6c6a78' : '#a9a495',
    /** Touch bar background */
    touchBar:  dk ? '#121118' : '#ece8dc',
    /** Tab bar background */
    tabBar:    dk ? '#1c1a24' : '#eeeade',
  }),
} as const

/* ── Project category themes ──────────────────────────────────── */
export type CatTheme = {
  bg: string; border: string; stripe: string; color: string; glow: string
  icon: IconType; label: string; cmd: string
}

export const buildCategoryThemes = (dk: boolean): Record<ProjectItem['category'], CatTheme> => ({
  robotics: {
    bg: dk ? '#2b2440' : '#f3eaff', border: dk ? '#8a6dd8' : '#a389ea',
    stripe: 'linear-gradient(180deg,#b380ff,transparent)',
    color: dk ? '#c89cff' : '#7a44c0', glow: dk ? 'rgba(179,128,255,0.25)' : 'rgba(122,68,192,0.12)',
    icon: FaRobot, label: 'ROBOTICS', cmd: '$ ros2 launch planner',
  },
  nlp: {
    bg: dk ? '#2e2334' : '#ffeef6', border: dk ? '#c26e9c' : '#e899bf',
    stripe: 'linear-gradient(180deg,#ff80bf,transparent)',
    color: dk ? '#f0a0c8' : '#b0447a', glow: dk ? 'rgba(255,128,191,0.25)' : 'rgba(176,68,122,0.12)',
    icon: FaBrain, label: 'NLP / AI', cmd: '$ python train.py',
  },
  'web-app': {
    bg: dk ? '#2e2c2b' : '#fff2e9', border: dk ? '#d39d6b' : '#e2b287',
    stripe: 'linear-gradient(180deg,#ffb680,transparent)',
    color: dk ? '#ffbe8d' : '#c27435', glow: dk ? 'rgba(255,182,128,0.25)' : 'rgba(194,116,53,0.12)',
    icon: FaGlobe, label: 'WEB / APP', cmd: '$ npm run dev',
  },
  data: {
    bg: dk ? '#243126' : '#eafff0', border: dk ? '#56b07b' : '#77d09a',
    stripe: 'linear-gradient(180deg,#6bd59c,transparent)',
    color: dk ? '#7ce3b6' : '#2f9e6a', glow: dk ? 'rgba(107,213,156,0.25)' : 'rgba(47,158,106,0.12)',
    icon: FaChartBar, label: 'DATA / ML', cmd: '$ jupyter execute',
  },
  tooling: {
    bg: dk ? '#223235' : '#eaffff', border: dk ? '#53c2c2' : '#7adcdc',
    stripe: 'linear-gradient(180deg,#7feeee,transparent)',
    color: dk ? '#7feeee' : '#2aa9a9', glow: dk ? 'rgba(127,238,238,0.25)' : 'rgba(42,169,169,0.12)',
    icon: FaWrench, label: 'TOOLING', cmd: '$ make install',
  },
  healthcare: {
    bg: dk ? '#2e2327' : '#fff0f0', border: dk ? '#bf616a' : '#e88888',
    stripe: 'linear-gradient(180deg,#ff8080,transparent)',
    color: dk ? '#f09090' : '#c04040', glow: dk ? 'rgba(255,128,128,0.25)' : 'rgba(192,64,64,0.12)',
    icon: FaHeartbeat, label: 'HEALTHCARE', cmd: '$ python recommend.py',
  },
  resources: {
    bg: dk ? '#2e2a1f' : '#fff8e1', border: dk ? '#b8995a' : '#d4be7e',
    stripe: 'linear-gradient(180deg,#f0d090,transparent)',
    color: dk ? '#ebcb8b' : '#a07a3e', glow: dk ? 'rgba(235,203,139,0.25)' : 'rgba(160,122,62,0.12)',
    icon: FaBookOpen, label: 'RESOURCES', cmd: '$ cat awesome-list.md',
  },
  agent: {
    bg: dk ? '#1f2932' : '#e7eef5', border: dk ? '#5e81ac' : '#7d9dc4',
    stripe: 'linear-gradient(180deg,#81a1c1,transparent)',
    color: dk ? '#81a1c1' : '#4a6e9a', glow: dk ? 'rgba(129,161,193,0.25)' : 'rgba(74,110,154,0.12)',
    icon: FaUsers, label: 'AGENT', cmd: '$ python agent.py',
  },
})

/* ── Article category labels & colors ─────────────────────────── */
export const articleCategoryLabels: Record<ProjectItem['category'], string> = {
  robotics: 'Robotics', nlp: 'NLP / AI', 'web-app': 'Web / App',
  data: 'Data / ML', tooling: 'Tooling', healthcare: 'Healthcare',
  resources: 'Resources', agent: 'Agent',
}

export const articleCategoryColors: Record<ProjectItem['category'], { fg: (dk: boolean) => string; bg: (dk: boolean) => string }> = {
  robotics:   { fg: dk => dk ? '#c89cff' : '#7a44c0', bg: dk => dk ? 'rgba(200,156,255,0.15)' : 'rgba(122,68,192,0.1)' },
  nlp:        { fg: dk => dk ? '#f0a0c8' : '#b0447a', bg: dk => dk ? 'rgba(240,160,200,0.15)' : 'rgba(176,68,122,0.1)' },
  'web-app':  { fg: dk => dk ? '#ffbe8d' : '#c27435', bg: dk => dk ? 'rgba(255,190,141,0.15)' : 'rgba(194,116,53,0.1)' },
  data:       { fg: dk => dk ? '#7ce3b6' : '#2f9e6a', bg: dk => dk ? 'rgba(124,227,182,0.15)' : 'rgba(47,158,106,0.1)' },
  tooling:    { fg: dk => dk ? '#7feeee' : '#2aa9a9', bg: dk => dk ? 'rgba(127,238,238,0.15)' : 'rgba(42,169,169,0.1)' },
  healthcare: { fg: dk => dk ? '#f09090' : '#c04040', bg: dk => dk ? 'rgba(240,144,144,0.15)' : 'rgba(192,64,64,0.1)' },
  resources:  { fg: dk => dk ? '#ebcb8b' : '#a07a3e', bg: dk => dk ? 'rgba(235,203,139,0.15)' : 'rgba(160,122,62,0.1)' },
  agent:      { fg: dk => dk ? '#81a1c1' : '#4a6e9a', bg: dk => dk ? 'rgba(129,161,193,0.15)' : 'rgba(74,110,154,0.1)' },
}

/* ── Publication venue colors ─────────────────────────────────── */
export const publicationVenueColors: Record<string, { bg: (dk: boolean) => string; fg: (dk: boolean) => string; label: string }> = {
  conference: {
    bg: dk => dk ? 'rgba(136, 192, 208, 0.15)' : 'rgba(42, 118, 156, 0.1)',
    fg: dk => dk ? '#88c0d0' : '#2a769c',
    label: 'CONFERENCE',
  },
  journal: {
    bg: dk => dk ? 'rgba(143, 188, 187, 0.15)' : 'rgba(43, 128, 125, 0.1)',
    fg: dk => dk ? '#8fbcbb' : '#2b807d',
    label: 'JOURNAL',
  },
  workshop: {
    bg: dk => dk ? 'rgba(180, 142, 173, 0.15)' : 'rgba(154, 86, 162, 0.1)',
    fg: dk => dk ? '#b48ead' : '#9a56a2',
    label: 'WORKSHOP',
  },
  demo: {
    bg: dk => dk ? 'rgba(208, 135, 112, 0.15)' : 'rgba(179, 90, 46, 0.1)',
    fg: dk => dk ? '#d08770' : '#b35a2e',
    label: 'DEMO TRACK',
  },
  preprint: {
    bg: dk => dk ? 'rgba(163, 190, 140, 0.15)' : 'rgba(54, 128, 90, 0.1)',
    fg: dk => dk ? '#a3be8c' : '#36805a',
    label: 'PREPRINT',
  },
}
