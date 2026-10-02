import { AVATAR_ASSETS } from './avatarArt';
import { AVATAR_PALETTES } from './palettes';

export type ProfileAvatarAssignment = {
  assetId: string;
  paletteId: string;
};

const STORAGE_KEY = 'amihan.profileAvatars';

const sessionAssignments = new Map<string, ProfileAvatarAssignment>();
const listeners = new Set<() => void>();
let version = 0;

export function subscribeProfileAvatars(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getProfileAvatarVersion() {
  return version;
}

function notify() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function randomIndex(length: number): number {
  if (length <= 1) return 0;
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoObj.getRandomValues(values);
    return values[0] % length;
  }
  return Math.floor(Math.random() * length);
}

function isValid(value: unknown): value is ProfileAvatarAssignment {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as ProfileAvatarAssignment;
  return (
    AVATAR_ASSETS.some((asset) => asset.id === candidate.assetId) &&
    AVATAR_PALETTES.some((palette) => palette.id === candidate.paletteId)
  );
}

function readAll(): Record<string, ProfileAvatarAssignment> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, ProfileAvatarAssignment>;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, ProfileAvatarAssignment>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Private mode or a full disk should not block rendering.
  }
}

function pickAssignment(): ProfileAvatarAssignment {
  const asset = AVATAR_ASSETS[randomIndex(AVATAR_ASSETS.length)];
  const palette = AVATAR_PALETTES[randomIndex(AVATAR_PALETTES.length)];
  return { assetId: asset.id, paletteId: palette.id };
}

function createAssignment(exclude?: ProfileAvatarAssignment | null): ProfileAvatarAssignment {
  let next = pickAssignment();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (
      !exclude ||
      next.assetId !== exclude.assetId ||
      next.paletteId !== exclude.paletteId
    ) {
      return next;
    }
    next = pickAssignment();
  }
  return next;
}

export function getOrCreateProfileAvatar(username: string): ProfileAvatarAssignment {
  const key = username.trim();
  const cached = sessionAssignments.get(key);
  if (cached) return cached;

  const all = readAll();
  const stored = all[key];
  if (isValid(stored)) {
    sessionAssignments.set(key, stored);
    return stored;
  }

  const created = createAssignment();
  sessionAssignments.set(key, created);
  all[key] = created;
  writeAll(all);
  return created;
}

export function renameProfileAvatar(fromUsername: string, toUsername: string) {
  const from = fromUsername.trim();
  const to = toUsername.trim();
  if (!from || !to || from === to) return;

  const all = readAll();
  const current =
    sessionAssignments.get(from) ?? (isValid(all[from]) ? all[from] : null);
  if (!current) return;

  sessionAssignments.set(to, current);
  all[to] = current;
  writeAll(all);
}

export function rerollProfileAvatar(username: string): ProfileAvatarAssignment | null {
  const key = username.trim();
  if (!key) return null;

  const all = readAll();
  const current =
    sessionAssignments.get(key) ?? (isValid(all[key]) ? all[key] : null);
  const next = createAssignment(current);
  sessionAssignments.set(key, next);
  all[key] = next;
  writeAll(all);
  notify();
  return next;
}
