const ProgressButton = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="hover:scale-110 transition-transform"
    >
      <img
        src="/progress.png"
        alt="Progress"
        className="w-12 h-12"
      />
    </div>
  );
};

export default ProgressButton;