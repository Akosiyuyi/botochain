export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-green-700 hover:bg-green-900 focus:bg-green-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 active:bg-green-900 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
