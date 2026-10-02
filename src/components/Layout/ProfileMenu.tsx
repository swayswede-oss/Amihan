import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { UserProfile } from '../../App';
import { api } from '../../services/api.ts';
import { ProfileAvatar } from '../Profile/ProfileAvatar';
import { ShuffleAvatarButton } from '../Profile/ShuffleAvatarButton';

type ProfileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onProfileSettings: () => void;
};

export function ProfileMenu({ open, onOpenChange, user, onProfileSettings }: ProfileMenuProps) {
  const name = user.name;
  const [memberSince, setMemberSince] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function fetchUserDetails() {
      try {
        const fetchedDetails = await api.getUser();
        if (cancelled || !fetchedDetails || typeof fetchedDetails !== "object") return;
        if (typeof fetchedDetails.email === "string") setEmail(fetchedDetails.email);
        if (!fetchedDetails.created_at) return;
        const memberDate = new Date(fetchedDetails.created_at + "T00:00:00").toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        if (!cancelled) setMemberSince(memberDate);
      } catch (error) {
        console.error(error);
      }
    }
    fetchUserDetails();
    return () => {
      cancelled = true;
    };
  }, [user]);
  /*
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  */
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div className="profile-footer-row" style={{ flex: 1, minWidth: 0 }}>
        <PopoverTrigger asChild>
          <button
            className={`profile-footer-row rounded-lg transition-colors min-w-0 ${
              open
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            style={{ flex: 1, padding: '0.25rem 0.5rem', minHeight: '2.5rem', gap: '0.75rem' }}
          >
            <ProfileAvatar username={name} />
            <div className="min-w-0 text-left" style={{ flex: 1 }}>
              <p
                className={`truncate ${open ? 'text-blue-600' : 'text-gray-900'}`}
                style={{ fontSize: '1.125rem', lineHeight: 1.3, fontWeight: 500 }}
              >
                {name}
              </p>
              {/*
              <p className={`text-xs truncate ${open ? 'text-blue-500' : 'text-gray-600'}`}>
                {user.position}
              </p>
              */}
            </div>
          </button>
        </PopoverTrigger>
        <div className="profile-footer-actions">
          <ShuffleAvatarButton username={name} />
        </div>
      </div>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-80 bg-white border-gray-200 p-0 shadow-lg"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ProfileAvatar username={name} size={48} />
            <div className="min-w-0">
              <p
                className="truncate text-gray-900"
                style={{ fontSize: '1.25rem', lineHeight: 1.2, fontWeight: 600 }}
              >
                {name}
              </p>
              {/*<p className="text-xs text-gray-500">{user.position}</p>*/}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Member since</p>
              <p className="text-gray-900">{memberSince}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-900 truncate">{email}</p>
            </div>
          </div>

          {/*
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-gray-900">{user.phone}</p>
            </div>
          </div>
          */}

          <button
            onClick={onProfileSettings}
            className="profile-menu-settings w-full flex items-center justify-center gap-2 rounded-lg transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
