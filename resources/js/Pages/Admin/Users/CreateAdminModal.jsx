import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import UserCreationForm from '@/Components/UserManagement/UserCreationForm';

export default function CreateAdminModal() {
    const { data, setData, post, processing, errors } = useForm({
        id_number: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    return (
        <Modal>
            {({ close }) => {
                // submit function has access to close()
                const submit = (e) => {
                    e.preventDefault();

                    post(route('admin.users.store'), {
                        onSuccess: () => {
                            // reset form
                            setData({ name: "", id_number: "", email: "", password: "", password_confirmation: "", });

                            // close modal
                            close();
                        },
                    });
                };

                return (
                    <div className="relative p-4">
                        <header className="flex flex-row items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold dark:text-white">
                                Create New Admin
                            </h1>
                            <button
                                type="button"
                                onClick={close}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <UserCreationForm form={{ data, setData, errors, processing, submit }} />
                    </div>
                );
            }}
        </Modal>
    );
}
