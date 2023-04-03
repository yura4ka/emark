import { Button, Label, Modal, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { clampMark } from "../../utils/utils";
import MyInput from "../Inputs/MyInput";
import { HiOutlineTrash } from "react-icons/hi";
import IconButton from "../Buttons/IconButton";
import { useModal } from "../../hooks/useModal";
import ConfirmModal from "./ConfirmModal";
import NumberInput from "../Inputs/NumberInput";

export interface Mark {
  id: number;
  studentId: number;
  score: number;
  comment: string | null;
  taskId: number;
}

export interface MarkData {
  mark: Mark;
  task: { id: number; title: string | null; maxScore: number; date: Date };
  studentName: string;
  index: [number, number];
  classId: number;
}

interface Props {
  isVisible: boolean;
  setVisible: (isVisible: boolean) => void;
  data?: MarkData;
}

function TaskModal({ isVisible, setVisible, data }: Props) {
  const upsertMark = api.task.upsertMark.useMutation();
  const removeMark = api.task.removeMark.useMutation();
  const apiUtils = api.useContext();

  const isNew = data?.mark.id === -1;

  const [value, setValue] = useState(isNew ? 0 : data?.mark.score || 0);
  const [comment, setComment] = useState(data?.mark.comment || "");

  const { modalProps, setModalData, setModalVisibility } = useModal();

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  useEffect(() => {
    setValue(data?.mark.id === -1 ? 0 : data?.mark.score || 0);
    setComment(data?.mark.comment || "");
  }, [data]);

  function discard() {
    setValue(0);
    setComment("");
    setVisible(false);
  }

  function invalidate() {
    discard();
    setModalVisibility(false);
    void apiUtils.class.getMarks.invalidate(data?.classId);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    let mark = value;
    if (isNaN(mark)) mark = 0;
    mark = clampMark(mark, 0, data.task.maxScore, false);

    const commentTrim = comment.trim();

    upsertMark.mutate(
      {
        id: isNew ? undefined : data.mark.id,
        taskId: data.task.id,
        studentId: data.mark.studentId,
        mark,
        comment: commentTrim === "" ? null : commentTrim,
      },
      {
        onSuccess: invalidate,
      }
    );
  };

  function deleteMark() {
    if (isNew || !data) return;
    removeMark.mutate(data.mark.id, { onSuccess: invalidate });
  }

  return data && isBrowser ? (
    <Modal show={isVisible} size="2xl" popup={true} onClose={() => setVisible(false)}>
      <Modal.Header />
      <form onSubmit={handleSave}>
        <Modal.Body>
          <div className="flex justify-between">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Редагувати оцінку
            </h3>
            {!isNew && (
              <IconButton
                icon={HiOutlineTrash}
                tooltip="Видалити"
                onClick={() =>
                  setModalData({
                    isVisible: true,
                    onAccept: deleteMark,
                    text: "видалити оцінку",
                  })
                }
                className="text-red-600 hover:text-red-700"
              />
            )}
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <MyInput
              label="Завдання"
              value={data.task.title || data.task.date.toLocaleDateString()}
              readonly={true}
              setValue={() => console.error()}
            />
            <MyInput
              label="Студент"
              value={data.studentName}
              readonly={true}
              setValue={() => console.error()}
            />
            <NumberInput
              label="Оцінка"
              value={value}
              setValue={setValue}
              onBlur={(e) => {
                const newValue = e.target.valueAsNumber;
                if (isNaN(newValue)) setValue(0);
                setValue(clampMark(newValue, 0, data.task.maxScore, false));
              }}
              min={0}
              max={data.task.maxScore}
            />
            <div id="textarea">
              <div className="mb-2 block">
                <Label htmlFor="comment" value="Коментар:" />
              </div>
              <Textarea
                id="comment"
                placeholder="Коментар"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" disabled={upsertMark.isLoading || removeMark.isLoading}>
            Зберегти
          </Button>
          <Button
            color="gray"
            onClick={() => discard()}
            disabled={upsertMark.isLoading || removeMark.isLoading}
          >
            Скасувати
          </Button>
        </Modal.Footer>
      </form>
      <ConfirmModal {...modalProps} />
    </Modal>
  ) : (
    <></>
  );
}

export default TaskModal;
