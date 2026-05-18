<?php

$admin = \App\Models\Admin::where('email', 'admin@gmail.com')->first();
if ($admin) {
    // The 'password' attribute is cast to 'hashed' in the Admin model, 
    // so we just assign the plain text and Laravel hashes it.
    $admin->password = 'password';
    $admin->save();
    echo "Admin password updated (and hashed automatically by Laravel). You can login with password: password\n";
} else {
    echo "Admin not found\n";
}
