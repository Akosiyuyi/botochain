import { useState, useEffect } from "react";

export default function OTPResendButton({ expiresAt, onResend, className = '' }) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const now = Math.floor(Date.now() / 1000);
        return Math.max(expiresAt - now, 0);
    });
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        // if already expired, enable resend immediately
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]); // 👈 re-run whenever timeLeft resets

    const handleResend = async () => {
        if (!canResend) return;

        if (onResend) {
            try {
                // backend should return a new expiry timestamp
                const newExpiresAt = await onResend();
                const now = Math.floor(Date.now() / 1000);
                setTimeLeft(Math.max(newExpiresAt - now, 0));
                setCanResend(false);
            } catch (err) {
                console.error("Failed to resend OTP:", err);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`${canResend ? "text-green-600 hover:text-green-800" : "text-gray-400 cursor-not-allowed"} ${className}`}
        >
            {canResend ? "Resend" : `Resend (${timeLeft})`}
        </button>
    );
}
