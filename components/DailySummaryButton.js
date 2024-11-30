export default function DailySummaryButton({ onClick }) {
  return (
    <img
      src="/summary.png"
      alt="Daily Summary"
      onClick={onClick}
      className="w-12 h-12 cursor-pointer hover:scale-110 transition-transform"
    />
  );
}