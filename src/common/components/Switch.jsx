function Switch({ isChecked, onChange }) {
  return (
    <div class="form-switch form-check">
      <input class="form-check-input" type="checkbox" id="toggle-switch" onChange={onChange} checked={isChecked} />
      <label for="toggle-switch"></label>
    </div>
  );
}

export default Switch;
