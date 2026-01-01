import { useRef } from "react";

export default function OTPInput({ length = 4, onComplete }) {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    e.target.value = value;

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    collectCode();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!paste) return;

    // distribute pasted digits into inputs
    paste.split("").forEach((char, i) => {
      if (i < length) {
        inputsRef.current[i].value = char;
      }
    });

    collectCode();
  };

  const collectCode = () => {
    const code = inputsRef.current.map((input) => input.value).join("");
    if (code.length === length && onComplete) {
      onComplete(code);
    }
  };

  return (
    <div className="flex gap-x-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="tel"
          maxLength="1"
          className="block w-10 text-center border-gray-300 rounded-md focus:border-green-600 focus:ring-green-600"
          ref={(el) => (inputsRef.current[i] = el)}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
