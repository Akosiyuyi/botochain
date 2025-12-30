<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SchoolUnit extends Model
{
    use HasFactory;

    protected $fillable = ['school_level_id', 'year_level', 'course'];

    public function schoolLevel()
    {
        return $this->belongsTo(SchoolLevel::class);
    }
}
