<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('position_eligible_units', function (Blueprint $table) {
            $table->id();

            // Link to election
            $table->foreignId('position_id')
                ->constrained()
                ->cascadeOnDelete();

            // Link to school_levels table instead of enum
            $table->foreignId('school_unit_id')
                ->constrained('school_units')
                ->cascadeOnDelete();

            $table->unique(['position_id', 'school_unit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('position_eligible_units');
    }
};
