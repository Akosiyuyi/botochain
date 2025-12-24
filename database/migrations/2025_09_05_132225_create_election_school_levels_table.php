<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('election_school_levels', function (Blueprint $table) {
            $table->id();

            // Link to election
            $table->foreignId('election_id')
                ->constrained()
                ->cascadeOnDelete();

            // Link to school_levels table instead of enum
            $table->foreignId('school_level_id')
                ->constrained('school_levels')
                ->cascadeOnDelete();

            $table->timestamps();

            // Prevent duplicate election + school_level combinations
            $table->unique(['election_id', 'school_level_id']);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('election_school_levels');
    }
};
