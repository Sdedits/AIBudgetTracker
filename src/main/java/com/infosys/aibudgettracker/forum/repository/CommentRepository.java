package com.infosys.aibudgettracker.forum.repository;

import com.infosys.aibudgettracker.forum.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    void deleteByPostId(Long postId);
}
