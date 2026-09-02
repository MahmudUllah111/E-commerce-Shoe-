<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure Admin user exists
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@trustedmart.com'],
            [
                'name' => 'Store Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+1234567890',
                'address' => 'Central Hub, TrustedMart HQ',
                'city' => 'Dhaka',
                'postal_code' => '1230',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}