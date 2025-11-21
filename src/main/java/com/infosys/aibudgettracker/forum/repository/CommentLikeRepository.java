package com.infosys.aibudgettracker.forum.repository;

import com.infosys.aibudgettracker.forum.model.CommentLike;
import com.infosys.aibudgettracker.forum.model.Comment;
import com.infosys.aibudgettracker.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    long countByComment(Comment comment);
    Optional<CommentLike> findByCommentAndUser(Comment comment, User user);
    void deleteByComment(Comment comment);
}
