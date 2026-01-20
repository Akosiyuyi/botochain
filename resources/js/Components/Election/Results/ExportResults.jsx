import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ExportResults({ election }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    const handleExportExcel = () => {
        window.location.href = route('admin.election.export.excel', election.id);
        setOpen(false);
    };

    const handleExportPdf = () => {
        window.location.href = route('admin.election.export.pdf', election.id);
        setOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="relative inline-block" ref={menuRef}>
            <SecondaryButton onClick={() => setOpen((v) => !v)}
                className='flex items-center gap-2'>
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </SecondaryButton>

            {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10">
                    <button
                        onClick={handleExportExcel}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Export to Excel
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <FileText className="w-4 h-4 text-red-600" />
                        Export to PDF
                    </button>
                </div>
            )}
        </div>
    );
}