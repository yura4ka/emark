import { Spinner } from "flowbite-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

  function calculateAverage(marks: { score: number; id: number }[], maxScore: number) {
    let total = 0,
      count = 0;
    for (const m of marks) {
      if (m.id !== -1) {
        total += (m.score / maxScore) * 100;
        count++;
      }
    }
    return count === 0 ? null : (total / count).toFixed(3);
  }

  const averageTaskMarks = useMemo(() => {
    if (!data) return [];
    const result = [];
    for (const t of data.tasks) {
      const avg = calculateAverage(t.marks, t.maxScore);
      if (avg !== null)
        result.push({ avg, name: t.title || t.date.toLocaleDateString() });
    }
    return result;
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

  const generateExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);
    const row: (undefined | string | number)[] = [""];
    const comments: [string | null, string, number][] = [];
    data.tasks.forEach((task, i) => {
      row[i + 1] = task.title || task.date.toLocaleDateString();
      comments.push([task.title, task.date.toLocaleDateString(), task.maxScore]);
    });
    let sheetRow = sheet.addRow(row);
    sheetRow.eachCell((cell, i) => {
      if (i !== 1)
        cell.note = {
          texts: [
            { text: `Завдання: ${comments[i - 1]?.[0] || comments[i - 1]?.[1] || ""}\n` },
            { text: `Дата: ${comments[i - 1]?.[1] || ""}\n` },
            { text: `Максимальний бал: ${comments[i - 1]?.[2] || ""}\n` },
          ],
        };
    });
    sheetRow.alignment = { textRotation: -90, horizontal: "center", vertical: "top" };
    sheetRow.height = 58;
    sheetRow.commit();

    data.students.forEach((s, i) => {
      const comments: (string | null)[] = [];
      const row: (string | number | undefined)[] = [s.name];
      data.tasks.forEach((t) => {
        const mark = t.marks.at(i);
        row.push(mark?.id === -1 ? "" : mark?.score);
        comments.push(mark?.comment || null);
      });
      sheetRow = sheet.addRow(row);
      sheetRow.alignment = { horizontal: "center", vertical: "middle" };
      sheetRow.height = 23.25;
      sheetRow.eachCell((cell, i) => {
        if (i !== 1 && comments[i]) cell.note = comments[i] || "";
      });
      sheetRow.commit();
    });

    sheet.getColumn(1).width = 31;
    sheet.getColumn(1).alignment = { horizontal: "left", vertical: "middle" };
    console.log(sheet.columns.length);
    for (let i = 2; i < sheet.columns.length + 1; i++) {
      sheet.getColumn(i).width = 5.5;
    }

    workbook.xlsx
      .writeBuffer()
      .then((buffer) => saveAs(new Blob([buffer]), `${title}_export.xlsx`))
      .catch((error) => console.log(error));
  };

  const Marks = () => (
    <main className="scrollbar overflow-x-auto dark:text-gray-300">
      <div className="sticky top-0 left-0 z-[1] border-b dark:border-gray-700">
        <div className="px-4 py-2 text-3xl font-bold">
          <span className="cursor-pointer hover:text-gray-600 hover:underline dark:text-white">
            {title}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700">
          <div className="flex">
            <IconButton
              icon={HiOutlineDownload}
              tooltip="Експортувати в Excel"
              onClick={generateExcel}
            />
            <IconButton icon={HiOutlineUpload} tooltip="Імпортувати з Excel" />
            <div className="mx-2 w-[1px] border-l border-gray-300 dark:border-gray-500" />
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
                <div className="mx-2 w-[1px] border-l border-gray-300 dark:border-gray-500" />
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

      <table
        className="table-hoverable border text-lg dark:border-gray-700"
        ref={createButton}
      >
        <tbody>
          <tr className="text-left">
            <td className="split-cell border-r font-semibold dark:border-gray-700" />
            {data.tasks.map((t) => (
              <td
                key={t.id}
                onClick={() => showEditTask(t)}
                className="vertical-text max-h-40 overflow-hidden text-ellipsis whitespace-nowrap border-r px-1 py-2 tracking-tight hover:cursor-pointer dark:border-gray-700"
              >
                {t.title || t.date.toLocaleDateString()}
              </td>
            ))}
            <td
              role="button"
              rowSpan={0}
              className={`${
                !isOverflowing ? "w-full border-l border-b" : "vertical-text"
              } table-create max-w-xl border-r px-1 py-2 tracking-tight text-gray-400 hover:bg-gray-50 hover:text-gray-500 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200`}
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
              <td className="min-w-max whitespace-nowrap border-y p-1 px-2 dark:border-gray-700">
                {s.name}
              </td>
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
    </main>
  );

  return (
    <>
      <Marks />
      <ResponsiveContainer width="100%" height={300} className="my-10">
        <ScatterChart
          width={500}
          height={300}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} name="Завдання" angle={-30} />
          <YAxis name="Оцінка" dataKey="avg" />
          <ZAxis type="number" range={[100]} />
          <Tooltip />
          <Scatter data={averageTaskMarks} fill="#8884d8" line={true} />
        </ScatterChart>
      </ResponsiveContainer>
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
    </>
  );
}
export default TeacherClass;
