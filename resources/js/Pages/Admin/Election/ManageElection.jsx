import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Ellipsis } from 'lucide-react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import noElectionsFlat from '../../../../images/NoElectionsFlat.png';
import ManageElectionHeader from '@/Components/ManageElectionHeader';

export default function ManageElection({ election, positions = [] }) {
    const [showPosition, setShowPosition] = useState(false);
    const [showPartylist, setShowPartylist] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        position: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.election.positions.store', election.id), {
            onSuccess: () => reset('position'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this position?')) {
            router.delete(route('admin.election.positions.destroy', [election.id, id]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="text-xl text-black dark:text-white font-semibold mb-2">
                    <Link href={route('admin.election.index')} className="hover:underline">
                        Election
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="font-medium">{election.title}</span>
                </div>
            }
        >
            <Head title={election.title} />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <ManageElectionHeader election={election} />


                <div
                    className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-4"
                    onClick={() => setShowPosition(!showPosition)}
                >
                    <div className="flex items-center justify-between px-6 py-5 cursor-pointer text-gray-900 dark:text-white">
                        Manage Positions
                        {showPosition ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>

                {showPosition && (
                    <div className="px-6 py-5 bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Left section - create position */}
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-2">
                                    <InputLabel htmlFor="position" value="Create New Position" />
                                    <TextInput
                                        id="position"
                                        name="position"
                                        value={data.position}
                                        placeholder="Enter Position Title"
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                        onChange={(e) => setData('position', e.target.value)}
                                    />
                                    <InputError message={errors.position} className="mt-2" />
                                </div>
                                <PrimaryButton type={"submit"} disabled={processing}>Create Position</PrimaryButton>
                            </form>
                        </div>

                        {/* Right section - list positions */}
                        <div className="lg:col-span-2">
                            <h1 className="text-gray-900 dark:text-white mb-1 text-sm">Positions Created</h1>
                            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                {positions.length === 0 && (
                                    <li className="col-span-full flex flex-col items-center justify-center text-center py-12">
                                        <img
                                            src={noElectionsFlat}
                                            alt="No Elections"
                                            className="w-80"
                                        />
                                        <div className="text-gray-500 dark:text-gray-200 text-lg">
                                            No positions yet.
                                        </div>
                                    </li>
                                )}
                                {positions.map((pos, index) => (

                                    <li
                                        key={pos.id}
                                        className="flex items-center justify-between border border-green-600 rounded-lg overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-2 bg-green-600 text-white dark:text-black">{index + 1}</div>
                                            <span className="text-black dark:text-white">{pos.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(pos.id)}
                                            className="pr-3 text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div
                    className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-4"
                    onClick={() => setShowPartylist(!showPartylist)}
                >
                    <div className="flex items-center justify-between px-6 py-5 cursor-pointer text-gray-900 dark:text-white">
                        Manage Partylists
                        {showPartylist ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

