<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;

class ProgramController extends Controller
{
    public function index()
    {
        return Program::all();
    }

    public function show($id)
    {
        return Program::findOrFail($id);
    }
}
