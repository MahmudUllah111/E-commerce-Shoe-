<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return redirect()->route('login');
        }

        // Support spatie roles OR simple role string column
        $userRoles = [];
        if (method_exists($user, 'getRoleNames')) {
            $userRoles = $user->getRoleNames()->toArray();
        }
        if (!empty($user->role)) {
            $userRoles[] = $user->role;
        }
        $userRoles = array_unique($userRoles);

        foreach ($roles as $role) {
            if (in_array($role, $userRoles) || in_array('Super Admin', $userRoles)) {
                return $next($request);
            }
        }

        abort(403, 'Unauthorized — insufficient role');
    }
}
