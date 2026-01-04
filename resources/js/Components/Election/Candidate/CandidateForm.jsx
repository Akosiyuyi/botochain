import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components//TextArea';
import DangerButton from '@/Components/DangerButton';
import SelectInputForForms from "@/Components/SelectInputForForms";

export default function CandidateForm({ actions, isEditing, form, options }) {
    const { data, setData, errors, processing } = form;
    const { positionOptions, partylistOptions } = options;
    const { handleSubmit, handleCancelEdit } =  actions;

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <InputLabel htmlFor="partylist" value={isEditing ? "Edit Partylist Selection" : "Select Partylist"} />
                    <SelectInputForForms
                        id="partylist"
                        options={partylistOptions}
                        value={data.partylist}
                        onChange={(val) => {
                            setData("partylist", val);
                        }}
                        className="mt-1"
                    />
                    <InputError message={errors.partylist} className="mt-2" />


                    <InputLabel className="mt-4" htmlFor="position" value={isEditing ? "Edit Position Selection" : "Select Position"} />
                    <SelectInputForForms
                        id="position"
                        options={positionOptions}
                        value={data.position}
                        onChange={(val) => {
                            setData("position", val);
                        }}
                        className="mt-1"
                    />
                    <InputError message={errors.position} className="mt-2" />


                    <InputLabel className="mt-4" htmlFor="name" value={isEditing ? "Edit Candidate Name" : "Candidate Name"} />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        placeholder="Enter Candidate Name"
                        className="mt-1 block w-full"
                        autoComplete="off"
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>
                <div className="lg:col-span-2">
                    <InputLabel htmlFor="description" value={isEditing ? "Edit Candidate Description" : "Candidate Description"} />
                    <TextArea
                        id="description"
                        name="description"
                        value={data.description}
                        placeholder="Summarize the candidate's purpose (optional)"
                        className="mt-1 block w-full"
                        autoComplete="off"
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <PrimaryButton type={"submit"} disabled={processing}>{isEditing ? "Update Candidate" : "Create Candidate"}</PrimaryButton>
                {isEditing && (
                    <DangerButton type="button" onClick={handleCancelEdit}>
                        Cancel
                    </DangerButton>
                )}
            </div>
        </form>
    );
}