// ✅ LoadingSpinner.jsx
const LoadingSpinner = () => {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-[9999]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-400 border-opacity-70"></div>
      </div>
    );
  };
  
  export default LoadingSpinner; // ✅ add this line
  