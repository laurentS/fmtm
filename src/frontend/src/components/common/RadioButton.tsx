import React from 'react';

interface IRadioButton {
  name: string;
  value: string;
  label: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface RadioButtonProps {
  topic?: string;
  options: IRadioButton[];
  direction: 'row' | 'column';
  onChangeData: (value: string) => void;
  value: string;
  errorMsg?: string;
  className?: string;
  required?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  topic,
  options,
  direction,
  onChangeData,
  value,
  errorMsg,
  className,
  required,
}) => (
  <div>
    {topic && (
      <div>
        <p className="fmtm-text-base fmtm-font-[600] fmtm-mb-2">
          {topic} {required && <span className="fmtm-text-primaryRed">*</span>}
        </p>
      </div>
    )}
    <div className={`fmtm-flex ${direction === 'column' ? 'fmtm-flex-col' : 'fmtm-flex-wrap fmtm-gap-x-16'}`}>
      {options.map((option) => {
        return (
          <div
            key={option.value}
            className={`fmtm-gap-2 fmtm-flex fmtm-items-center ${
              option?.disabled === true ? 'fmtm-cursor-not-allowed' : ''
            }`}
          >
            <input
              type="radio"
              id={option.value}
              name={option.name}
              value={option.value}
              className={`fmtm-accent-primaryRed fmtm-cursor-pointer ${
                option?.disabled === true ? 'fmtm-cursor-not-allowed' : ''
              }`}
              onChange={(e) => {
                onChangeData(e.target.value);
              }}
              checked={option.value === value}
              disabled={option?.disabled === true}
            />
            <label
              htmlFor={option.value}
              className={`fmtm-text-base fmtm-bg-white fmtm-text-gray-500 fmtm-mb-[2px] fmtm-cursor-pointer fmtm-flex fmtm-items-center fmtm-gap-2  ${className}`}
            >
              <p className={`${option?.disabled === true ? 'fmtm-cursor-not-allowed' : ''}`}>{option.label}</p>
              <div>{option.icon && option.icon}</div>
            </label>
          </div>
        );
      })}
      {errorMsg && <p className="fmtm-form-error fmtm-text-red-600 fmtm-text-sm fmtm-py-1">{errorMsg}</p>}
    </div>
  </div>
);

export default RadioButton;
