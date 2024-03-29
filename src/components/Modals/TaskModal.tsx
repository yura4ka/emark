import { Button, Modal, Table, Tabs, type TabsRef } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { calculateColor, clampMark, formatDate } from "../../utils";
import { ConfirmModal, IconButton, MyInput, NumberInput } from "../";
import { HiCalendar, HiOutlineTrash } from "react-icons/hi";
import { useModal } from "../../hooks";

export interface Task {
  id: number;
  title: string | null;
  maxScore: number;
  date: Date;
  marks: { id: number; score: number; studentId: number; comment: string | null }[];
  students: { id: number; name: string }[];
}

interface Props {
  isVisible: boolean;
  setVisible: (isVisible: boolean) => void;
  classId: number;
  task?: Task;
}

export function TaskModal({ isVisible, setVisible, classId, task }: Props) {
  const createTask = api.task.create.useMutation();
  const updateTask = api.task.update.useMutation();
  const removeTask = api.task.remove.useMutation();
  const apiUtils = api.useContext();

  const today = formatDate();
  const [name, setName] = useState("");
  const [dateView, setDateView] = useState(today);
  const [date, setDate] = useState(new Date());
  const [maxMark, setMaxMark] = useState(100);

  const { modalProps, setModalData, setModalVisibility } = useModal();
  const [isMaxError, setIsMaxError] = useState(false);

  const [activeTab, setActiveTab] = useState<number>(0);
  const tabsRef = useRef<TabsRef>(null);

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    if (isVisible) document.body.classList.add("locked");
    else document.body.classList.remove("locked");
    return () => setIsBrowser(false);
  }, [isVisible]);

  function initTask(title: string, maxScore: number, dateCreated: Date) {
    setName(title);
    setDate(dateCreated);
    setDateView(formatDate(dateCreated));
    setMaxMark(maxScore);
    setIsMaxError(false);
    tabsRef.current?.setActiveTab(0);
    setActiveTab(0);
  }

  useEffect(() => {
    if (!task) initTask("", 100, new Date());
    else initTask(task.title || "", task.maxScore, task.date);
  }, [task]);

  function discard() {
    initTask("", 100, new Date());
    setVisible(false);
  }

  function invalidate() {
    discard();
    setModalVisibility(false);
    void apiUtils.class.getMarks.invalidate(classId);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const newName = name.trim();
    const data = { date, maxMark, name: newName.length <= 0 ? null : newName };

    if (!task) createTask.mutate({ classId, ...data }, { onSuccess: invalidate });
    else updateTask.mutate({ id: task.id, ...data }, { onSuccess: invalidate });
  }

  function deleteTask() {
    if (!task) return;
    removeTask.mutate(task.id, { onSuccess: invalidate });
  }

  const setMaxScore = (value: number) => {
    setMaxMark(value);
    if (task)
      setIsMaxError(value < task.maxScore && task.marks.some((m) => m.score > value));
  };

  const dataProps = {
    task,
    handleSave,
    onDelete: () =>
      setModalData({
        isVisible: true,
        onAccept: deleteTask,
        text: `видалити завдання ${task?.title || task?.date.toDateString() || ""}`,
      }),
    name,
    setName,
    dateView,
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.valueAsDate || new Date();
      setDateView(formatDate(date));
      setDate(date);
    },
    maxDate: today,
    maxMark,
    setMaxScore,
    isMaxError,
    isLoading: createTask.isLoading || updateTask.isLoading,
    discard,
  };

  return isBrowser ? (
    <Modal
      show={isVisible}
      size={activeTab === 0 ? "2xl" : "5xl"}
      popup={true}
      onClose={() => setVisible(false)}
      className={
        activeTab === 1 ? "[&>div:first-child]:md:h-full [&>div>div]:min-h-full" : ""
      }
    >
      <Modal.Header className={task ? "absolute top-0 right-0" : ""} />
      {task ? (
        <Tabs.Group style="underline" onActiveTabChange={setActiveTab} ref={tabsRef}>
          <Tabs.Item title="Редагувати">
            <TaskData {...dataProps} />
          </Tabs.Item>
          <Tabs.Item title="Оцінки">
            <TaskMarks task={task} />
          </Tabs.Item>
        </Tabs.Group>
      ) : (
        <TaskData {...dataProps} />
      )}
      <ConfirmModal {...modalProps} />
    </Modal>
  ) : (
    <></>
  );
}

interface TaskDataProps {
  task?: Task;
  handleSave: (e: React.FormEvent) => void;
  onDelete: () => void;
  name: string;
  setName: (value: string) => void;
  dateView: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxDate: string;
  maxMark: number;
  setMaxScore: (value: number) => void;
  isMaxError: boolean;
  isLoading: boolean;
  discard: () => void;
}

function TaskData(props: TaskDataProps) {
  return (
    <form onSubmit={props.handleSave}>
      <Modal.Body>
        <div className="flex justify-between">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {props.task ? "Змінити завдання" : "Створити завдання"}
          </h3>
          {props.task && (
            <IconButton
              icon={HiOutlineTrash}
              tooltip="Видалити"
              onClick={props.onDelete}
              className="text-red-600 hover:text-red-700"
            />
          )}
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <MyInput label="Назва" value={props.name} setValue={props.setName} />
          <div>
            <label
              htmlFor="date-input"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Дата створення
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <HiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>

              <input
                type="date"
                value={props.dateView}
                onChange={props.onDateChange}
                max={props.maxDate}
                required={true}
                id="date-input"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              />
            </div>
          </div>
          <NumberInput
            label="Максимальна оцінка"
            value={props.maxMark}
            setValue={props.setMaxScore}
            onBlur={(e) =>
              props.setMaxScore(Math.floor(clampMark(e.target.valueAsNumber, 0, 1000)))
            }
            isError={props.isMaxError}
            errorText="Деякі оцінки перевищують максимальну!"
            min={0}
            max={1000}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="submit"
          disabled={
            props.isLoading || props.isMaxError || !Number.isInteger(props.maxMark)
          }
        >
          {props.task ? "Змінити" : "Зберегти"}
        </Button>
        <Button color="gray" onClick={props.discard} disabled={props.isLoading}>
          Скасувати
        </Button>
      </Modal.Footer>
    </form>
  );
}

function TaskMarks({ task }: { task: Task }) {
  let totalScore = 0,
    scoreCount = 0;
  if (!task) return null;
  return (
    <Modal.Body>
      <h3 className="pb-6 text-xl font-medium text-gray-900 dark:text-white">Оцінки</h3>
      <Table hoverable={true}>
        <Table.Head>
          <Table.HeadCell>ПІБ</Table.HeadCell>
          <Table.HeadCell>Оцінка</Table.HeadCell>
          <Table.HeadCell>Коментар</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {task.marks.map((m, i) => {
            if (m.id === -1) return null;
            totalScore += m.score;
            scoreCount++;
            return (
              <Table.Row
                key={m.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {task.students.at(i)?.name}
                </Table.Cell>
                <Table.Cell className={calculateColor(m.score, task.maxScore)}>
                  {m.score}
                </Table.Cell>
                <Table.Cell>{m.comment}</Table.Cell>
              </Table.Row>
            );
          })}
          {scoreCount !== 0 && (
            <Table.Row className="!border-t-2 border-gray-300">
              <Table.HeadCell>Середня оцінка</Table.HeadCell>
              <Table.HeadCell
                className={calculateColor(totalScore / scoreCount, task.maxScore)}
              >
                {(totalScore / scoreCount).toFixed(3)}
              </Table.HeadCell>
              <Table.HeadCell />
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Modal.Body>
  );
}
