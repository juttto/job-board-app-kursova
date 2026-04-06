export function Container({ children, className = "" }) {
    return (
        <div className={`container mx-auto px-4 max-w-6xl ${className}`}>
            {children}
        </div>
    );
}
