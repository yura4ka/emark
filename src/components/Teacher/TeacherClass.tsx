import { Spinner } from "flowbite-react";
import { useLayoutEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import TaskModal, { type Task } from "../Modals/TaskModal";
import { HiPlus } from "react-icons/hi";
import MarkCell from "./MarkCell";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import {
  HiOutlineAnnotation,
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineUsers,
} from "react-icons/hi";
import IconButton from "../Buttons/IconButton";
import MarkModal, { type MarkData } from "../Modals/MarkModal";
import SubGroupModal from "../Modals/SubGroupModal";

interface Props {
  classId: number;
  title: string;
  info: {
    subGroup: {
      isFull: boolean;
      id: number;
      name: string;
    };
    group: { id: number; name: string };
  };
}

function TeacherClass({ classId, title, info }: Props) {
  const { data } = api.class.getMarks.useQuery(classId);
  const { data: students } = api.group.getStudents.useQuery(info.group.id);
  const apiUtils = api.useContext();

  const [isTaskEditing, setIsTaskEditing] = useState(false);
  const [editTask, setEditTask] = useState<Task>();
  const [isMarkEditing, setIsMarkEditing] = useState(false);
  const [editMark, setEditMark] = useState<MarkData>();
  const [isSubGroupEditing, setIsSubGroupEditing] = useState(false);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const createButton = useRef<HTMLTableElement>(null);

  useLayoutEffect(() => {
    if (!createButton.current) return;
    setIsOverflowing(createButton.current.offsetWidth > createButton.current.scrollWidth);
  }, [data]);

  if (!data)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  function showEditTask(task?: Omit<Task, "students">) {
    setIsTaskEditing(true);
    if (task) setEditTask({ ...task, students: data?.students || [] });
    else setEditTask(undefined);
  }

  return (
    <main>
      <div className="border-b">
        <div className="px-4 py-2 text-3xl font-bold">
          <span className="cursor-pointer hover:text-gray-600 hover:underline">
            {title}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700">
          <div className="flex">
            <IconButton icon={HiOutlineDownload} tooltip="Експортувати в Excel" />
            <IconButton icon={HiOutlineUpload} tooltip="Імпортувати з Excel" />
            <div className="mx-2 w-[1px] border-l border-gray-300" />
            <IconButton
              icon={HiOutlineDocumentPlus}
              tooltip="Додати завдання"
              onClick={() => showEditTask()}
            />
            <IconButton
              icon={HiOutlineAnnotation}
              tooltip="Коментувати"
              onClick={() => setIsMarkEditing(!!editMark)}
            />
            {!info.subGroup.isFull && (
              <>
                <div className="mx-2 w-[1px] border-l border-gray-300" />
                <IconButton
                  icon={HiOutlineUsers}
                  tooltip="Редагувати підгрупу"
                  onClick={() => setIsSubGroupEditing(true)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <table className="table-hoverable border text-lg" ref={createButton}>
        <tbody>
          <tr className="text-left">
            <td className="split-cell border-r font-semibold" />
            {data.tasks.map((t) => (
              <td
                key={t.id}
                onClick={() => showEditTask(t)}
                className="vertical-text max-h-40 overflow-hidden text-ellipsis whitespace-nowrap border-r px-1 py-2 tracking-tight hover:cursor-pointer"
              >
                {t.title || t.date.toLocaleDateString()}
              </td>
            ))}
            <td
              role="button"
              rowSpan={0}
              className={`${
                !isOverflowing ? "w-full border-l border-b" : "vertical-text"
              } table-create max-w-xl border-r px-1 py-2 tracking-tight text-gray-400 hover:bg-gray-50 hover:text-gray-500`}
              onClick={() => showEditTask()}
            >
              <p className="flex items-center justify-center gap-2">
                <HiPlus />
                Створити
              </p>
            </td>
          </tr>

          {data.students.map((s, i) => (
            <tr key={s.id}>
              <td className="min-w-max whitespace-nowrap border-y p-1 px-2">{s.name}</td>
              {data.tasks.map((t, j) => (
                <MarkCell
                  key={t.id}
                  index={[i, j]}
                  classId={classId}
                  mark={t.marks[i]}
                  maxScore={t.maxScore}
                  onFocus={() => {
                    const mark = t.marks[i];
                    if (mark === undefined) throw new Error();

                    setEditMark({
                      mark,
                      classId,
                      index: [i, j],
                      studentName: s.name,
                      task: t,
                    });
                  }}
                  setCommentVisible={setIsMarkEditing}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <TaskModal
        classId={classId}
        isVisible={isTaskEditing}
        setVisible={setIsTaskEditing}
        task={editTask}
      />
      <MarkModal
        isVisible={isMarkEditing}
        setVisible={setIsMarkEditing}
        data={editMark}
      />
      {!info.subGroup.isFull && (
        <SubGroupModal
          isCreating={false}
          group={students?.students || []}
          subGroupStudents={data.students}
          subGroup={info.subGroup}
          groupId={info.group.id}
          isVisible={isSubGroupEditing}
          setVisible={setIsSubGroupEditing}
          onUpdate={() => void apiUtils.class.getMarks.invalidate(classId)}
        />
      )}
    </main>
  );
}
export default TeacherClass;
