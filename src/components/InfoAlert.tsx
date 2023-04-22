export const InfoAlert = ({
  text,
  additional,
}: {
  text: string;
  additional?: string;
}) => {
  return (
    <div
      className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-gray-800 dark:text-blue-400"
      role="alert"
    >
      <span className="font-medium">{text}</span>
      {additional && " " + additional}
    </div>
  );
};
