const Loader = ({ label = "Loading" }) => {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__dot" />
      <span className="loader__text">{label}</span>
    </div>
  );
};

export default Loader;
