<?php

namespace App\Console\Commands;

use Database\Seeders\NashfitDemoContentSeeder;
use Illuminate\Console\Command;

class SeedNashfitDemo extends Command
{
    protected $signature = 'nashfit:seed-demo {--force : Run without confirmation}';
    protected $description = 'Safely add connected NashFit demo content without deleting existing data';

    public function handle(): int
    {
        if (!$this->option('force') && !$this->confirm('Add/update NashFit demo content? Existing user data will not be deleted.', true)) return self::SUCCESS;
        $this->call('db:seed', ['--class' => NashfitDemoContentSeeder::class, '--force' => true]);
        $this->info('Demo content is ready. Accounts: demo.user1@nashfit.local / Demo123!');
        return self::SUCCESS;
    }
}
