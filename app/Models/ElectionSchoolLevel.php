<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ElectionSchoolLevel extends Model
{
    protected $fillable = ['election_id', 'school_level'];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }
}
