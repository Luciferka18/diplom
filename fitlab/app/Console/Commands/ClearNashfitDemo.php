<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ClearNashfitDemo extends Command
{
    protected $signature = 'nashfit:clear-demo {--force : Run without confirmation}';
    protected $description = 'Delete only records created by nashfit:seed-demo';

    public function handle(): int
    {
        $path = storage_path('app/nashfit-demo-manifest.json');
        if (!is_file($path)) { $this->warn('Demo manifest not found. Nothing to remove.'); return self::SUCCESS; }
        if (!$this->option('force') && !$this->confirm('Remove only demo records listed in the manifest?', false)) return self::SUCCESS;
        $manifest = json_decode((string) file_get_contents($path), true);
        $records = array_reverse($manifest['records'] ?? []);
        DB::transaction(function () use ($records) {
            foreach ($records as $record) {
                $class = $record['class'] ?? null; $id = $record['id'] ?? null;
                if (!$class || !$id || !class_exists($class) || !is_subclass_of($class, Model::class)) continue;
                try { $class::query()->whereKey($id)->delete(); } catch (\Throwable $e) { $this->warn('Skipped '.$class.' #'.$id.': '.$e->getMessage()); }
            }
        });
        @unlink($path);
        $this->info('Demo records removed. Existing non-demo data was not touched.');
        return self::SUCCESS;
    }
}
