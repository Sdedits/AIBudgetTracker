package com.infosys.aibudgettracker.forum.repository;

import com.infosys.aibudgettracker.forum.model.PostLike;
import com.infosys.aibudgettracker.forum.model.Post;
import com.infosys.aibudgettracker.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPost(Post post);
    Optional<PostLike> findByPostAndUser(Post post, User user);
    void deleteByPost(Post post);
}
