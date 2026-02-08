<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginLogs extends Model
{
    protected $fillable = [
        'email',
        'ip_address',
        'user_agent',
        'status',
        'reason',
        'login_attempt_time',
    ];

    protected $casts = [
        'login_attempt_time' => 'datetime',
        'status' => 'boolean',
    ];

    public $timestamps = false;
}
