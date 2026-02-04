<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $student_id
 * @property string $name
 * @property string $school_level
 * @property string $year_level
 * @property string $course
 * @property string $section
 * @property string $status
 */
class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'name',
        'school_level',
        'year_level',
        'course',
        'section',
        'status',
    ];

    protected $casts = [
        'year_level' => 'string',
    ];

    public function scopeOfSchoolLevel($query, $level)
    {
        return $query->where('school_level', $level);
    }

    public function eligibleVoters()
    {
        return $this->hasMany(EligibleVoter::class);
    }

    public function votes()
    {
        $this->hasMany(Vote::class);
    }
}
