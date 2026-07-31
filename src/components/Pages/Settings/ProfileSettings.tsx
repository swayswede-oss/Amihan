import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import type { UserProfile } from '../../../App';

type FormErrors = {
  name?: string;
  position?: string;
  email?: string;
  phone?: string;
};

type ProfileSettingsProps = {
  user: UserProfile;
  onSave: (profile: UserProfile) => void;
  onBack: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileSettings({ user, onSave, onBack }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name);
  const [position, setPosition] = useState(user.position);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!position.trim()) {
      nextErrors.position = 'Position is required';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!validate()) return;

    onSave({
      ...user,
      name: name.trim(),
      position: position.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    setSuccessMessage('Profile updated successfully.');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="back-to-settings-btn"
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          style={{
            backgroundColor: isBackHovered ? '#aeb6c4' : 'transparent',
            color: isBackHovered ? '#111827' : '#374151',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Update your account details. Changes appear in the sidebar profile menu.
        </p>
      </div>

      <section className="bg-card rounded-lg border border-gray-200 p-4 lg:p-6 max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="profile-menu-avatar w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="profile-menu-muted text-base">
              {getInitials(name.trim() || user.name)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {name.trim() || user.name}
            </p>
            <p className="profile-menu-muted text-xs">Member since {memberSince}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm text-gray-700">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSuccessMessage(null);
              }}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="profile-position" className="mb-1.5 block text-sm text-gray-700">
              Position
            </label>
            <input
              id="profile-position"
              type="text"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                setSuccessMessage(null);
              }}
              placeholder="e.g. Fleet Manager"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-600">{errors.position}</p>
            )}
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-sm text-gray-700">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSuccessMessage(null);
              }}
              placeholder="e.g. john.doe@amihan.com"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="profile-phone" className="mb-1.5 block text-sm text-gray-700">
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSuccessMessage(null);
              }}
              placeholder="e.g. +1 (555) 123-4567"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-4 text-sm font-medium text-white transition-colors"
            onMouseEnter={() => setIsSubmitHovered(true)}
            onMouseLeave={() => setIsSubmitHovered(false)}
            style={{
              paddingTop: '0.875rem',
              paddingBottom: '0.875rem',
              backgroundColor: isSubmitHovered ? '#1d4ed8' : '#2563eb',
            }}
          >
            <Save className="w-4 h-4 shrink-0" />
            Save profile
          </button>
        </form>
      </section>
    </div>
  );
}
