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
        Schema::create('plots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->enum('type', ['grave', 'niche', 'mausoleum', 'plot'])->default('grave');
            $table->string('section')->nullable();
            $table->enum('status', ['available', 'reserved', 'occupied'])->default('available');
            $table->unsignedInteger('capacity')->default(1);
            $table->timestamps();

            $table->unique(['site_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plots');
    }
};
