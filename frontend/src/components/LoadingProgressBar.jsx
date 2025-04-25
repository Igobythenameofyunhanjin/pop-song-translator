// ✅ src/components/LoadingProgressBar.jsx
const LoadingProgressBar = ({ progress }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[9999]">
        <div className="w-[80%] max-w-md text-center">
          <div className="text-white mb-2 font-semibold">
            Translating... {progress}%
          </div>
          <div className="w-full h-3 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-orange-400 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };
  
  export default LoadingProgressBar;
  