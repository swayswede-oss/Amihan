import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AVATAR_ASSETS, colorizeAvatar } from './avatarArt';
import { AVATAR_PALETTES } from './palettes';
import {
  getOrCreateProfileAvatar,
  getProfileAvatarVersion,
  subscribeProfileAvatars,
  type ProfileAvatarAssignment,
} from './profileAvatarStorage';

export function AvatarGlyph({
  assetId,
  paletteId,
}: {
  assetId: string;
  paletteId: string;
}) {
  const asset = AVATAR_ASSETS.find((item) => item.id === assetId) ?? AVATAR_ASSETS[0];
  const palette = AVATAR_PALETTES.find((item) => item.id === paletteId) ?? AVATAR_PALETTES[0];

  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: palette.bg,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '12%',
      }}
      dangerouslySetInnerHTML={{ __html: colorizeAvatar(asset.svg, palette) }}
    />
  );
}

function ProfileAvatarTile({
  assignment,
  onClose,
}: {
  assignment: ProfileAvatarAssignment;
  onClose: () => void;
}) {
  const asset = AVATAR_ASSETS.find((item) => item.id === assignment.assetId) ?? AVATAR_ASSETS[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${asset.name} avatar`}
    >
      <button
        type="button"
        aria-label="Close avatar"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          border: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          cursor: 'pointer',
        }}
      />
      <div
        className="profile-avatar-tile relative w-full shadow-xl"
        style={{
          zIndex: 1,
          maxWidth: 420,
          borderRadius: 12,
          backgroundColor: '#bdc3cc',
          border: '1px solid #bdc3cc',
          padding: '36px 28px 28px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex items-center justify-center"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: 16, height: 16 }} aria-hidden="true" />
        </button>
        <div
          className="overflow-hidden rounded-full"
          style={{
            width: 'min(280px, 70vw)',
            height: 'min(280px, 70vw)',
            margin: '0 auto',
            boxShadow: '0 16px 40px rgba(31, 78, 121, 0.18)',
          }}
        >
          <AvatarGlyph assetId={assignment.assetId} paletteId={assignment.paletteId} />
        </div>
        <p style={{ margin: '20px 0 0', fontSize: 22, fontWeight: 600, color: '#1f2937' }}>
          {asset.name}
        </p>
      </div>
    </div>,
    document.body,
  );
}

type ProfileAvatarProps = {
  username: string;
  size?: number;
  expandable?: boolean;
};

export function ProfileAvatar({ username, size = 40, expandable = false }: ProfileAvatarProps) {
  const [tileOpen, setTileOpen] = useState(false);
  const version = useSyncExternalStore(
    subscribeProfileAvatars,
    getProfileAvatarVersion,
    getProfileAvatarVersion,
  );
  const trimmed = username.trim();
  const assignment: ProfileAvatarAssignment | null = trimmed
    ? getOrCreateProfileAvatar(trimmed)
    : null;
  const assetName = assignment
    ? (AVATAR_ASSETS.find((item) => item.id === assignment.assetId)?.name ?? 'profile')
    : 'profile';

  const circle = (
    <div
      className="overflow-hidden rounded-full"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {assignment ? (
        <div
          key={`${assignment.assetId}-${assignment.paletteId}-${version}`}
          className={version > 0 ? 'profile-avatar-swap' : undefined}
          style={{ width: '100%', height: '100%' }}
        >
          <AvatarGlyph assetId={assignment.assetId} paletteId={assignment.paletteId} />
        </div>
      ) : (
        <svg viewBox="0 0 80 80" className="block h-full w-full" aria-hidden="true">
          <circle cx="40" cy="40" r="40" fill="#E4E8EF" />
        </svg>
      )}
    </div>
  );

  return (
    <>
      {expandable && assignment ? (
        <button
          type="button"
          className="profile-avatar-button"
          aria-label={`View larger ${assetName} avatar`}
          title="View larger"
          onClick={() => setTileOpen(true)}
        >
          {circle}
        </button>
      ) : (
        circle
      )}
      {tileOpen && assignment ? (
        <ProfileAvatarTile assignment={assignment} onClose={() => setTileOpen(false)} />
      ) : null}
    </>
  );
}
