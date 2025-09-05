import { Modal } from '@inertiaui/modal-react';
import PrimaryButton from "@/Components/PrimaryButton";
import { X } from "lucide-react";
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import CheckboxGroup from "@/Components/CheckboxGroup";

export default function CreateElectionModal() {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    school_levels: [], // array for checkboxes
    status: "pending",
  });

  const schoolLevelOptions = [
    { id: 1, label: "Grade School", value: "grade_school" },
    { id: 2, label: "Junior High", value: "junior_high" },
    { id: 3, label: "Senior High", value: "senior_high" },
    { id: 4, label: "College", value: "college" },
  ];

  return (
    <Modal>
      {({ close }) => {
        // submit function has access to close()
        const submit = (e) => {
          e.preventDefault();

          post(route('admin.election.store'), {
            onSuccess: () => {
              // reset form
              setData({ title: "", school_levels: [], status: "pending" });

              // close modal
              close();
            },
          });
        };

        return (
          <div className="relative p-4">
            <header className="flex flex-row items-center justify-between mb-4">
              <h1 className="text-lg font-semibold dark:text-white">
                Create New Election
              </h1>
              <button
                type="button"
                onClick={close}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={submit}>
              {/* Election Title */}
              <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                  id="title"
                  name="title"
                  value={data.title}
                  placeholder="Enter Election Title"
                  className="mt-1 block w-full"
                  onChange={(e) => setData("title", e.target.value)}
                />
                <InputError message={errors.title} className="mt-2" />
              </div>

              {/* Eligible School Levels */}
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Eligible School Level
                </legend>

                <CheckboxGroup
                  name="school_levels"
                  options={schoolLevelOptions}
                  value={data.school_levels}
                  onChange={(val) => setData("school_levels", val)}
                />

                <InputError message={errors.school_levels} className="mt-2" />
              </fieldset>

              {/* Submit Button */}
              <div className="mt-4">
                <PrimaryButton type="submit" disabled={processing}>
                  {processing ? "Saving..." : "Save"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        );
      }}
    </Modal>
  );
}
