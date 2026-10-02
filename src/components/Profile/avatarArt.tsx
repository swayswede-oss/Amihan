import type { AvatarPalette } from './palettes';

const NAMES: Record<string, string> = {
  bat: 'Bat',
  bear: 'Bear',
  bee: 'Bee',
  bird: 'Bird',
  butterfly: 'Butterfly',
  cat: 'Cat',
  cattle: 'Cattle',
  deer: 'Deer',
  dog: 'Dog',
  dolphin: 'Dolphin',
  duck: 'Duck',
  eagle: 'Eagle',
  elephant: 'Elephant',
  fish: 'Fish',
  frog: 'Frog',
  hippo: 'Hippo',
  koala: 'Koala',
  monkey: 'Monkey',
  owl: 'Owl',
  panda: 'Panda',
  pig: 'Pig',
  pigeon: 'Pigeon',
  rabbit: 'Rabbit',
  whale: 'Whale',
};

const rawModules = import.meta.glob('../../assets/avatars/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const AVATAR_ASSETS: readonly {
  id: string;
  name: string;
  svg: string;
}[] = Object.entries(rawModules)
  .map(([path, svg]) => {
    const id = path.split('/').pop()?.replace(/\.svg$/, '') ?? path;
    return { id, name: NAMES[id] ?? id, svg };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

function mixWithWhite(hex: string, amount: number): string {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));
  const mixed = channels.map((channel) =>
    Math.round(channel + (255 - channel) * amount)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${mixed.join('')}`;
}

export function colorizeAvatar(svg: string, palette: AvatarPalette): string {
  const detail = mixWithWhite(palette.accent, 0.42);
  return svg
    .replaceAll('#43CCF8', detail)
    .replaceAll('#2F88FF', palette.accent)
    .replaceAll('stroke="white"', `stroke="${palette.stroke}"`)
    .replaceAll('fill="white"', `fill="${palette.bg}"`)
    .replaceAll('stroke="black"', `stroke="${palette.stroke}"`)
    .replaceAll('fill="black"', `fill="${palette.stroke}"`)
    .replace('width="48"', 'width="100%"')
    .replace('height="48"', 'height="100%"');
}
