<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'status',
        'final_hash',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship to ElectionSetup 
    public function setup()
    {
        return $this->hasOne(ElectionSetup::class);
    }

    // Relationship to SchoolLevels
    public function schoolLevels()
    {
        return $this->hasMany(ElectionSchoolLevel::class);
    }

    public function positions() {
        return $this->hasMany(Position::class);
    }

    // Helper: get school_levels as plain array
    public function getSchoolLevelListAttribute()
    {
        return $this->schoolLevels->pluck('school_level')->toArray();
    }
}
