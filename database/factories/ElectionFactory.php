<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Enums\ElectionStatus;
use App\Models\Election;

class ElectionFactory extends Factory
{
    protected $model = Election::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'status' => ElectionStatus::Ongoing,
        ];
    }

    // State for draft elections
    public function draft()
    {
        return $this->state(fn() => [
            'status' => ElectionStatus::Draft,
        ]);
    }

    // State for upcoming elections
    public function upcoming()
    {
        return $this->state(fn() => [
            'status' => ElectionStatus::Upcoming,
        ]);
    }

    // State for ended elections
    public function ended()
    {
        return $this->state(fn() => [
            'status' => ElectionStatus::Ended,
            'finalized_at' => null,
            'final_hash' => null,
        ]);
    }

    // State for finalized elections
    public function finalized()
    {
        return $this->state(fn() => [
            'status' => ElectionStatus::Finalized,
        ]);
    }

    // State for compromised elections
    public function compromised()
    {
        return $this->state(fn() => [
            'status' => ElectionStatus::Compromised,
        ]);
    }
}
