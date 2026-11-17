<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timetable_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timetable_id')->constrained()->cascadeOnDelete();
            $table->foreignId('week_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('time_slot_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_assignment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->nullOnDelete();
            $table->string('room', 50)->nullable();
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->unique(['timetable_id', 'week_day_id', 'time_slot_id'], 'tts_unique_cell');
            $table->index(['teacher_id', 'week_day_id', 'time_slot_id'], 'tts_teacher_clash_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timetable_sessions');
    }
};
