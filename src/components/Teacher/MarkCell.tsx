import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { clampMark } from "../../utils/utils";

interface Props {
  classId: number;
  index: [number, number];
  mark:
    | {
        id: number;
        studentId: number;
        score: number;
        comment: string | null;
        taskId: number;
      }
    | undefined;
  maxScore: number;
  onFocus: () => void;
  setCommentVisible: (value: boolean) => void;
}

function MarkCell({ index, classId, mark, maxScore, onFocus, setCommentVisible }: Props) {
  const upsertMark = api.task.upsertMark.useMutation();
  const removeMark = api.task.removeMark.useMutation();
  const apiUtils = api.useContext();
  const [value, setValue] = useState(mark?.id === -1 ? "" : mark?.score || 0);

  useEffect(() => setValue(mark?.id === -1 ? "" : mark?.score || 0), [mark]);

  if (!mark) return <></>;

  const handleSave = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if ((mark.id === -1 && value === "") || (mark.id !== -1 && +value === mark.score))
      return;

    if (value.length === 0) {
      removeMark.mutate(mark.id, {
        onSuccess: () =>
          apiUtils.class.getMarks.setData(classId, (old) => {
            if (!old) return old;
            const mark = old.tasks[index[1]]?.marks[index[0]];
            if (!mark) return old;
            mark.id = -1;
            mark.score = 0;
            mark.comment = null;
            return { ...old };
          }),
      });
      return;
    }

    let numberValue = Number(value);
    if (isNaN(numberValue) || numberValue < 0 || !Number.isInteger(numberValue)) {
      setValue(mark.id === -1 ? "" : mark.score);
      return;
    }

    numberValue = clampMark(numberValue, 0, maxScore, false);
    setValue(numberValue);

    upsertMark.mutate(
      {
        id: mark.id === -1 ? undefined : mark.id,
        taskId: mark.taskId,
        studentId: mark.studentId,
        mark: numberValue,
      },
      {
        onSuccess: (data) =>
          apiUtils.class.getMarks.setData(classId, (old) => {
            if (!old) return old;
            const mark = old.tasks[index[1]]?.marks[index[0]];
            if (!mark) return old;
            mark.id = data;
            mark.score = numberValue;
            return { ...old };
          }),
      }
    );
  };

  return (
    <td className="border dark:border-gray-700">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => {
          e.currentTarget.select();
          onFocus();
        }}
        onDoubleClick={() => setCommentVisible(true)}
        onBlur={handleSave}
        max={maxScore}
        className="h-9 w-9 border-0 bg-transparent p-0 text-center text-lg hover:cursor-pointer focus:ring-0 focus:hover:cursor-auto"
      />
      {mark.comment !== null && (
        <span className="absolute top-0 right-0 h-1 w-1 rounded-sm bg-green-500" />
      )}
    </td>
  );
}

export default MarkCell;
