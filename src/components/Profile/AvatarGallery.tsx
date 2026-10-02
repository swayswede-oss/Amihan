import { AVATAR_ASSETS } from './avatarArt';
import { AVATAR_PALETTES } from './palettes';
import { AvatarGlyph } from './ProfileAvatar';

export function AvatarGallery() {
  return (
    <div className="min-h-screen bg-[#e8eef5] p-6 text-gray-800">
      <h1 className="mb-4 text-lg font-semibold">Profile avatars</h1>
      <div className="mb-8 grid grid-cols-8 gap-4">
        {AVATAR_ASSETS.map((asset, index) => {
          const palette = AVATAR_PALETTES[index % AVATAR_PALETTES.length];
          return (
            <div key={asset.id} className="text-center">
              <div className="mx-auto overflow-hidden rounded-full" style={{ width: 64, height: 64 }}>
                <AvatarGlyph assetId={asset.id} paletteId={palette.id} />
              </div>
              <p className="mt-1 text-xs">{asset.name}</p>
            </div>
          );
        })}
      </div>
      <h2 className="mb-3 text-sm font-medium">Same animal, each palette</h2>
      <div className="mb-8 flex flex-wrap gap-3">
        {AVATAR_PALETTES.map((palette) => (
          <div key={palette.id} className="overflow-hidden rounded-full" style={{ width: 56, height: 56 }}>
            <AvatarGlyph assetId="cat" paletteId={palette.id} />
          </div>
        ))}
      </div>
      <section className="max-w-xl rounded-lg border border-gray-200 bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-full" style={{ width: 40, height: 40 }}>
            <AvatarGlyph assetId="cat" paletteId="harbor" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">charlie</p>
            <p className="text-xs text-gray-500">Member since September 30, 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
