<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function update(User $user, Article $article): bool
    {
        return $user->isAdmin() || $article->author_user_id === $user->id;
    }

    public function delete(User $user, Article $article): bool
    {
        return $this->update($user, $article);
    }
}
