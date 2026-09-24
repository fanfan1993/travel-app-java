package com.pinktravel.controller;

import com.pinktravel.dto.ChatRequestDto;
import com.pinktravel.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * AI 助手接口。
 * 返回 text/event-stream，事件体为 JSON：
 *   data: {"type":"delta","content":"你好"}
 *   data: {"type":"done"}
 *   data: {"type":"error","message":"..."}
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiChatService aiChatService;

    public ChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    /** 流式对话 */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@Valid @RequestBody ChatRequestDto request) {
        return aiChatService.stream(request);
    }
}
