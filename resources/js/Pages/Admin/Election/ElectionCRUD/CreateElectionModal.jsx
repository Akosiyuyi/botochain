import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import ElectionCreationForm from '@/Components/Election/ElectionCreationForm';

export default function CreateElectionModal({ schoolLevelOptions }) {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    school_levels: [], // array for checkboxes
    status: "pending",
  });

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

            <ElectionCreationForm data={data} setData={setData} errors={errors} onSubmit={submit} processing={processing} schoolLevelOptions={schoolLevelOptions} />
          </div>
        );
      }}
    </Modal>
  );
}
