const SelectField = ({ id, label, initialValue, options, onChange, isDownload }) => {


  return (
    <div className="user-input-group">
      <label htmlFor={id} className="bold-text">
        {label}
      </label>
      <select
        id={id}
        className="select-input"
        value={initialValue}
        onChange={onChange}
      >
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
      </select>
    </div>
  );
};

export default SelectField;
