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
        'is_active',
    ];

    protected $casts = [
        'year_level'=> 'integer',
        'is_active'=> 'boolean',
    ];

    public function scopeActive($query){
        return $query->where('is_active', true);
    }

    public function scopeOfSchoolLevel($query, $level){
        return $query->where('school_level', $level);
    }
}
