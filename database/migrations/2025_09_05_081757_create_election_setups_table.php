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
        Schema::create('election_setup', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_id')->constrained('elections')->onDelete('cascade');
            $table->foreignId('theme_id')->nullable()->constrained('color_themes')->onDelete('set null');
            $table->boolean('setup_positions')->default(false);
            $table->boolean('setup_partylist')->default(false);
            $table->boolean('setup_candidates')->default(false);
            $table->boolean('setup_finalized')->default(false);
            $table->dateTime('start_time')->nullable();
            $table->dateTime('end_time')->nullable();
            $table->timestamps();

            $table->index('election_id');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('election_setup');
    }
};
