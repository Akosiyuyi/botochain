<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
