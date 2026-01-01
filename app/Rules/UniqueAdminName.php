<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\User;

class UniqueAdminName implements ValidationRule
{

    protected ?int $ignoreId;
    public function __construct(?int $ignoreId = null)
    {
        $this->ignoreId = $ignoreId;
    }
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $query = User::where($attribute, $value)
            ->whereHas('roles', fn($q)
                => $q->whereIn('name', ['admin', 'super-admin']));

        if ($this->ignoreId) {
            $query->where('id', '!=', $this->ignoreId);
        }
        if ($query->exists()) {
            $fail('This name is already used by another admin.');
        }
    }
}
