<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->unique();
            $table->string('name');
            $table->enum('school_level', ['Grade School', 'Junior High', 'Senior High', 'College']);
            $table->string('year_level');
            $table->string('course')->nullable();
            $table->string('section')->nullable();
            $table->timestamps();

            // indexes
            $table->index(['school_level', 'year_level']);
            $table->index('course');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
