<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\StudentsImport;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class BulkUploadController extends Controller
{
    public function index()
    {
        return Inertia::render("Admin/Students/BulkUpload");
    }

    public function store(Request $request)
    {
        try {
            $import = $this->runImport($request, 'upload');
            $successRowCount = $import->getResultsCount('valid');
            $expectedSchoolLevel = $import->getExpectedSchoolLevel();

            $successMessage = $successRowCount > 1 ?
                $successRowCount . ' ' . strtolower($expectedSchoolLevel) . ' students uploaded successfully!' :
                $successRowCount . ' ' . strtolower($expectedSchoolLevel) . ' students uploaded successfully!';

            return redirect()->route('admin.bulk-upload.index')
                ->with('success', $successMessage);
        } catch (QueryException $e) {
            Log::error('Upload failed: ' . $e->getMessage());

            return redirect()->route('admin.bulk-upload.index')
                ->with('error', 'Upload failed. Please check your file and try again.');
        } catch (\Exception $e) {
            Log::error('Unexpected error: ' . $e->getMessage());

            return redirect()->route('admin.bulk-upload.index')
                ->with('error', 'Something went wrong during upload.');
        }
    }

    public function downloadTemplate()
    {
        $zipFileName = 'upload_templates.zip';
        $zipFilePath = storage_path('app/templates/' . $zipFileName);

        return Response::download($zipFilePath, $zipFileName);
    }

    public function stage(Request $request)
    {
        $import = $this->runImport($request, 'preview');

        return response()->json([
            'results' => $import->getResults(),
            'expectedSchoolLevel' => $import->getExpectedSchoolLevel(),
        ]);
    }

    private function runImport(Request $request, string $mode)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv',
        ]);

        // 👉 Extract the top-level category from row 1 (A1)
        $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
        $expectedSchoolLevel = $spreadsheet->getActiveSheet()->getCell('A1')->getValue();

        // 👉 Run import in preview mode
        $import = new StudentsImport($mode, $expectedSchoolLevel);
        Excel::import($import, $request->file('file'));

        return $import;
    }
}
