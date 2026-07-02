type IconName =
  | "crown"
  | "spark"
  | "route"
  | "refresh"
  | "play"
  | "bot"
  | "theme"
  | "help"
  | "turn"
  | "flag"
  | "chart"
  | "users"
  | "search"
  | "lightbulb";

type IconProps = {
  name: IconName;
  className?: string;
};

const icons: Record<IconName, JSX.Element> = {
  crown: (
    <path
      d="M4 17h16l-1.4-9.2-4.4 3.1L12 5.5l-2.2 5.4-4.4-3.1L4 17Zm2.2 2h11.6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  spark: (
    <path
      d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  route: (
    <path
      d="M7 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm10 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM8.8 9.2l5.7 5.7M8 18h4a3 3 0 0 0 3-3v-1"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  refresh: (
    <path
      d="M20 11a8 8 0 0 0-13.7-5.6L4 7.8M4 4v4h4m-4 5a8 8 0 0 0 13.7 5.6L20 16.2M20 20v-4h-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  play: (
    <path
      d="m8 6 10 6-10 6V6Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  bot: (
    <path
      d="M12 3v3m-5 4h10a3 3 0 0 1 3 3v4H4v-4a3 3 0 0 1 3-3Zm1 9v2m8-2v2M9 13h.01M15 13h.01"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  theme: (
    <path
      d="M12 3v2.3m0 13.4V21m9-9h-2.3M5.3 12H3m15.1 6.1-1.6-1.6M7.5 7.5 5.9 5.9m12.2 0-1.6 1.6M7.5 16.5l-1.6 1.6M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  help: (
    <path
      d="M12 18h.01M9.1 9a3 3 0 1 1 5.1 2.1c-.8.8-1.7 1.4-1.7 2.9"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  turn: (
    <path
      d="M18 6a8 8 0 0 0-12.6 1.2M6 6H3v3m15 9h3v-3m-3 3a8 8 0 0 1-12.6-1.2"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  flag: (
    <path
      d="M6 20V5m0 1c2 0 3-.8 4.8-.8 2.3 0 3.4 1.6 5.6 1.6 1.1 0 1.9-.2 2.6-.6V14c-.7.4-1.5.6-2.6.6-2.2 0-3.3-1.6-5.6-1.6-1.8 0-2.8.8-4.8.8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  chart: (
    <path
      d="M4 19h16M7 16l3-4 3 2 4-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  users: (
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m14-10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11 10v-2a4 4 0 0 0-3-3.9"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  search: (
    <path
      d="m21 21-4.3-4.3M10.7 18a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  lightbulb: (
    <path
      d="M9 18h6m-5 3h4m-6-8a6 6 0 1 1 8 0c-.7.7-1.2 1.8-1.3 3H9.3c-.1-1.2-.6-2.3-1.3-3Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  )
};

export function Icon({ name, className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}
