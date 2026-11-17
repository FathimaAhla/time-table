<?php

use App\Models\Institute;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users register with the read-only user role', function () {
    $institute = Institute::create(['name' => 'Main School', 'type' => 'school']);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = auth()->user();
    expect($user->role)->toBe('user');
    expect($user->institute_id)->toBe($institute->id);
    expect($user->canManage())->toBeFalse();
});
