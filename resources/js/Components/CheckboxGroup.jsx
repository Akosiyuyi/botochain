import React from "react";
import Checkbox from "@/Components/Checkbox";

export default function CheckboxGroup({
    id,
    name,
    options = [], // [{ id, label, value }]
    value = [],   // array of selected values
    onChange = () => { },
}) {
    const handleChange = (optionValue, checked) => {
        if (checked) {
            onChange([...value, optionValue]);
        } else {
            onChange(value.filter((v) => v !== optionValue));
        }
    };

    return (
        <div id={id} className="mt-1 grid grid-cols-2 gap-2">
            {options.map((option, index) => {
                const inputId = `${name}-${option.id || index}`;
                const isChecked = value.includes(option.value);

                return (
                    <div
                        key={option.id || index}
                        className={`flex items-center ps-4 rounded-lg transition-colors
                          ${isChecked
                                ? "border-2 border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20"
                                : "border border-gray-200 dark:border-gray-700"
                            }`}
                    >
                        <Checkbox
                            id={inputId}
                            name={name}
                            value={option.value}
                            checked={isChecked}
                            onChange={(e) => handleChange(option.value, e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label
                            htmlFor={inputId}
                            className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                            {option.label}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}
