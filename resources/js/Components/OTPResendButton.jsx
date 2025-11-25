import { useState, useEffect } from "react";

export default function OTPResendButton({ duration = 120, onResend, className = '', }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleResend = () => {
        if (!canResend) return;
        if (onResend) onResend();

        // reset countdown after resend
        setTimeLeft(duration);
        setCanResend(false);
    };

    return (
        <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`${canResend ? "text-green-600 hover:text-green-800" : "text-gray-400 cursor-not-allowed"
                } ${className}`}

        >
            {canResend ? "Resend" : `Resend (${timeLeft})`}
        </button>
    );
}
