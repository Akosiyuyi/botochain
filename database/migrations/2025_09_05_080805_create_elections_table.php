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
        Schema::create('elections', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->enum('status', ['draft', 'upcoming', 'ongoing', 'ended'])->default('draft');
            $table->timestamp('eligibility_aggregated_at')->nullable();
            $table->char('final_hash', 100)->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();

            // indexes
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('elections');
    }
};
