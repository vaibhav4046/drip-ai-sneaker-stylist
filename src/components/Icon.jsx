import {
  Coffee, Heart, Briefcase, Dumbbell, Clapperboard, PartyPopper, Music, Gem,
  Plane, Mountain, Diamond, Moon, Camera, Shirt, Sparkles, ShoppingBag, User,
  Plus, X, Mic, Send, RefreshCw, Trash2, Check, ChevronRight, ChevronLeft, Search, Star,
  Cloud, Sun, CloudRain, MapPin, ExternalLink, Wand2, ScanLine, Volume2, VolumeX,
  Settings, Shuffle, TrendingUp, RotateCw, Footprints, Snowflake, Home, Flame, Zap,
  ArrowRight, Heart as HeartIcon, Compass, Bookmark, BookmarkCheck,
} from 'lucide-react'

const MAP = {
  Coffee, Heart, Briefcase, Dumbbell, Clapperboard, PartyPopper, Music, Gem,
  Plane, Mountain, Diamond, Moon, Camera, Shirt, Sparkles, ShoppingBag, User,
  Plus, X, Mic, Send, RefreshCw, Trash2, Check, ChevronRight, ChevronLeft, Search, Star,
  Cloud, Sun, CloudRain, MapPin, ExternalLink, Wand2, ScanLine, Volume2, VolumeX,
  Settings, Shuffle, TrendingUp, RotateCw, Footprints, Snowflake, Home, Flame, Zap,
  ArrowRight, HeartIcon, Compass, Bookmark, BookmarkCheck,
}

export function Icon({ name, size = 20, className = '', strokeWidth = 2, ...rest }) {
  const C = MAP[name] || Sparkles
  return <C size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />
}
