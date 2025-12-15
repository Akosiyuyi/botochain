<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use App\Services\StudentValidationService;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $students = Student::all();

        return Inertia::render("Admin/Students/StudentsList", [
            'students' => $students,
            'stats' => $this->studentsStatsCount(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Students/CreateStudentModal');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = StudentValidationService::validate($request->all());

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = array_merge($validator->validated(), [
            'status' => 'enrolled',
        ]);

        Student::create($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function studentsStatsCount()
    {
        return [
            [
                'title' => 'All Students',
                'value' => Student::count(),
                'color' => 'blue',
            ],
            [
                'title' => 'Enrolled Students',
                'value' => Student::where('status', 'enrolled')->count(),
                'color' => 'green',
            ],
            [
                'title' => 'Students with No Accounts',
                'value' => Student::whereNotIn('student_id', function ($query) {
                    $query->select('id_number')->from('users');
                })->count(),
                'color' => 'yellow',
            ],
            [
                'title' => 'Unenrolled Students',
                'value' => Student::where('status', 'unenrolled')->count(),
                'color' => 'red',
            ],
        ];
    }
}
