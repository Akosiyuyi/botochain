<?php

namespace App\Imports;

use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use App\Services\StudentValidationService;

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

            $this->expectedSchoolLevel = $cellValue instanceof RichText
                ? $cellValue->getPlainText()
                : trim(strval($cellValue));
        }

        // track all seen ids
        $seenIds = [];

        foreach ($rows as $index => $row) {
            // Build one associative array for the row
            $normalizedRow = [
                'student_id' => $this->normalize($row['student_id'] ?? null),
                'name' => $this->normalize($row['name'] ?? null),
                'school_level' => $this->normalize($row['school_level'] ?? null),
                'year_level' => $this->normalize($row['year_level'] ?? null),
                'course' => $this->normalize($row['course'] ?? null),
                'section' => $this->normalize($row['section'] ?? null),
            ];

            // Check if school_level matches expected
            if ($normalizedRow['school_level'] !== $this->expectedSchoolLevel) {
                $this->results['errors'][] = $normalizedRow;
                continue;
            }

            // Missing data check
            if (empty($normalizedRow['student_id']) || empty($normalizedRow['name']) || empty($normalizedRow['school_level']) || empty($normalizedRow['year_level'])) {
                $this->results['missing'][] = $normalizedRow;
                continue;
            }

            // Validation via reusable service
            $validator = StudentValidationService::validate($normalizedRow);

            if ($validator->fails()) {
                $this->results['errors'][] = array_merge($normalizedRow, [
                    'messages' => $validator->errors()->all(),
                ]);
                continue;
            }

            // Duplicate check
            if (in_array($normalizedRow['student_id'], $seenIds)) {
                // Already seen this student_id, skip to avoid recording in valid
                continue;
            }

            // Mark the student_id as seen if it passed all validations
            $seenIds[] = $normalizedRow['student_id'];

            // Collect valid rows
            $this->results['valid'][] = array_merge($normalizedRow, ['status' => 'Enrolled']);
        }

        // end of loop
        if ($this->mode === 'upload') {
            Student::upsert(
                $this->results['valid'], // array of rows
                ['student_id'],          // unique key to check
                ['name', 'school_level', 'year_level', 'course', 'section', 'status'] // fields to update
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
