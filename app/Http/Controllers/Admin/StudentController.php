<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\User;
use App\Services\SchoolOptionsService;
use App\Services\StudentValidationService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
        $schoolOptions = $this->getSchoolOptions();
        return Inertia::render('Admin/Students/CreateStudentModal', [
            'schoolOptions' => $schoolOptions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Base rules from your service
        $baseValidator = StudentValidationService::validate($request->all());

        $validator = Validator::make(
            $request->all(),
            array_merge($baseValidator->getRules(), [
                'student_id' => ['required', 'integer', 'min:20000000', 'unique:students,student_id'],
            ])
        );

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = array_merge($validator->validated(), [
            'status' => 'Enrolled',
        ]);

        Student::create($data);

        return redirect()->route('admin.students.index')
            ->with('success', "Student created successfully!");
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
        $student = Student::find($id);
        $schoolOptions = $this->getSchoolOptions();
        return Inertia::render('Admin/Students/EditStudentModal', [
            'student' => $student,
            'schoolOptions' => $schoolOptions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        $baseValidator = StudentValidationService::validate($request->all());

        $validator = Validator::make(
            $request->all(),
            array_merge($baseValidator->getRules(), [
                'student_id' => [
                    'required',
                    'integer',
                    'min:20000000',
                    Rule::unique('students', 'student_id')->ignore($student->id),
                ],
            ])
        );

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $data = array_merge($validator->validated(), [
            'status' => $request->input('status', $student->status),
        ]);

        $student->update($data);

        // 🔎 Sync user account activity based on student status
        User::where('id_number', $student->student_id)
            ->update(['is_active' => $student->status === 'Enrolled']);

        return redirect()->route('admin.students.index')
            ->with('success', "Student updated successfully!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function showConfirmUnenroll()
    {
        return Inertia::render('Admin/Students/ConfirmUnenrollAllModal');
    }

    public function unenrollAll()
    {
        // set all students to unenrolled
        Student::query()->update(['status' => 'Unenrolled']);
        // set all voters to unenrolled
        User::role('voter')->update(['is_active' => false]);

        return redirect()->route('admin.students.index')
            ->with('success', "All students are set to unenrolled successfully!");
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
                'value' => Student::where('status', 'Enrolled')->count(),
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

    public function getSchoolOptions()
    {
        // get school level, year level and course options
        $schoolOptions = SchoolOptionsService::getOptions();
        return $schoolOptions;
    }
}
