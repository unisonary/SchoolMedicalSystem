import React from "react";

const Label = ({ children, htmlFor, className = "" }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
};

export { Label };
