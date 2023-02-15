import { Button, Table } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import { HiCheck, HiX } from "react-icons/hi";
import { api } from "../../utils/api";

export default function FacultyRow({ id, title }: { id: number; title: string }) {
  const renameFaculty = api.faculty.rename.useMutation();
  const apiUtils = api.useContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [newValue, setNewValue] = useState(title);

  function onNewValueChange(value: string) {
    setIsError(
      apiUtils.faculty.get.getData()?.some((f) => f.title === value.trim()) || false
    );
    setNewValue(value);
  }

  function discard() {
    setIsEditing(false);
    setIsError(false);
    setNewValue(title);
  }

  function save() {
    renameFaculty.mutate(
      { id, newName: newValue.trim() },
      {
        onError(error) {
          if (error.data?.code === "CONFLICT") setIsError(true);
        },
        onSuccess() {
          apiUtils.faculty.get.setData(undefined, (old) =>
            old
              ? old.map((f) => (f.id === id ? { ...f, title: newValue.trim() } : f))
              : old
          );
          setIsError(false);
          setIsEditing(false);
        },
      }
    );
  }

  return (
    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
      <td
        className={`whitespace-nowrap px-6 font-medium text-gray-900 dark:text-white ${
          isError ? "pt-4 pb-2" : "py-4"
        }`}
      >
        {!isEditing ? (
          <Link href={`faculties/${id}`} className="hover:underline">
            {title}
          </Link>
        ) : (
          <>
            <input
              value={newValue}
              onChange={(e) => onNewValueChange(e.target.value)}
              autoFocus={true}
              type={"text"}
              className={`block w-full whitespace-nowrap border-0 border-b p-0 py-2 pl-1 text-sm text-gray-900 focus:ring-0 dark:bg-gray-800 dark:text-white ${
                isError
                  ? "border-red-600 text-red-600 focus:border-red-600 dark:border-red-500 dark:text-red-500 dark:focus:border-red-500"
                  : "focus:border-blue-600 focus:text-blue-600 dark:border-slate-300 dark:focus:border-blue-500 dark:focus:text-blue-500"
              }`}
            />
            {isError && (
              <span className="text-sm text-red-600 dark:text-red-500">
                Факультет з таким іменем вже існує!
              </span>
            )}
          </>
        )}
      </td>
      <Table.Cell className="w-[25%] font-medium text-blue-600 dark:text-blue-500">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="p-1 hover:underline">
            Редагувати
          </button>
        ) : (
          <div className="inline-flex gap-2">
            <Button
              onClick={() => save()}
              disabled={isError || renameFaculty.isLoading}
              size="xs"
              color="success"
            >
              <HiCheck className="mr-1 h-4 w-4" />
              Зберегти
            </Button>
            <Button
              onClick={() => discard()}
              disabled={renameFaculty.isLoading}
              size="xs"
              color="failure"
            >
              <HiX className="mr-1 h-4 w-4" />
              Скасувати
            </Button>
          </div>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
