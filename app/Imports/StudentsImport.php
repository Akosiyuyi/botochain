<?php

namespace App\Imports;

use App\Models\Student;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class StudentsImport implements ToCollection, WithHeadingRow
{
    protected $mode; // 'preview' or 'upload'
    protected $results = [
        'valid' => [],
        'missing' => [],
        'errors' => [],
    ];

    protected $expectedSchoolLevel;

    public function __construct($mode = 'upload', $expectedSchoolLevel = null)
    {
        $this->mode = $mode;
        $this->expectedSchoolLevel = $expectedSchoolLevel;
    }

    public function headingRow(): int
    {
        return 2;
    }

    /**
     * Normalize any cell value to a plain trimmed string.
     */
    protected function normalize($value): ?string
    {
        if ($value instanceof RichText) {
            return trim($value->getPlainText());
        }

        if ($value instanceof \PhpOffice\PhpSpreadsheet\Cell\Cell) {
            return trim(strval($value->getValue()));
        }

        if (is_object($value) && method_exists($value, '__toString')) {
            return trim(strval($value));
        }

        return $value !== null ? trim(strval($value)) : null;
    }


    public function collection(Collection $rows)
    {
        // Normalize expected school level from A1
        if (request()->file('file')) {
            $cellValue = \PhpOffice\PhpSpreadsheet\IOFactory::load(
                request()->file('file')->getRealPath()
            )->getActiveSheet()->getCell('A1')->getValue();

            if ($cellValue instanceof RichText) {
                // 👈 unwrap the RichText object
                $this->expectedSchoolLevel = $cellValue->getPlainText();
            } else {
                $this->expectedSchoolLevel = trim(strval($cellValue));
            }
        }

        foreach ($rows as $index => $row) {
            // Normalize all fields
            $student_id = $this->normalize($row['student_id'] ?? null);
            $name = $this->normalize($row['name'] ?? null);
            $school_level = $this->normalize($row['school_level'] ?? null);
            $year_level = $this->normalize($row['year_level'] ?? null);
            $course = $this->normalize($row['course'] ?? null);
            $section = $this->normalize($row['section'] ?? null);

            // Check if school_level matches expected
            if ($school_level !== $this->expectedSchoolLevel) {
                $this->results['errors'][] = compact(
                    'student_id',
                    'name',
                    'school_level',
                    'year_level',
                    'course',
                    'section'
                );
                continue;
            }

            // Missing data check
            if (empty($student_id) || empty($name) || empty($school_level) || empty($year_level)) {
                $this->results['missing'][] = compact(
                    'student_id',
                    'name',
                    'school_level',
                    'year_level',
                    'course',
                    'section'
                );
                continue;
            }

            // Validation
            $validator = Validator::make([
                'student_id' => $student_id,
                'name' => $name,
                'school_level' => $school_level,
                'year_level' => $year_level,
                'course' => $course,
                'section' => $section,
            ], [
                'student_id' => ['required', 'integer', 'min:20000000'],
                'name' => ['required', 'string', 'min:2', 'max:255'],
                'school_level' => ['required', 'in:Grade School,Junior High,Senior High,College'],
                'year_level' => [
                    'required',
                    function ($attribute, $value, $fail) use ($school_level) {
                        if ($school_level === 'Grade School' && !in_array($value, ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'])) {
                            $fail('Grade School year level must be Grade 1–6.');
                        }
                        if ($school_level === 'Junior High' && !in_array($value, ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'])) {
                            $fail('Junior High year level must be Grade 7–10.');
                        }
                        if ($school_level === 'Senior High' && !in_array($value, ['Grade 11', 'Grade 12'])) {
                            $fail('Senior High year level must be Grade 11–12.');
                        }
                        if ($school_level === 'College' && !in_array($value, ['1st Year', '2nd Year', '3rd Year', '4th Year'])) {
                            $fail('College year level must be 1st–4th Year.');
                        }
                    }
                ],
                'course' => [
                    function ($attribute, $value, $fail) use ($school_level) {
                        if (in_array($school_level, ['Grade School', 'Junior High']) && !empty($value)) {
                            $fail('Course must be empty for Grade School and Junior High.');
                        }
                        if ($school_level === 'Senior High' && !in_array($value, ['STEM', 'ABM', 'GAS'])) {
                            $fail('Senior High course must be STEM, ABM, or GAS.');
                        }
                        if ($school_level === 'College' && !in_array($value, ['BSCS', 'BSBA', 'BEED', 'BSED'])) {
                            $fail('College course must be BSCS, BSBA, BEED, or BSED.');
                        }
                    }
                ],
                'section' => ['nullable', 'string', 'max:50'],
            ]);

            if ($validator->fails()) {
                $this->results['errors'][] = compact(
                    'student_id',
                    'name',
                    'school_level',
                    'year_level',
                    'course',
                    'section'
                );
                continue;
            }

            // collect
            $this->results['valid'][] = compact(
                'student_id',
                'name',
                'school_level',
                'year_level',
                'course',
                'section'
            );

        }
        // end of loop
        if ($this->mode === 'upload') {
            Student::upsert(
                $this->results['valid'], // array of rows
                ['student_id'],          // unique key to check
                ['name', 'school_level', 'year_level', 'course', 'section'] // fields to update
            );
        }
    }

    public function getResults()
    {
        return $this->results;
    }

    public function getExpectedSchoolLevel()
    {
        return $this->expectedSchoolLevel;
    }

    public function getResultsCount(string $type)
    {
        return count($this->results[$type]);
    }
}
