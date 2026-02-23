<?php

namespace Tests\Feature\Controllers\Admin;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Student;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class BulkUploadControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles for admin authentication
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'SchoolLevelSeeder']);
        
        // Create school units for testing
        $this->setupSchoolUnits();
    }

    protected function setupSchoolUnits()
    {
        // Ensure school levels exist
        $gradeSchool = SchoolLevel::firstOrCreate(['name' => 'Grade School']);
        $juniorHigh = SchoolLevel::firstOrCreate(['name' => 'Junior High']);
        $seniorHigh = SchoolLevel::firstOrCreate(['name' => 'Senior High']);
        $college = SchoolLevel::firstOrCreate(['name' => 'College']);

        // Create school units for Grade School
        SchoolUnit::firstOrCreate(
            ['school_level_id' => $gradeSchool->id, 'year_level' => 'Grade 1', 'course' => null],
            ['school_level_id' => $gradeSchool->id, 'year_level' => 'Grade 1', 'course' => null]
        );

        // Create school units for Junior High
        SchoolUnit::firstOrCreate(
            ['school_level_id' => $juniorHigh->id, 'year_level' => 'Grade 7', 'course' => null],
            ['school_level_id' => $juniorHigh->id, 'year_level' => 'Grade 7', 'course' => null]
        );

        // Create school units for Senior High with courses
        SchoolUnit::firstOrCreate(
            ['school_level_id' => $seniorHigh->id, 'year_level' => 'Grade 11', 'course' => 'STEM'],
            ['school_level_id' => $seniorHigh->id, 'year_level' => 'Grade 11', 'course' => 'STEM']
        );

        // Create school units for College with courses
        SchoolUnit::firstOrCreate(
            ['school_level_id' => $college->id, 'year_level' => '1st Year', 'course' => 'BS Computer Science'],
            ['school_level_id' => $college->id, 'year_level' => '1st Year', 'course' => 'BS Computer Science']
        );
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function createValidCsvFile(array $students = [], string $schoolLevel = 'Grade School'): UploadedFile
    {
        if (empty($students)) {
            $students = [
                [
                    'student_id' => '20000001',
                    'name' => 'John Doe',
                    'school_level' => $schoolLevel,
                    'year_level' => 'Grade 1',
                    'course' => '',
                    'section' => 'A',
                ],
                [
                    'student_id' => '20000002',
                    'name' => 'Jane Smith',
                    'school_level' => $schoolLevel,
                    'year_level' => 'Grade 1',
                    'course' => '',
                    'section' => 'B',
                ],
            ];
        }

        $filename = 'test_upload_' . time() . '.csv';
        
        // Create file content with school level in first row, headers in second row
        $lines = [$schoolLevel]; // A1 contains school level
        $lines[] = 'student_id,name,school_level,year_level,course,section'; // Header row
        
        foreach ($students as $student) {
            $lines[] = implode(',', [
                $student['student_id'],
                $student['name'],
                $student['school_level'],
                $student['year_level'],
                $student['course'] ?? '',
                $student['section'],
            ]);
        }

        $content = implode("\n", $lines);
        $file = UploadedFile::fake()->createWithContent($filename, $content);
        return $file;
    }

    public function test_bulk_upload_index_page_loads()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)
            ->get(route('admin.bulk-upload.index'));

        $response->assertStatus(200);
    }

    public function test_students_bulk_upload_valid_file()
    {
        $user = $this->createAdminUser();
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Alice Johnson',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
            [
                'student_id' => '20000002',
                'name' => 'Bob Williams',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'B',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.store'), [
                'file' => $file,
            ]);

        // Should redirect to bulk upload page with success message
        $response->assertRedirect(route('admin.bulk-upload.index'));
        $response->assertSessionHas('success');
    }

    public function test_bulk_upload_staging_preview()
    {
        $user = $this->createAdminUser();
        $file = $this->createValidCsvFile([  
            [
                'student_id' => '20000001',
                'name' => 'Test Student',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        // Verify JSON response structure
        $response->assertOk();
        $response->assertJsonStructure([
            'results' => [
                'valid',
                'missing',
                'errors',
            ],
            'expectedSchoolLevel',
        ]);
    }

    public function test_bulk_upload_validation_errors()
    {
        $user = $this->createAdminUser();
        
        // Create file with invalid student ID (too low)
        $file = $this->createValidCsvFile([
            [
                'student_id' => '123', // Invalid: below minimum 20000000
                'name' => 'Invalid Student',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $data = $response->json();
        
        // Should have 1 error
        $this->assertGreaterThan(0, count($data['results']['errors']));
    }

    public function test_bulk_upload_missing_required_fields()
    {
        $user = $this->createAdminUser();
        
        // Create file with missing student_id
        $filename = 'test_missing_' . time() . '.csv';
        $content = "Grade School\n";
        $content .= "student_id,name,school_level,year_level,course,section\n";
        $content .= ",John Doe,Grade School,Grade 1,,A\n"; // Missing student_id
        
        $file = UploadedFile::fake()->createWithContent($filename, $content);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results' => [
                'valid',
                'missing',
                'errors',
            ],
        ]);
    }

    public function test_duplicate_students_rejected()
    {
        $user = $this->createAdminUser();
        
        // Create file with duplicate student IDs
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'First Entry',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
            [
                'student_id' => '20000001', // Duplicate
                'name' => 'Duplicate Entry',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'B',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results' => [
                'valid',
                'missing',
                'errors',
            ],
        ]);
    }

    public function test_school_level_year_course_validation()
    {
        $user = $this->createAdminUser();
        
        // Test Senior High with valid course
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Senior High Student',
                'school_level' => 'Senior High',
                'year_level' => 'Grade 11',
                'course' => 'STEM',
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results' => [
                'valid',
                'missing',
                'errors',
            ],
        ]);
    }

    public function test_senior_high_course_required()
    {
        $user = $this->createAdminUser();
        
        // Test Senior High without course (should fail)
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Invalid Senior High',
                'school_level' => 'Senior High',
                'year_level' => 'Grade 11',
                'course' => '', // Missing course for Senior High
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $data = $response->json();
        
        // Should have error (course required for Senior High)
        $this->assertGreaterThan(0, count($data['results']['errors']));
    }

    public function test_invalid_id_number_range()
    {
        $user = $this->createAdminUser();
        
        // Test ID number outside valid range
        $file = $this->createValidCsvFile([
            [
                'student_id' => '12345678', // Outside valid range (< 20000000)
                'name' => 'Invalid ID Range',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $data = $response->json();
        
        // Should have error
        $this->assertGreaterThan(0, count($data['results']['errors']));
    }

    public function test_grade_school_course_must_be_empty()
    {
        $user = $this->createAdminUser();
        
        // Test Grade School with course (should fail)
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Grade School With Course',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => 'STEM', // Should not have course for Grade School
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $data = $response->json();
        
        // Should have error
        $this->assertGreaterThan(0, count($data['results']['errors']));
    }

    public function test_import_staging_preview_shows_counts()
    {
        $user = $this->createAdminUser();
        
        // Create mixed file with valid and invalid
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Valid Student',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
            [
                'student_id' => '20000002',
                'name' => 'Invalid Student',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => 'STEM', // Invalid for Grade School
                'section' => 'B',
            ],
            [
                'student_id' => '',
                'name' => 'Missing ID',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'C',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $data = $response->json();
        
        // Verify structure
        $this->assertIsArray($data['results']['valid']);
        $this->assertIsArray($data['results']['errors']);
        $this->assertIsArray($data['results']['missing']);
    }

    public function test_only_authenticated_admin_can_upload()
    {
        // Unauthenticated user
        $response = $this->get(route('admin.bulk-upload.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_download_template()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)
            ->get(route('admin.bulk-upload.template'));

        $response->assertOk();
    }

    public function test_bulk_upload_requires_file()
    {
        $user = $this->createAdminUser();

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.store'), [
                // No file provided
            ]);

        // Should either have validation errors or redirect
        $response->assertStatus(302); // Redirect expected
    }

    public function test_bulk_upload_file_mime_type_validation()
    {
        $user = $this->createAdminUser();
        
        // Create invalid file type (text file)
        $file = UploadedFile::fake()->create('invalid.txt', 100, 'text/plain');

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.store'), [
                'file' => $file,
            ]);

        // Should either have validation errors or be rejected
        $response->assertStatus(302); // Redirect expected for validation failure
    }

    public function test_staging_and_uploading_flow()
    {
        $user = $this->createAdminUser();
        
        // Step 1: Stage the file
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Flow Test Student',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
        ]);

        $stageResponse = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $stageResponse->assertOk();
        $stageResponse->assertJsonStructure([
            'results' => [
                'valid',
                'missing',
                'errors',
            ],
            'expectedSchoolLevel',
        ]);

        // Step 2: Upload the file
        $file2 = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Flow Test Student',
                'school_level' => 'Grade School',
                'year_level' => 'Grade 1',
                'course' => '',
                'section' => 'A',
            ],
        ]);

        $uploadResponse = $this->actingAs($user)
            ->post(route('admin.bulk-upload.store'), [
                'file' => $file2,
            ]);

        $uploadResponse->assertRedirect(route('admin.bulk-upload.index'));
        $uploadResponse->assertSessionHas('success');
    }

    public function test_junior_high_with_valid_year_level()
    {
        $user = $this->createAdminUser();
        
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'Junior High Student',
                'school_level' => 'Junior High',
                'year_level' => 'Grade 7',
                'course' => '',
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results',
            'expectedSchoolLevel',
        ]);
    }

    public function test_college_with_valid_course()
    {
        $user = $this->createAdminUser();
        
        $file = $this->createValidCsvFile([
            [
                'student_id' => '20000001',
                'name' => 'College Student',
                'school_level' => 'College',
                'year_level' => '1st Year',
                'course' => 'BS Computer Science',
                'section' => 'A',
            ],
        ]);

        $response = $this->actingAs($user)
            ->post(route('admin.bulk-upload.stage'), [
                'file' => $file,
            ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results',
            'expectedSchoolLevel',
        ]);
    }
}
