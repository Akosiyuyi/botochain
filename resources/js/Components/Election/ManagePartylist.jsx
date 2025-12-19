import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import noElectionsFlat from '../../../images/NoElectionsFlat.png';
import PrimaryButton from '@/Components/PrimaryButton';
import LongDropdown from '../LongDropdown';
import TextArea from '../TextArea';

export default function ManagePartylist({ election, partylists }) {
    const [showPartylist, setShowPartylist] = useState(false); // partylist component state management
    const { data, setData, post, processing, errors, reset } = useForm({
        partylist_name: '',
        partylist_summary: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('', election.id), {
            onSuccess: () => reset('partylist_name'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this partylist?')) {
            router.delete(route('', [election.id, id]));
        }
    };

    return (
        <div>
            <LongDropdown className="mt-4" componentName={"Manage Partylist"} showComponent={showPartylist} setShowComponent={setShowPartylist} />
            {showPartylist && (
                <div className="px-6 py-5 bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-2">
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <InputLabel htmlFor="partylist_name" value="Create New Partylist" />
                                    <TextInput
                                        id="partylist_name"
                                        name="partylist_name"
                                        value={data.partylist_name}
                                        placeholder="Enter Partylist Name"
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                        onChange={(e) => setData('partylist_name', e.target.value)}
                                    />
                                    <InputError message={errors.partylist_name} className="mt-2" />
                                </div>
                                <div className="lg:col-span-2">
                                    <InputLabel htmlFor="partylist_summary" value="Partylist Summary" />
                                    <TextArea
                                        id="partylist_summary"
                                        name="partylist_summary"
                                        placeholder="Write the partylist goals summary"
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                        onChange={(e) => setData('partylist_summary', e.target.value)}
                                    />
                                    <InputError message={errors.partylist_summary} className="mt-2" />
                                </div>
                            </div>
                            <PrimaryButton className="mt-2" type={"submit"} disabled={processing}>Create Partylist</PrimaryButton>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}