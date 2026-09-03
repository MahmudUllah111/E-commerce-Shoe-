<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'cartCount' => function () use ($request) {
                try {
                    if ($request->user()) {
                        $cart = \App\Models\Cart::where('user_id', $request->user()->id)->first();
                    } else {
                        $sid = $request->session()->getId();
                        $cart = $sid ? \App\Models\Cart::where('session_id', $sid)->whereNull('user_id')->first() : null;
                    }
                    return $cart ? (int) $cart->items()->sum('quantity') : 0;
                } catch (\Throwable $e) { return 0; }
            },
            'ziggy' => fn () => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
