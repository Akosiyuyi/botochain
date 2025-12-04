<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\StudentsImport;
use PhpOffice\PhpSpreadsheet\IOFactory;

class BulkUploadController extends Controller
{
    public function index()
    {
        return Inertia::render("Admin/Students/BulkUpload");
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv',
        ]);

        $file = $request->file('file');
    }

    public function downloadTemplate()
    {
        $zipFileName = 'upload_templates.zip';
        $zipFilePath = storage_path('app/templates/' . $zipFileName);

        return Response::download($zipFilePath, $zipFileName);
    }

    public function stage(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv',
        ]);

        // 👉 Extract the top-level category from row 1 (A1)
        $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
        $expectedSchoolLevel = $spreadsheet->getActiveSheet()->getCell('A1')->getValue();

        // 👉 Run import in preview mode
        $import = new StudentsImport('preview', $expectedSchoolLevel);
        Excel::import($import, $request->file('file'));

        return response()->json([
            'results' => $import->getResults(),
            'expectedSchoolLevel' => $import->getExpectedSchoolLevel(),
        ]);
    }


}
