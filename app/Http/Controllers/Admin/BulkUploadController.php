<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

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
        $path = storage_path('app/templates/template.xlsx');

        if (!file_exists($path)) {
            abort(404);
        }

        return Response::download($path, 'template.xlsx');
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv',
        ]);

        $file = $request->file('file');
    }


}
