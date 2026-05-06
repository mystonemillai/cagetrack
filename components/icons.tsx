import { Eye, ClipboardList, Target, FileText, MessageCircle, FileBarChart, Home, Settings, Users, User, Lock, Link2, Activity, Search, Dumbbell, Star, Bell, ChevronRight, Plus, Trash2, Calendar, Hash } from 'lucide-react';

// Icon wrapper for consistent sizing
export function CTIcon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, any> = {
    // Coach actions
    'observation': Eye,
    'drill': ClipboardList,
    'plan': Target,
    'session': FileText,
    
    // Stats
    'drills-count': Activity,
    'messages': MessageCircle,
    'reports': FileBarChart,
    
    // Nav
    'home': Home,
    'settings': Settings,
    'coaches': Users,
    'search': Search,
    
    // General
    'user': User,
    'lock': Lock,
    'connect': Link2,
    'favorite': Star,
    'notify': Bell,
    'arrow': ChevronRight,
    'add': Plus,
    'delete': Trash2,
    'calendar': Calendar,
    'pitches': Hash,
  };

  const IconComponent = icons[name];
  if (!IconComponent) return <span className={className}>?</span>;
  
  return <IconComponent size={size} className={className} />;
}

// Custom baseball SVG - used for player cards
export function BaseballIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M 5 5.5 Q 8 8, 5 12 Q 2 16, 5 18.5" />
      <path d="M 19 5.5 Q 16 8, 19 12 Q 22 16, 19 18.5" />
    </svg>
  );
}

// Custom bat SVG - used for drills/hitting
export function BatIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M 4 20 L 8 16" />
      <path d="M 8 16 L 20 4" strokeWidth="2.5" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Custom cap SVG - used for coach placeholder
export function CoachCapIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M 3 14 C 3 14, 5 8, 12 8 C 19 8, 21 14, 21 14" />
      <path d="M 3 14 L 21 14" />
      <path d="M 12 8 L 12 5" />
      <path d="M 10 5 L 14 5" />
      <ellipse cx="12" cy="14" rx="10" ry="3" />
    </svg>
  );
}

// Custom whistle SVG
export function WhistleIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="16" cy="14" r="6" />
      <path d="M 4 10 L 11 10" />
      <path d="M 11 10 L 12 8" />
      <circle cx="16" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}
