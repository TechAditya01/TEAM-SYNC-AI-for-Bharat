import React from 'react';

const OTPInput = ({ length = 6, onComplete }) => {
  const [value, setValue] = React.useState('');

  const handleChange = (event) => {
    const next = event.target.value.replace(/\D/g, '').slice(0, length);
    setValue(next);
    if (next.length === length && onComplete) {
      onComplete(next);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder={Array.from({ length }).map(() => '•').join('')}
      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-center tracking-[0.35em] text-slate-900 dark:text-white"
    />
  );
};

export default OTPInput;
