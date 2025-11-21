package com.infosys.aibudgettracker.forum.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostResponse {
    private Long id;
    private String author;
    private String content;
    private LocalDateTime createdAt;
    private long likeCount;
    private boolean likedByCurrentUser;
    private boolean editable;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;
}
