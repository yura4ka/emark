import { useState } from "react";
import { HiOutlineCloudUpload } from "react-icons/hi";

interface Props {
  accept?: string;
  fileInfo?: string;
  onFileUpload: (file: File) => void;
  rounded?: boolean;
}

export function FileInput({ accept, fileInfo, onFileUpload, rounded }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!accept?.split(",").includes(file.type)) setIsError(true);
    else onFileUpload(file);
  };

  const [isError, setIsError] = useState(false);

  return (
    <div className="flex w-full items-center justify-center">
      <label
        className={`${
          rounded !== false
            ? "rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            : ""
        } dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <HiOutlineCloudUpload
            className={`mb-3 h-10 w-10 ${isError ? "text-red-500" : "text-gray-400"}`}
          />
          <p
            className={`mb-2 text-sm ${
              isError
                ? "font-bold text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span className="font-semibold">Натисніть, щоб завантажити</span> або
            перетягніть файл сюди
          </p>
          <p
            className={`text-xs ${
              isError
                ? "font-bold text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {isError ? "Невірний формат!" : fileInfo}
          </p>
        </div>
        <input type="file" className="hidden" accept={accept} onChange={handleChange} />
      </label>
    </div>
  );
}
