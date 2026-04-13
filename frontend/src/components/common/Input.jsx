const Input = ({
  label,
  error,
  helper,
  className = "",
  ...props
}) => {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      <input className="field__control" {...props} />
      {error ? <span className="field__message field__message--error">{error}</span> : null}
      {!error && helper ? <span className="field__message">{helper}</span> : null}
    </label>
  );
};

export default Input;
