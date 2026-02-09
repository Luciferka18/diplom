<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone_or_telegram' => ['required', 'string', 'max:255'],
            'goal' => ['nullable', 'string', 'max:5000'],
        ]);

        $contact = ContactRequest::create($data);

        return response()->json(['message' => 'Request received', 'id' => $contact->id], 201);
    }
}
