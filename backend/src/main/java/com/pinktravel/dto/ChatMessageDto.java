package com.pinktravel.dto;

/** 对话历史中的一条消息 */
public record ChatMessageDto(String role, String content) {
}
