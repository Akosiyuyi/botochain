<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EligibleVoter extends Model
{
    protected $fillable = [
        'election_id',
        'position_id',
        'student_id',
    ];

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
