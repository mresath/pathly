import { Activity } from "./habit";

export const NAV_THEME = {
  light: {
    background: '#FFFFFF', // background
    border: 'hsl(240 5.9% 90%)', // border
    card: 'hsl(0 0% 100%)', // card
    notification: 'hsl(0 84.2% 60.2%)', // destructive
    primary: '#efea5a', // primary
    text: '#0b1713', // foreground
  },
  dark: {
    background: '#0b1713', // background
    border: 'hsl(240 3.7% 15.9%)', // border
    card: '#070f0d', // card
    notification: 'hsl(0 72% 51%)', // destructive
    primary: '#efea5a', // primary
    text: '#FFFFFF', // foreground
  },
};

export const DEFAULT_ACTIVITIES: Record<string, Activity> = {
  'exercise': {
    id: 'exercise',
    name: 'Exercise',
    description: 'Engaging in physical activity to improve health and fitness.',
    icon: 'Dumbbell',
    stats: ["physical"],
    type: 'positive',
    difficulty: 3,
  },
  'reading': {
    id: 'reading',
    name: 'Reading',
    description: 'Reading books or articles to gain knowledge or for pleasure.',
    icon: 'BookOpen',
    stats: ["mental", "skill"],
    type: 'positive',
    difficulty: 3,
  },
  'meditation': {
    id: 'meditation',
    name: 'Meditation',
    description: 'Practicing mindfulness or meditation for mental clarity and relaxation.',
    icon: 'HeartHandshake',
    stats: ["mental", "spiritual"],
    type: 'positive',
    difficulty: 3,
  },
  'nofap': {
    id: 'nofap',
    name: 'NoFap',
    description: 'A commitment to abstain from pornography and masturbation.',
    icon: 'CircleOff',
    stats: ["mental", "physical", "social", "spiritual"],
    type: 'negative',
    difficulty: 5,
  },
  'smoking': {
    id: 'smoking',
    name: 'Smoking',
    description: 'Avoiding or quitting smoking for better health.',
    icon: 'CigaretteOff',
    stats: ["mental", "physical"],
    type: 'negative',
    difficulty: 5,
  },
  'drinking': {
    id: 'drinking',
    name: 'Drinking',
    description: 'Limiting or abstaining from alcohol consumption.',
    icon: 'BeerOff',
    stats: ["mental", "physical"],
    type: 'negative',
    difficulty: 5,
  },
  'social_media': {
    id: 'social_media',
    name: 'Social Media',
    description: 'Limiting or abstaining from social media use.',
    icon: 'VibrateOff',
    stats: ["mental", "social"],
    type: 'negative',
    difficulty: 4,
  },
  'gaming': {
    id: 'gaming',
    name: 'Gaming',
    description: 'Limiting or abstaining from video games.',
    icon: 'MonitorOff',
    stats: ["mental", "social"],
    type: 'negative',
    difficulty: 4,
  },
  'sleep': {
    id: 'sleep',
    name: 'Sleep',
    description: 'Improving sleep quality and duration for better health.',
    icon: 'Clock10',
    stats: ["physical"],
    type: 'positive',
    difficulty: 3,
  },
  'nutrition': {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Eating a balanced diet to improve health and well-being.',
    icon: 'Apple',
    stats: ["physical"],
    type: 'positive',
    difficulty: 3,
  },
  "hydration": {
    id: 'hydration',
    name: 'Hydration',
    description: 'Ensuring adequate water intake for health.',
    icon: 'GlassWater',
    stats: ["physical"],
    type: 'positive',
    difficulty: 3,
  },
  "journaling": {
    id: 'journaling',
    name: 'Journaling',
    description: 'Writing down thoughts and experiences for reflection and mental clarity.',
    icon: 'NotebookPen',
    stats: ["mental", "spiritual"],
    type: 'positive',
    difficulty: 3,
  },
  "learning": {
    id: 'learning',
    name: 'Learning',
    description: 'Engaging in educational activities to acquire new skills or knowledge.',
    icon: 'Brain',
    stats: ["mental", "skill"],
    type: 'positive',
    difficulty: 3,
  },
  "studying": {
    id: 'studying',
    name: 'Studying',
    description: 'Focusing on academic or professional studies to improve knowledge and skills.',
    icon: 'GraduationCap',
    stats: ["mental", "skill"],
    type: 'positive',
    difficulty: 4,
  },
}