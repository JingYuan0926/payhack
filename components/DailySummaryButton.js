const DailySummaryButton = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="hover:scale-110 transition-transform"
    >
      <img
        src="/daily.png"
        alt="Daily Summary"
        className="w-12 h-16"
      />
    </div>
  );
};

export default DailySummaryButton;