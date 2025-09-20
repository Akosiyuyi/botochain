import { Send, Trash2 } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import StatsBox from "./StatsBox";

export default function ListPreview() {
    return (
        <div className="mt-6 p-4 overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            {/* Top bar */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-gray-900 dark:text-white font-semibold text-lg">
                    List Preview
                </div>
                <div className="space-x-2">
                    {/* <PrimaryButton className="h-8 w-32 flex items-center justify-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>
                            Push <span className="hidden md:inline">List</span>
                        </span>
                    </PrimaryButton>
                    <DangerButton className="h-8 w-36 flex items-center justify-center space-x-2">
                        <Trash2 className="w-4 h-4" />
                        <span className="whitespace-nowrap">
                            Remove <span className="hidden md:inline">List</span>
                        </span>
                    </DangerButton> */}
                </div>
            </div>

            <StatsBox />
        </div>
    );
}
