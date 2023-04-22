import { Spinner } from "flowbite-react";
import { useCallback, useMemo, useRef } from "react";
import { useOnScreen } from "../../hooks";
import { api } from "../../utils/api";
import { calculateColor } from "../../utils";

interface Props {
  classId: number;
  title: string;
}

export function StudentClass({ classId, title }: Props) {
  const { data: marks } = api.student.getMarks.useQuery(classId, {
    refetchOnWindowFocus: false,
  });
  const markAsRead = api.task.markAsRead.useMutation();

  const marksRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const marksMap = useMemo(() => new Map(marks?.map((m) => [m.id, m.isNew])), [marks]);

  const setRead = useCallback(
    (id: number) => {
      if (marksMap.get(id))
        markAsRead.mutate(id, { onSuccess: () => marksMap.set(id, false) });
    },
    [markAsRead, marksMap]
  );

  useOnScreen(marksRef, setRead);

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
            ref={(node) => {
              if (node) marksRef.current.set(m.id, node);
              else marksRef.current.delete(m.id);
            }}
            itemID={m.id.toString()}
            className="relative my-4 rounded-lg border hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
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
              <div className="border-t py-2 px-5 text-gray-700 dark:border-gray-700 dark:text-gray-400">
                {m.comment}
              </div>
            )}
            {m.isNew && (
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
