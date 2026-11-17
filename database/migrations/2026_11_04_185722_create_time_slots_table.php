<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('sort_order');
            $table->enum('slot_type', ['period', 'fixed'])->default('period');
            $table->string('fixed_activity_name', 100)->nullable();
            $table->boolean('applies_to_all_grades')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
