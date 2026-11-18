export default function LoadingSpinner({ label }) {
    return (
        <div className="flex items-center justify-center w-full max-w-6xl mx-auto p-10 gap-5">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-700 border-opacity-50"></div>
            <div>{label}</div>
        </div>
    );
}