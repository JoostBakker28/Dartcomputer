type MatchBannerProps = {
  message: string;
  actionLabel: string;
  onAction: () => void;
};

/** The green bar that closes a leg, a set or the match. */
export default function MatchBanner({
  message,
  actionLabel,
  onAction,
}: MatchBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500 bg-emerald-500/10 px-5 py-4">
      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
        {message}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
      >
        {actionLabel}
      </button>
    </div>
  );
}
