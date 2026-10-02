import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { rerollProfileAvatar } from './profileAvatarStorage';

type ShuffleAvatarButtonProps = {
  username: string;
};

export function ShuffleAvatarButton({ username }: ShuffleAvatarButtonProps) {
  const [turns, setTurns] = useState(0);
  const disabled = !username.trim();

  return (
    <button
      type="button"
      className="profile-round-btn"
      aria-label="New random profile icon"
      title="New icon"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        rerollProfileAvatar(username);
        setTurns((current) => current + 1);
      }}
    >
      <Shuffle
        aria-hidden="true"
        size={17}
        strokeWidth={2}
        style={{ transform: `rotate(${turns * 180}deg)` }}
      />
    </button>
  );
}
