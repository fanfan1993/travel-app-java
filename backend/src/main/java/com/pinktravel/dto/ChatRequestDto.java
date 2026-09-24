package com.pinktravel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/** AI 聊天请求：message 为本轮问题，history 为之前的对话（可选） */
public record ChatRequestDto(
        @NotBlank(message = "message 不能为空")
        @Size(max = 2000, message = "消息过长")
        String message,

        List<ChatMessageDto> history
) {
}
