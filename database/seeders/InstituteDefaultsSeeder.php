<?php

namespace Database\Seeders;

use App\Models\Institute;
use App\Models\TimeSlot;
use App\Models\WeekDay;

/**
 * Seeds the baseline week days + time slots every newly registered
 * institute needs before it can build a timetable.
 */
class InstituteDefaultsSeeder
{
    public static function seedFor(Institute $institute): void
    {
        $days = [
            ['name' => 'Monday', 'short_code' => 'MON', 'sort_order' => 1],
            ['name' => 'Tuesday', 'short_code' => 'TUE', 'sort_order' => 2],
            ['name' => 'Wednesday', 'short_code' => 'WED', 'sort_order' => 3],
            ['name' => 'Thursday', 'short_code' => 'THU', 'sort_order' => 4],
            ['name' => 'Friday', 'short_code' => 'FRI', 'sort_order' => 5],
        ];
        foreach ($days as $day) {
            WeekDay::create([...$day, 'institute_id' => $institute->id, 'is_school_day' => true]);
        }

        $slots = [
            ['name' => 'Morning Assembly', 'start_time' => '07:30', 'end_time' => '08:00', 'sort_order' => 1, 'slot_type' => 'fixed', 'fixed_activity_name' => 'Morning Assembly'],
            ['name' => 'Period 1', 'start_time' => '08:00', 'end_time' => '08:40', 'sort_order' => 2, 'slot_type' => 'period'],
            ['name' => 'Period 2', 'start_time' => '08:40', 'end_time' => '09:20', 'sort_order' => 3, 'slot_type' => 'period'],
            ['name' => 'Period 3', 'start_time' => '09:20', 'end_time' => '10:00', 'sort_order' => 4, 'slot_type' => 'period'],
            ['name' => 'Breakfast Break', 'start_time' => '10:00', 'end_time' => '10:20', 'sort_order' => 5, 'slot_type' => 'fixed', 'fixed_activity_name' => 'Breakfast Break'],
            ['name' => 'Period 4', 'start_time' => '10:20', 'end_time' => '11:00', 'sort_order' => 6, 'slot_type' => 'period'],
            ['name' => 'Period 5', 'start_time' => '11:00', 'end_time' => '11:40', 'sort_order' => 7, 'slot_type' => 'period'],
            ['name' => 'Tea Break', 'start_time' => '11:40', 'end_time' => '12:00', 'sort_order' => 8, 'slot_type' => 'fixed', 'fixed_activity_name' => 'Tea Break'],
            ['name' => 'Period 6', 'start_time' => '12:00', 'end_time' => '12:40', 'sort_order' => 9, 'slot_type' => 'period'],
            ['name' => 'Lunch Break', 'start_time' => '12:40', 'end_time' => '13:20', 'sort_order' => 10, 'slot_type' => 'fixed', 'fixed_activity_name' => 'Lunch Break'],
            ['name' => 'Period 7', 'start_time' => '13:20', 'end_time' => '14:00', 'sort_order' => 11, 'slot_type' => 'period'],
            ['name' => 'Period 8', 'start_time' => '14:00', 'end_time' => '14:40', 'sort_order' => 12, 'slot_type' => 'period'],
        ];
        foreach ($slots as $slot) {
            TimeSlot::create([...$slot, 'institute_id' => $institute->id]);
        }
    }
}
