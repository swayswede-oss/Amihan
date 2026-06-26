import { Mail, Phone, Calendar, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { UserProfile } from '../App';

type ProfileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onProfileSettings: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileMenu({ open, onOpenChange, user, onProfileSettings }: ProfileMenuProps) {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-w-0 ${
            open
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className={`text-sm ${open ? 'text-blue-600' : 'text-gray-600'}`}>
              {getInitials(user.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className={`text-sm truncate ${open ? 'text-blue-600' : 'text-gray-900'}`}>
              {user.name}
            </p>
            <p className={`text-xs truncate ${open ? 'text-blue-500' : 'text-gray-600'}`}>
              {user.position}
            </p>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-80 bg-white border-gray-200 p-0 shadow-lg"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-base text-gray-600">{getInitials(user.name)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.position}</p>
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
              <p className="text-gray-900 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-gray-900">{user.phone}</p>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0">
          <button
            onClick={onProfileSettings}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
