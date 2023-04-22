import { Button, Modal, Spinner, Tooltip } from "flowbite-react";
import { useEffect, useState } from "react";
import { FileInput } from "../";
import ExcelJS from "exceljs";
import { api } from "../../utils/api";

type Task = {
  title: string | null;
  maxScore: number;
  date: Date;
  marks: { score: number | null; comment: string | null; error?: boolean }[];
};

function getTask(cell: ExcelJS.Cell, studentCount: number) {
  const notes = ((cell.note as ExcelJS.Comment)?.texts?.at(0)?.text || "")
    .split("\n")
    .map((n) => n.slice(n.lastIndexOf(":") + 1).trim());

  const text = cell.text.trim();
  const dateNumber = new Date(notes[1] || "");
  const date = isNaN(dateNumber.getTime()) ? new Date() : dateNumber;
  const title = text === notes[1] && !isNaN(dateNumber.getTime()) ? null : text;
  const maxScore = parseInt(notes[2] || "100") || 100;

  const marks = new Array(studentCount)
    .fill(null)
    .map(() => ({ score: null, comment: null }));

  return { title, date, maxScore, marks };
}

async function generateMarks(file: File, groupStudents: { id: number; name: string }[]) {
  const tasks: Task[] = [];
  const errors: string[] = [];

  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    errors.push("Не вдалося відкрити документ!");
    return { students: groupStudents, tasks, errors };
  }

  const studentMap = new Map(groupStudents.map((s) => [s.name, s.id]));
  const students = sheet
    .getColumn(1)
    .values.slice(2)
    .map((s) => ({
      name: s?.toString() || "",
      isError: false,
      id: studentMap.get(s?.toString() || "") || -1,
    }));

  if (students.length > groupStudents.length)
    errors.push("Не вірна кількість студентів!");
  else if (students.length === 0) errors.push("Не вдалося знайти студентів!");

  sheet.getRow(1).eachCell((cell, i) => {
    if (i !== 1) tasks.push(getTask(cell, students.length));
  });

  for (let i = 2; i <= students.length + 1; i++) {
    const s = students.at(i - 2);
    if (s && s.id === -1) {
      s.isError = true;
      errors.push(`Студента з ім'ям ${s.name} не існує`);
    }
    const row = sheet.getRow(i);
    for (let j = 2; j <= tasks.length + 1; j++) {
      const cell = row.getCell(j);
      const scoreParsed = parseInt(cell.text.trim());
      const score = isNaN(scoreParsed) ? null : scoreParsed;
      const isError = (score || 0) > (tasks[j - 2]?.maxScore || 0);
      const comment = (cell.note as ExcelJS.Comment)?.texts?.at(0)?.text;
      if (tasks[j - 2]?.marks[i - 2] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tasks[j - 2]!.marks[i - 2] = {
          score,
          comment: comment ? comment : null,
          error: isError,
        };
      }
      if (isError) {
        errors.push(
          `Бал завдання "${
            tasks[j - 2]?.title || tasks[j - 2]?.date.toLocaleDateString() || ""
          }" студента ${groupStudents[i - 2]?.name || ""} (${
            score || 0
          }) перевищує максимальний бал завдання (${tasks[j - 2]?.maxScore || 0})!`
        );
      }
    }
  }

  return { students, tasks, errors };
}

interface Props {
  students: { id: number; name: string }[];
  isVisible: boolean;
  setVisible: (value: boolean) => void;
  classId: number;
}

export function ImportMarksModal({ isVisible, setVisible, students, classId }: Props) {
  const loadTable = api.class.loadData.useMutation();
  const apiUtils = api.useContext();

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    document.body.classList.toggle("locked", isVisible);
    return () => setIsBrowser(false);
  }, [isVisible]);

  const [file, setFile] = useState<File>();
  const isUploaded = file !== undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    students: { name: string; isError?: boolean; id: number }[];
    tasks: Task[];
    errors: string[];
  }>({
    students: [],
    tasks: [],
    errors: [],
  });

  const discard = () => {
    setVisible(false);
    setFile(undefined);
    setIsLoading(true);
    setData({
      students: [],
      tasks: [],
      errors: [],
    });
  };

  useEffect(() => {
    if (file)
      generateMarks(file, students)
        .then(setData)
        .catch(console.error)
        .finally(() => setIsLoading(false));
  }, [file, students]);

  const submitData = () => {
    loadTable.mutate(
      { id: classId, ...data },
      {
        onSettled: () => void apiUtils.class.getMarks.invalidate(classId),
        onSuccess: discard,
      }
    );
  };

  return isBrowser ? (
    <Modal
      show={isVisible}
      size={isLoading ? "xl" : "7xl"}
      onClose={discard}
      className={!isLoading ? "[&>div:first-child]:md:h-full" : ""}
    >
      <Modal.Header>Імпортувати з Excel</Modal.Header>
      <Modal.Body className={`${!isLoading ? "overflow-auto " : ""}!p-0`}>
        {loadTable.isError && (
          <p className="p-4 text-lg font-bold text-red-600 dark:text-red-500">
            При виконанні операції сталася невідома помилка!
          </p>
        )}
        {!isUploaded ? (
          <FileInput
            onFileUpload={setFile}
            fileInfo="Excel file"
            rounded={false}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        ) : isLoading || loadTable.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size={"xl"} />
          </div>
        ) : (
          <>
            <table className="table-hoverable border text-lg dark:border-gray-700">
              <tbody>
                <tr className="text-left">
                  <td className="split-cell border-r font-semibold dark:border-gray-700" />
                  {data.tasks.map((t, i) => (
                    <td
                      key={i}
                      className="cell-tooltip tooltip-min-w-12 max-h-40 border-r px-1 py-2 tracking-tight hover:cursor-pointer dark:border-gray-700"
                    >
                      <Tooltip
                        animation="duration-1000"
                        content={
                          <>
                            <p>Завдання: {t.title || t.date.toLocaleDateString()}</p>
                            <p>Дата: {t.date.toLocaleDateString()}</p>
                            <p>Максимальний бал: {t.maxScore}</p>
                          </>
                        }
                      >
                        <p className="vertical-text overflow-hidden whitespace-nowrap">
                          {t.title || t.date.toLocaleDateString()}
                        </p>
                      </Tooltip>
                    </td>
                  ))}
                </tr>

                {data.students.map((s, i) => (
                  <tr key={i}>
                    <td
                      className={`${
                        s.isError ? "bg-red-200" : ""
                      } min-w-max whitespace-nowrap border-y p-1 px-2 dark:border-gray-700`}
                    >
                      {s.name}
                    </td>
                    {data.tasks.map((t, j) => (
                      <td
                        key={j}
                        className={`${
                          t.marks[i]?.comment === null
                            ? "text-center"
                            : "cell-tooltip tooltip-min-w-20"
                        } ${
                          t.marks[i]?.error ? "bg-red-200 " : ""
                        }h-9 w-9 border text-lg dark:border-gray-700`}
                      >
                        {t.marks[i]?.comment === null ? (
                          t.marks[i]?.score
                        ) : (
                          <Tooltip
                            animation="duration-1000"
                            content={
                              <>
                                <p>
                                  Оцінка: {t.marks[i]?.score || 0} / {t.maxScore}
                                </p>
                                <p>Коментар: {t.marks[i]?.comment}</p>
                              </>
                            }
                          >
                            {t.marks[i]?.score}
                            <span className="absolute top-0 right-0 h-1 w-1 rounded-sm bg-green-500" />
                          </Tooltip>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4">
              {data.errors.map((error) => (
                <p
                  key={error}
                  className="text-lg font-bold text-red-600 dark:text-red-500"
                >
                  {error}
                </p>
              ))}
            </div>
          </>
        )}
      </Modal.Body>
      {!isLoading && (
        <Modal.Footer>
          <Button
            disabled={data.errors.length !== 0 || loadTable.isLoading}
            onClick={submitData}
          >
            Зберегти
          </Button>
          <Button color="gray" onClick={discard} disabled={loadTable.isLoading}>
            Скасувати
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  ) : (
    <></>
  );
}
