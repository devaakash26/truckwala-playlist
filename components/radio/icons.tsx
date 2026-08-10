const BASE = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
  focusable: false,
} as const;

export function SkipBackIcon() {
  return (
    <svg {...BASE}>
      <rect x="4.8" y="6" width="2.4" height="12" rx="1.2" />
      <path d="M20 6.9v10.2a.6.6 0 0 1-.94.5l-7.6-5.1a.6.6 0 0 1 0-1l7.6-5.1a.6.6 0 0 1 .94.5Z" />
    </svg>
  );
}

export function SkipForwardIcon() {
  return (
    <svg {...BASE}>
      <rect x="16.8" y="6" width="2.4" height="12" rx="1.2" />
      <path d="M4 6.9v10.2a.6.6 0 0 0 .94.5l7.6-5.1a.6.6 0 0 0 0-1L4.94 6.4a.6.6 0 0 0-.94.5Z" />
    </svg>
  );
}

export function RewindIcon() {
  return (
    <svg {...BASE}>
      <path d="M11 7.4v9.2a.5.5 0 0 1-.78.42l-6.9-4.6a.5.5 0 0 1 0-.84l6.9-4.6a.5.5 0 0 1 .78.42Z" />
      <path d="M21 7.4v9.2a.5.5 0 0 1-.78.42l-6.9-4.6a.5.5 0 0 1 0-.84l6.9-4.6a.5.5 0 0 1 .78.42Z" />
    </svg>
  );
}

export function FastForwardIcon() {
  return (
    <svg {...BASE}>
      <path d="M3 7.4v9.2a.5.5 0 0 0 .78.42l6.9-4.6a.5.5 0 0 0 0-.84l-6.9-4.6A.5.5 0 0 0 3 7.4Z" />
      <path d="M13 7.4v9.2a.5.5 0 0 0 .78.42l6.9-4.6a.5.5 0 0 0 0-.84l-6.9-4.6a.5.5 0 0 0-.78.42Z" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg {...BASE}>
      <path d="M7.5 5.2v13.6a.7.7 0 0 0 1.07.6l11-6.8a.7.7 0 0 0 0-1.2l-11-6.8a.7.7 0 0 0-1.07.6Z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg {...BASE}>
      <rect x="6.5" y="5" width="4" height="14" rx="1.6" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.6" />
    </svg>
  );
}

export function SpinnerIcon() {
  return (
    <svg {...BASE} fill="none" stroke="currentColor" strokeWidth="2.2" className="spinner">
      <circle cx="12" cy="12" r="8" opacity="0.25" />
      <path d="M20 12a8 8 0 0 0-8-8" strokeLinecap="round" />
    </svg>
  );
}

export function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg {...BASE}>
      <path d="M11 4.9v14.2a.7.7 0 0 1-1.17.52L6.1 16.2H3.6a.9.9 0 0 1-.9-.9v-6.6a.9.9 0 0 1 .9-.9h2.5l3.73-3.42A.7.7 0 0 1 11 4.9Z" />
      {muted ? (
        <path
          d="m15 9.5 5 5m0-5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M14.6 9a4.2 4.2 0 0 1 0 6M17.4 6.6a7.8 7.8 0 0 1 0 10.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function HornIcon() {
  return (
    <svg {...BASE} viewBox="0 0 32 32">
      <path d="M4 13.2h4.6L18 6.7a1 1 0 0 1 1.6.8v17a1 1 0 0 1-1.6.8l-9.4-6.5H4a1.4 1.4 0 0 1-1.4-1.4v-2.8A1.4 1.4 0 0 1 4 13.2Z" />
      <path
        d="M23.4 10.6a8.6 8.6 0 0 1 0 10.8M27.4 7a13.4 13.4 0 0 1 0 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
