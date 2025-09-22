import { Modal } from '@inertiaui/modal-react';
import PrimaryButton from "@/Components/PrimaryButton";
import { X } from "lucide-react";
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

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

                        <form className="flex flex-col gap-4" onSubmit={submit}>
                            {/* Admin ID Number */}
                            <div>
                                <InputLabel htmlFor="id_number" value="ID Number" />
                                <TextInput
                                    id="id_number"
                                    name="id_number"
                                    value={data.id_number}
                                    placeholder="Enter ID number"
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData("id_number", e.target.value)}
                                />
                                <InputError message={errors.id_number} className="mt-2" />
                            </div>

                            {/* Admin Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    placeholder="Enter full name"
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData("name", e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Admin Email Address */}
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="Enter email address"
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData("email", e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Admin Password */}
                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="Enter password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm password */}
                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    placeholder="Confirm password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            {/* Submit Button */}
                            <div>
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
