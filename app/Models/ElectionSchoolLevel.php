<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ElectionSchoolLevel extends Model
{
    protected $fillable = ['election_id', 'school_level_id'];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function schoolLevel()
    {
        return $this->belongsTo(SchoolLevel::class);
    }
}
