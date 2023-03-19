import { Spinner } from "flowbite-react";
import { api } from "../../utils/api";

interface Props {
  classId: number;
  title: string;
}

function calculateColor(score: number, maxScore: number) {
  const ratio = score / maxScore;
  if (ratio <= 0.3) return "text-red-500";
  if (ratio < 0.7) return "text-yellow-500";
  return "text-green-500";
}

function StudentClass({ classId, title }: Props) {
  const { data: marks } = api.student.getMarks.useQuery(classId);

  if (!marks)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-7xl p-2.5">
      <h1 className="py-6 text-3xl font-bold">{title}</h1>
      <div>
        {marks.map((m) => (
          <div
            key={m.id}
            className="my-4 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex w-full items-center justify-between py-4 px-5 text-left font-medium">
              <div className="text-lg">
                {m.task.title || m.task.date.toLocaleDateString()}
              </div>
              <div className="flex flex-col items-end justify-between">
                <p className={calculateColor(m.score, m.task.maxScore) + " text-lg"}>
                  {m.score}/{m.task.maxScore}
                </p>
                <p className="text-xs text-gray-500">
                  Оцінено {m.dateCreated.toLocaleString()}
                </p>
              </div>
            </div>
            {m.comment && (
              <div className="border-t py-2 px-5 text-gray-700 dark:text-gray-400">
                {m.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentClass;
