import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import ElectionCreationForm from '@/Components/Election/ElectionCreationForm';

export default function EditElectionModal({ election, schoolLevelOptions }) {
    const { data, setData, patch, processing, errors } = useForm({
        title: election?.title ?? "",
        school_levels: election?.school_levels ?? [], // array for checkboxes
    });

    return (
        <Modal>
            {({ close }) => {
                // submit function has access to close()
                const submit = (e) => {
                    e.preventDefault();

                    patch(route('admin.election.update', election.id), {
                        onSuccess: () => {
                            // close modal
                            close();
                        },
                    });
                };

                return (
                    <div className="relative p-4">
                        <header className="flex flex-row items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold dark:text-white">
                                Update Election
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
