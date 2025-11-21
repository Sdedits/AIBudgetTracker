package com.infosys.aibudgettracker.forum.controller;

import com.infosys.aibudgettracker.forum.dto.CommentRequest;
import com.infosys.aibudgettracker.forum.dto.PostRequest;
import com.infosys.aibudgettracker.forum.dto.PostResponse;
import com.infosys.aibudgettracker.forum.model.Post;
import com.infosys.aibudgettracker.forum.service.ForumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "http://localhost:5173")
public class ForumController {
    @Autowired
    private ForumService forumService;

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody PostRequest req, Authentication auth) {
        String username = auth.getName();
        Post p = forumService.createPost(username, req);
        // return created post response
        return ResponseEntity.ok(forumService.toResponse(p, Optional.of(username)));
    }

    @GetMapping("/posts")
    public ResponseEntity<?> listPosts(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       Authentication auth) {
        Page<Post> posts = forumService.listPosts(page, size);
        final Optional<String> currentUser = auth != null ? Optional.of(auth.getName()) : Optional.empty();
        // map page content
        return ResponseEntity.ok(posts.getContent().stream().map(p -> forumService.toResponse(p, currentUser)).collect(Collectors.toList()));
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        forumService.toggleLikePost(id, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> comment(@PathVariable Long id, @RequestBody CommentRequest req, Authentication auth) {
        String username = auth.getName();
        forumService.addComment(id, username, req.getContent());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/{id}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        forumService.toggleLikeComment(id, username);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<?> editComment(@PathVariable Long id, @RequestBody CommentRequest req, Authentication auth) {
        String username = auth.getName();
        forumService.editComment(id, username, req.getContent());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        forumService.deleteComment(id, username);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> editPost(@PathVariable Long id, @RequestBody PostRequest req, Authentication auth) {
        String username = auth.getName();
        Post updated = forumService.editPost(id, username, req.getContent());
        return ResponseEntity.ok(forumService.toResponse(updated, Optional.of(username)));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        forumService.deletePost(id, username);
        return ResponseEntity.ok().build();
    }
}
