import { useForm } from "@inertiajs/react";
import { Datepicker } from "flowbite-react";
import { useState } from "react";
import LongDropdown from "@/Components/LongDropdown";
import TimeInput from "@/Components/TimeInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import { useEffect } from "react";

export default function ManageSchedule({ election, schedule, flag }) {
    const [showSched, setShowSched] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const { data, setData, patch, processing, errors } = useForm({
        start_date: schedule?.startDate ?? "",
        start_time: schedule?.startTime ?? "",
        end_time: schedule?.endTime ?? "",
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.election.setup.update', [election.id, schedule.id]), {
            preserveScroll: true,
            onSuccess: () => {
            },
        });
    }

    useEffect(() => {
        if (data.start_date) {
            // Convert YYYY-MM-DD → Date (local, no timezone shift)
            const [year, month, day] = data.start_date.split("-");
            setSelectedDate(new Date(year, month - 1, day));
        } else {
            setSelectedDate(null);
        }
    }, [data.start_date]);


    return (
        <div>
            <LongDropdown
                className="mt-4"
                componentName={"Manage Schedule"}
                showComponent={showSched}
                setShowComponent={setShowSched}
                flag={flag}
            />
            <div
                className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg 
    transition-all duration-300 ease-out overflow-hidden
    ${showSched
                        ? "opacity-100 h-auto translate-y-0 mt-2 px-6 py-5"
                        : "opacity-0 h-0 translate-y-2 mt-0 px-0 py-0 pointer-events-none"
                    }`}
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: Calendar */}
                        <div className="flex flex-col items-center">

                            <div className="flex justify-center schedule-datepicker">
                                <Datepicker
                                    key={selectedDate?.toISOString() ?? "empty"}
                                    inline
                                    className="w-full"
                                    value={selectedDate || null}
                                    defaultDate={selectedDate}
                                    onChange={(date) => {
                                        if (!date) {
                                            // CLEAR pressed
                                            setSelectedDate(null);
                                            setData("start_date", "");
                                            return;
                                        }

                                        setSelectedDate(new Date(date));
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                                        const dd = String(date.getDate()).padStart(2, "0");

                                        setData("start_date", `${yyyy}-${mm}-${dd}`);
                                    }}
                                    theme={{
                                        popup: {
                                            footer: {
                                                base: "mt-4",
                                                button: {
                                                    base: "focus:ring-4 focus:ring-green-700",
                                                    today:
                                                        "bg-green-600 hover:bg-green-700 font-medium px-2 py-1 rounded-lg",
                                                },
                                            },
                                        },
                                        views: {
                                            days: {
                                                items: {
                                                    item: {
                                                        selected: "bg-green-600 text-white",
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Time inputs */}
                        <div className="flex flex-col justify-start">

                            <div className="space-y-1">
                                <h1 className="block text-sm font-medium text-gray-700 dark:text-white">Start Date</h1>

                                <div
                                    className="w-full rounded-md border border-gray-200 dark:border-gray-700
                                    bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300
                                    cursor-default select-none"
                                    aria-readonly="true"
                                >
                                    {data.start_date ? (
                                        new Date(data.start_date).toLocaleDateString("en-PH", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">
                                            No date selected
                                        </span>
                                    )}
                                </div>
                                <InputError message={errors.start_date} className="mt-2" />
                            </div>



                            {/* Start time */}
                            <div className="mt-6">
                                <InputLabel htmlFor="start_time" value="Start Time" />
                                <TimeInput
                                    id="start_time"
                                    value={data.start_time || ''}
                                    onChange={(e) =>
                                        setData("start_time", e.target.value)
                                    }
                                    className="mt-1 w-full"
                                />
                                <InputError
                                    message={errors.start_time}
                                    className="mt-2"
                                />
                            </div>

                            {/* End time */}
                            <div className="mt-6">
                                <InputLabel htmlFor="end_time" value="End Time" />
                                <TimeInput
                                    id="end_time"
                                    value={data.end_time || ''}
                                    onChange={(e) =>
                                        setData("end_time", e.target.value)
                                    }
                                    className="mt-1 w-full"
                                />
                                <InputError
                                    message={errors.end_time}
                                    className="mt-2"
                                />
                            </div>

                            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                Once the election start date is less than 24 hours away, the setup can no longer be restored to draft or edited. This ensures voter aggregation and preparation remain consistent and prevents last‑minute changes.
                            </p>


                            <div className="flex justify-center">
                                <PrimaryButton
                                    className="mt-4 w-1/2 flex justify-center"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Save"}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
