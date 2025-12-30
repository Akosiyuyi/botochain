<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PositionEligibleUnit extends Model
{
    protected $fillable = ['position_id', 'school_unit_id'];

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function schoolUnit()
    {
        return $this->belongsTo(SchoolUnit::class);
    }
}
