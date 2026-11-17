<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables that are queried directly (not only through a parent relation)
     * and therefore need their own institute_id for tenant isolation.
     *
     * @var array<int, string>
     */
    protected array $tables = [
        'academic_years',
        'terms',
        'grades',
        'school_classes',
        'week_days',
        'time_slots',
        'teacher_assignments',
        'timetables',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->foreignId('institute_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropConstrainedForeignId('institute_id');
            });
        }
    }
};
