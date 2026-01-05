import { IconProps } from "@/lib/types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon as HugeHome01Icon,
  CompassIcon as HugeCompassIcon,
  Radar02Icon as HugeRadar02Icon,
  UserIcon as HugeUserIcon,
  Search01Icon as HugeSearch01Icon,
  Add01Icon as HugeAdd01Icon,
  Settings01Icon as HugeSettings01Icon,
  Edit01Icon as HugeEdit01Icon,
  Share01Icon as HugeShare01Icon,
  Tick01Icon as HugeTick01Icon,
  CrownIcon as HugeCrownIcon,
  ChartIncreaseIcon as HugeChartIncreaseIcon,
  ChartDecreaseIcon as HugeChartDecreaseIcon,
  GridIcon as HugeGridIcon,
  ListViewIcon as HugeListViewIcon,
  ArrowUp01Icon as HugeArrowUp01Icon,
  ArrowDown01Icon as HugeArrowDown01Icon,
  ArrowRight01Icon as HugeArrowRight01Icon,
  ArrowLeft01Icon as HugeArrowLeft01Icon,
  Dollar01Icon as HugeDollar01Icon,
  RefreshIcon as HugeRefreshIcon,
  ChatIcon as HugeChatIcon,
  HelpCircleIcon as HugeHelpCircleIcon,
  Notification02Icon as HugeNotification02Icon,
  Sun01Icon as HugeSun01Icon,
  Moon01Icon as HugeMoon01Icon,
  Shield01Icon as HugeShield01Icon,
  LockIcon as HugeLockIcon,
  Clock01Icon as HugeClock01Icon,
  FilterIcon as HugeFilterIcon,
  ContractsIcon as HugeContractsIcon,
  SparklesIcon as HugeSparklesIcon,
  Download01Icon as HugeDownload01Icon,
  Copy01Icon as HugeCopy01Icon,
  Image01Icon as HugeImage01Icon,
  Link01Icon as HugeLink01Icon,
  Camera01Icon as HugeCamera01Icon,
  NewTwitterIcon as HugeNewTwitterIcon,
  DiscordIcon as HugeDiscordIcon,
  GithubIcon as HugeGithubIcon,
  UserGroupIcon as HugeUserGroupIcon,
  Cancel01Icon as HugeCancel01Icon,
  Logout01Icon as HugeLogout01Icon,
  Wallet01Icon as HugeWallet01Icon,
  Calendar01Icon as HugeCalendar01Icon,
  CreditCardIcon as HugeCreditCardIcon,
  Globe02Icon as HugeGlobe02Icon,
  Sorting05Icon as HugeSorting05Icon,
  Loading02Icon as HugeLoading02Icon,
  Fire03Icon as HugeFireIcon,
} from "@hugeicons/core-free-icons";

// Helper wrapper for hugeicons with className support
function createHugeIcon(icon: typeof HugeHome01Icon, defaultFill = false) {
  return function IconComponent({ className }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        className={className}
        strokeWidth={2}
        color="currentColor"
        fill={defaultFill ? "currentColor" : "none"}
      />
    );
  };
}

// Navigation Icons
export const HomeIcon = createHugeIcon(HugeHome01Icon);
export const DiscoverIcon = createHugeIcon(HugeCompassIcon);
export const SummonsIcon = createHugeIcon(HugeRadar02Icon);
export const AppealsIcon = SummonsIcon; // Alias for backwards compatibility
export const ProfileIcon = createHugeIcon(HugeUserIcon);

// Action Icons
export const SearchIcon = createHugeIcon(HugeSearch01Icon);
export const PlusIcon = createHugeIcon(HugeAdd01Icon);
export const SettingsIcon = createHugeIcon(HugeSettings01Icon);
export const EditIcon = createHugeIcon(HugeEdit01Icon);
export const ShareIcon = createHugeIcon(HugeShare01Icon);

// Status Icons
export const CheckIcon = createHugeIcon(HugeTick01Icon);
export const CrownIcon = createHugeIcon(HugeCrownIcon, true);

// Trend Icons
export const TrendUpIcon = createHugeIcon(HugeChartIncreaseIcon);
export const TrendDownIcon = createHugeIcon(HugeChartDecreaseIcon);

// UI Icons
export const GridIcon = createHugeIcon(HugeGridIcon);
export const ListIcon = createHugeIcon(HugeListViewIcon);
export const ChevronUpIcon = createHugeIcon(HugeArrowUp01Icon);
export const ChevronDownIcon = createHugeIcon(HugeArrowDown01Icon);
export const ChevronRightIcon = createHugeIcon(HugeArrowRight01Icon);
export const ChevronLeftIcon = createHugeIcon(HugeArrowLeft01Icon);
export const ArrowRightIcon = createHugeIcon(HugeArrowRight01Icon);
export const ArrowLeftIcon = createHugeIcon(HugeArrowLeft01Icon);

// Finance Icons
export const DollarIcon = createHugeIcon(HugeDollar01Icon);
export const RefundIcon = createHugeIcon(HugeRefreshIcon);

// Communication Icons
export const ChatIcon = createHugeIcon(HugeChatIcon);
export const BeaconIcon = createHugeIcon(HugeRadar02Icon);
export const HelpCircleIcon = createHugeIcon(HugeHelpCircleIcon);
export const BellIcon = createHugeIcon(HugeNotification02Icon);

// Theme Icons
export const SunIcon = createHugeIcon(HugeSun01Icon);
export const MoonIcon = createHugeIcon(HugeMoon01Icon);

// Security/Trust Icons
export const ShieldIcon = createHugeIcon(HugeShield01Icon);
export const LockIcon = createHugeIcon(HugeLockIcon);
export const ClockIcon = createHugeIcon(HugeClock01Icon);
export const FilterIcon = createHugeIcon(HugeFilterIcon);
export const ContractIcon = createHugeIcon(HugeContractsIcon);
export const SparkleIcon = createHugeIcon(HugeSparklesIcon);

// Download & Copy Icons
export const DownloadIcon = createHugeIcon(HugeDownload01Icon);
export const CopyIcon = createHugeIcon(HugeCopy01Icon);
export const ImageIcon = createHugeIcon(HugeImage01Icon);
export const LinkIcon = createHugeIcon(HugeLink01Icon);
export const CameraIcon = createHugeIcon(HugeCamera01Icon);

// Social Icons
export const TwitterIcon = createHugeIcon(HugeNewTwitterIcon, true);
export const XConnectIcon = createHugeIcon(HugeNewTwitterIcon, true);
export const DiscordIcon = createHugeIcon(HugeDiscordIcon, true);
export const GithubIcon = createHugeIcon(HugeGithubIcon, true);
export const UsersIcon = createHugeIcon(HugeUserGroupIcon);

// Additional utility icons
export const CloseIcon = createHugeIcon(HugeCancel01Icon);
export const XIcon = createHugeIcon(HugeCancel01Icon);
export const LogoutIcon = createHugeIcon(HugeLogout01Icon);
export const WalletIcon = createHugeIcon(HugeWallet01Icon);
export const CalendarIcon = createHugeIcon(HugeCalendar01Icon);
export const CreditCardIcon = createHugeIcon(HugeCreditCardIcon);
export const GlobeIcon = createHugeIcon(HugeGlobe02Icon);
export const SortIcon = createHugeIcon(HugeSorting05Icon);
export const LoadingIcon = createHugeIcon(HugeLoading02Icon);

export const FireIcon = createHugeIcon(HugeFireIcon);

// Icon map for dynamic rendering
export const ICON_MAP = {
  home: HomeIcon,
  discover: DiscoverIcon,
  summons: SummonsIcon,
  appeals: AppealsIcon,
  profile: ProfileIcon,
  search: SearchIcon,
  plus: PlusIcon,
  settings: SettingsIcon,
  edit: EditIcon,
  share: ShareIcon,
  check: CheckIcon,
  crown: CrownIcon,
  trendUp: TrendUpIcon,
  trendDown: TrendDownIcon,
  grid: GridIcon,
  list: ListIcon,
  chevronUp: ChevronUpIcon,
  chevronDown: ChevronDownIcon,
  chevronRight: ChevronRightIcon,
  chevronLeft: ChevronLeftIcon,
  arrowRight: ArrowRightIcon,
  arrowLeft: ArrowLeftIcon,
  dollar: DollarIcon,
  refund: RefundIcon,
  chat: ChatIcon,
  beacon: BeaconIcon,
  helpCircle: HelpCircleIcon,
  bell: BellIcon,
  sun: SunIcon,
  moon: MoonIcon,
  shield: ShieldIcon,
  lock: LockIcon,
  clock: ClockIcon,
  filter: FilterIcon,
  contract: ContractIcon,
  sparkle: SparkleIcon,
  download: DownloadIcon,
  copy: CopyIcon,
  image: ImageIcon,
  link: LinkIcon,
  camera: CameraIcon,
  twitter: TwitterIcon,
  xConnect: XConnectIcon,
  discord: DiscordIcon,
  github: GithubIcon,
  users: UsersIcon,
  close: CloseIcon,
  x: XIcon,
  logout: LogoutIcon,
  wallet: WalletIcon,
  calendar: CalendarIcon,
  creditCard: CreditCardIcon,
  globe: GlobeIcon,
  sort: SortIcon,
  loading: LoadingIcon,
} as const;

export type IconName = keyof typeof ICON_MAP;

// Dynamic Icon component
export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const IconComponent = ICON_MAP[name];
  return <IconComponent className={className} />;
}
