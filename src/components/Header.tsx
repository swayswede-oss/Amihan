import { Menu } from 'lucide-react';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="px-4 lg:px-6 py-3 lg:py-4" style={{ backgroundColor: '#4a5568' }}>
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
