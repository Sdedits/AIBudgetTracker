package com.infosys.aibudgettracker.forum.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {
    private Long id;
    private String author;
    private String content;
    private LocalDateTime createdAt;
    private long likeCount;
    private boolean likedByCurrentUser;
    private boolean editable;
    private LocalDateTime updatedAt;
}
