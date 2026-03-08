
import { getReviewFailureMessage } from "@/lib/display";

interface ReviewErrorStateProps {
  errorMessage?: string | null;
  isActionPending: boolean;
  onRetry: () => void;
}

export function ReviewErrorState({
  errorMessage,
  isActionPending,
  onRetry,
}: ReviewErrorStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5">
      <p className="text-sm font-semibold text-rose-900">
        This review needs another try
      </p>
      <p className="mt-2 text-sm leading-7 text-rose-700">
        {getReviewFailureMessage(errorMessage)}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isActionPending}
        className="mt-5 inline-flex rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isActionPending ? "Retrying..." : "Retry review"}
      </button>
    </div>
  );
}
