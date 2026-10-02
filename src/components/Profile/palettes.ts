export type AvatarPalette = {
  id: string;
  bg: string;
  stroke: string;
  accent: string;
};

// Circle behind every animal. Halfway between #ABBFD4 and #D5DFEA.
export const AVATAR_BG = '#C0CFDF';

// Stroke stays dark so the line art stays readable.
// Accent fills the colored regions of the source icons.
export const AVATAR_PALETTES: readonly AvatarPalette[] = [
  { id: 'harbor', bg: AVATAR_BG, stroke: '#1F4E79', accent: '#7EADD4' },
  { id: 'sage', bg: AVATAR_BG, stroke: '#1E5C3A', accent: '#8FBF9E' },
  { id: 'sand', bg: AVATAR_BG, stroke: '#7A4E24', accent: '#D4AE7A' },
  { id: 'clay', bg: AVATAR_BG, stroke: '#8A4034', accent: '#D9A090' },
  { id: 'lilac', bg: AVATAR_BG, stroke: '#5A3D78', accent: '#C0A6D4' },
  { id: 'lagoon', bg: AVATAR_BG, stroke: '#0F5F5C', accent: '#7FB8B4' },
  { id: 'slate', bg: AVATAR_BG, stroke: '#3A4658', accent: '#9AA6B8' },
  { id: 'apricot', bg: AVATAR_BG, stroke: '#8C4E2A', accent: '#E2B48A' },
  { id: 'olive', bg: AVATAR_BG, stroke: '#4A5C22', accent: '#B4C48A' },
  { id: 'indigo', bg: AVATAR_BG, stroke: '#343E78', accent: '#A0A8D0' },
  { id: 'rose', bg: AVATAR_BG, stroke: '#7E3452', accent: '#DCA8BC' },
  { id: 'stone', bg: AVATAR_BG, stroke: '#5C4E44', accent: '#CDB8A4' },
];
