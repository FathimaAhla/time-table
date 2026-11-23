<?php

use App\Models\Institute;
use App\Models\User;
use App\Models\WeekDay;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('each registration gets its own separate school and sees only that', function () {
    Institute::create(['name' => 'Main School', 'type' => 'school']);

    foreach (['a', 'b'] as $key) {
        $this->post(route('register.store'), [
            'name' => "User $key",
            'email' => "$key@example.com",
            'school_name' => "School $key",
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('dashboard', absolute: false));
        $this->post(route('logout'));
    }

    $a = User::where('email', 'a@example.com')->first();
    $b = User::where('email', 'b@example.com')->first();

    expect($a->institute_id)->not->toBe($b->institute_id);
    expect($a->institute->name)->toBe('School a');
    expect($a->role)->toBe('admin');
    expect($a->canManage())->toBeTrue();

    // Each school has its own default week days; user A only sees school A's.
    $this->actingAs($a);
    expect(WeekDay::count())->toBe(5);
    expect(WeekDay::pluck('institute_id')->unique()->all())->toBe([$a->institute_id]);
});

test('login is tracked and only the super admin can open the users page', function () {
    $user = User::factory()->create(['role' => 'user', 'password' => 'password']);

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

    $user->refresh();
    expect($user->login_count)->toBe(1);
    expect($user->last_login_at)->not->toBeNull();

    $this->get(route('users.index'))->assertForbidden();

    $admin = User::factory()->create(['role' => 'super_admin']);
    $this->actingAs($admin)->get(route('users.index'))->assertOk();
});
