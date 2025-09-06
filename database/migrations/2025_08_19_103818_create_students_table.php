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
            $table->string('id_number')->unique();
            $table->string('name');
            $table->enum('school_level', ['Grade School', 'Junior High', 'Senior High', 'College']);
            $table->integer('year_level');
            $table->string('course')->nullable();
            $table->string('section')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // indexes
            $table->index(['school_level', 'year_level']);
            $table->index('course');
            $table->index(['is_active', 'school_level', 'year_level']);
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
