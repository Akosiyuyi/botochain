import { Modal } from '@inertiaui/modal-react';
import { X } from "lucide-react";
import { useForm } from '@inertiajs/react';
import UserCreationForm from '@/Components/UserManagement/UserCreationForm';

export default function EditUserModal({ user }) {
    const { data, setData, patch, processing, errors } = useForm({
        id_number: user?.id_number ?? "",
        name: user?.name ?? "",
        email: user?.email ?? "",
        is_active: user?.is_active,
    });

    const role = user?.roles?.[0]?.name ?? "";

    const roleColors = {
        "admin": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "super-admin": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        "voter": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }

    return (
        <Modal>
            {({ close }) => {
                // submit function has access to close()
                const submit = (e) => {
                    e.preventDefault();

                    patch(route('admin.users.update', user.id), {
                        onSuccess: () => {
                            // close modal
                            close();
                        },
                    });
                };

                return (
                    <div className="relative p-4">
                        <header className="flex flex-row items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                                Update {role.charAt(0).toUpperCase() + role.slice(1)}
                                {data.is_active ? (
                                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                ) : (
                                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        Inactive
                                    </span>
                                )}
                            </h1>

                            <button
                                type="button"
                                onClick={close}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </header>
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 
                                        dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-200 
                                        p-4 mb-4">
                            <p className="font-bold">Warning</p>
                            <p>
                                Editing user information is restricted to super admins. Changes to ID Number or Name
                                may desync with the student database. Proceed only if correcting verified errors.
                            </p>
                        </div>


                        <UserCreationForm form={{ data, setData, errors, processing, submit }} isEdit={true} />
                    </div>
                );
            }}
        </Modal>
    );
}
