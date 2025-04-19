<?php
$password = 'Lkm76@#21';
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
echo "Password hash for '$password': " . $hash; 