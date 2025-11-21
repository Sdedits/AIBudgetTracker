package com.infosys.aibudgettracker.forum.service;

import com.infosys.aibudgettracker.authservice.model.User;
import com.infosys.aibudgettracker.authservice.repository.UserRepository;
import com.infosys.aibudgettracker.forum.dto.CommentResponse;
import com.infosys.aibudgettracker.forum.dto.PostRequest;
import com.infosys.aibudgettracker.forum.dto.PostResponse;
import com.infosys.aibudgettracker.forum.model.*;
import com.infosys.aibudgettracker.forum.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ForumService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private CommentLikeRepository commentLikeRepository;

    @Autowired
    private UserRepository userRepository;

    public Post createPost(String username, PostRequest req) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Post p = new Post();
        p.setUser(user);
        p.setContent(req.getContent());
        return postRepository.save(p);
    }

    public Page<Post> listPosts(int page, int size) {
        return postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    public PostResponse toResponse(Post p, Optional<String> currentUsername) {
        PostResponse r = new PostResponse();
        r.setId(p.getId());
        r.setAuthor(p.getUser() != null ? p.getUser().getUsername() : "");
        r.setContent(p.getContent());
        r.setCreatedAt(p.getCreatedAt());
        long likes = postLikeRepository.countByPost(p);
        r.setLikeCount(likes);
        boolean liked = false;
        final Optional<com.infosys.aibudgettracker.authservice.model.User> cu = currentUsername.isPresent()
            ? userRepository.findByUsername(currentUsername.get())
            : Optional.empty();
        if (cu.isPresent()) liked = postLikeRepository.findByPostAndUser(p, cu.get()).isPresent();
        r.setLikedByCurrentUser(liked);
        boolean editable = false;
        if (cu.isPresent()) {
            User current = cu.get();
            if (p.getUser() != null && p.getUser().getUsername().equals(current.getUsername())) editable = true;
            if (current.getRole() != null && current.getRole().name().equals("ADMIN")) editable = true;
        }
        r.setEditable(editable);
        List<CommentResponse> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(p.getId()).stream().map(c -> {
            CommentResponse cr = new CommentResponse();
            cr.setId(c.getId());
            cr.setAuthor(c.getUser() != null ? c.getUser().getUsername() : "");
            cr.setContent(c.getContent());
            cr.setCreatedAt(c.getCreatedAt());
            cr.setLikeCount(commentLikeRepository.countByComment(c));
            boolean cliked = false;
            if (cu.isPresent()) cliked = commentLikeRepository.findByCommentAndUser(c, cu.get()).isPresent();
            cr.setLikedByCurrentUser(cliked);
            boolean cEditable = false;
            if (cu.isPresent()) {
                User cur = cu.get();
                if (c.getUser() != null && c.getUser().getUsername().equals(cur.getUsername())) cEditable = true;
                if (cur.getRole() != null && cur.getRole().name().equals("ADMIN")) cEditable = true;
            }
            cr.setEditable(cEditable);
            cr.setUpdatedAt(c.getUpdatedAt());
            return cr;
        }).collect(Collectors.toList());
        r.setComments(comments);
            r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }

    public void toggleLikePost(Long postId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        Optional<PostLike> existing = postLikeRepository.findByPostAndUser(post, user);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
        } else {
            PostLike pl = new PostLike();
            pl.setPost(post);
            pl.setUser(user);
            postLikeRepository.save(pl);
        }
    }

    public void toggleLikeComment(Long commentId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        Optional<CommentLike> existing = commentLikeRepository.findByCommentAndUser(comment, user);
        if (existing.isPresent()) {
            commentLikeRepository.delete(existing.get());
        } else {
            CommentLike cl = new CommentLike();
            cl.setComment(comment);
            cl.setUser(user);
            commentLikeRepository.save(cl);
        }
    }

    public Comment addComment(Long postId, String username, String content) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        Comment c = new Comment();
        c.setPost(post);
        c.setUser(user);
        c.setContent(content);
        return commentRepository.save(c);
    }

    public Post editPost(Long postId, String username, String newContent) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        // allow if author or admin
        boolean allowed = post.getUser() != null && post.getUser().getUsername().equals(username)
                || (user.getRole() != null && user.getRole().name().equals("ADMIN"));
        if (!allowed) throw new RuntimeException("Not authorized to edit this post");
        post.setContent(newContent);
        post.setUpdatedAt(java.time.LocalDateTime.now());
        return postRepository.save(post);
    }

    public void deletePost(Long postId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        boolean allowed = post.getUser() != null && post.getUser().getUsername().equals(username)
                || (user.getRole() != null && user.getRole().name().equals("ADMIN"));
        if (!allowed) throw new RuntimeException("Not authorized to delete this post");

        // delete post likes
        postLikeRepository.deleteByPost(post);

        // delete comment likes for each comment
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        for (Comment c : comments) {
            commentLikeRepository.deleteByComment(c);
        }

        // delete comments
        commentRepository.deleteByPostId(postId);

        // finally delete post
        postRepository.delete(post);
    }

    public Comment editComment(Long commentId, String username, String newContent) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        boolean allowed = comment.getUser() != null && comment.getUser().getUsername().equals(username)
                || (user.getRole() != null && user.getRole().name().equals("ADMIN"));
        if (!allowed) throw new RuntimeException("Not authorized to edit this comment");
        comment.setContent(newContent);
        comment.setUpdatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        boolean allowed = comment.getUser() != null && comment.getUser().getUsername().equals(username)
                || (user.getRole() != null && user.getRole().name().equals("ADMIN"));
        if (!allowed) throw new RuntimeException("Not authorized to delete this comment");

        // delete likes associated with this comment
        commentLikeRepository.deleteByComment(comment);
        commentRepository.delete(comment);
    }
}
