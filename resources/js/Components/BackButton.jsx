export default function BackButton({
    className = '',
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={`flex items-center text-sm text-gray-600 hover:text-green-700 ${className}`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-1"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {children}
        </button >
    );
}
