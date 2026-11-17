<?php

namespace Database\Factories;

use App\Models\Classroom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Classroom>
 */
class ClassroomFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Room '.fake()->unique()->numberBetween(100, 999),
            'building' => fake()->randomElement(['Main Block', 'Science Block', null]),
            'capacity' => fake()->numberBetween(25, 45),
            'status' => 'active',
        ];
    }
}
