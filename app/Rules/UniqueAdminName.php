<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\User;

class UniqueAdminName implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $exists = User::where($attribute, $value)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['admin', 'super-admin']))
            ->exists();

        if ($exists) {
            $fail('This name is already used by another admin.');
        }
    }
}
