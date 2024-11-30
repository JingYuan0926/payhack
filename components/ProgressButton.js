export default function ProgressButton({ onClick }) {
  return (
    <img
      src="/progress.png"
      alt="Progress"
      onClick={onClick}
      className="w-12 h-12 cursor-pointer hover:scale-110 transition-transform"
    />
  );
}