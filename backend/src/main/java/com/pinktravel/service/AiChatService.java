package com.pinktravel.service;

import com.pinktravel.dto.ChatMessageDto;
import com.pinktravel.dto.ChatRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * AI 旅行助手服务：
 * - 配置了 DASHSCOPE_API_KEY 时，通过阿里云百炼 OpenAI 兼容接口流式输出
 * - 未配置 KEY 时，回退为本地模拟流式回复（与前端预览 Mock 行为一致），保证项目开箱可跑
 */
@Service
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    /** ★ AI 助手人设与话术（可自定义） */
    private static final String SYSTEM_PROMPT = """
            你是「小粉」，粉色旅行 App 的 AI 旅行助手，熟悉中国各地的景点、美食与行程规划。

            【说话风格】
            - 语气热情可爱，称呼用户为「你」，适当使用 emoji
            - 回答结构清晰，多用分点/分段，控制在 300 字以内
            - 给出实用可执行的建议（时间、预算、避坑提示）

            【业务范围】
            - 行程规划（按天数/预算/出发地定制）
            - 目的地与地方特色介绍（景点、美食、民俗）
            - 交通、住宿、最佳季节等实用攻略

            【边界】
            - 不确定的信息要如实说明，不要编造价格和营业时间
            - 涉及签证、疫情政策等时效性问题，建议用户查询官方渠道""";

    private final WebClient webClient;
    /** Spring Boot 4 使用 Jackson 3（tools.jackson），这里用自包含的 JsonMapper 解析流式分片 */
    private final JsonMapper jsonMapper = JsonMapper.builder().build();
    private final String apiKey;
    private final String model;

    public AiChatService(@Value("${dashscope.api-key:}") String apiKey,
                         @Value("${dashscope.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}") String baseUrl,
                         @Value("${dashscope.model:qwen-plus}") String model) {
        // 注意：Spring Boot 4 的 servlet 应用中不再自动装配 WebClient.Builder，这里自建
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model;
    }

    public SseEmitter stream(ChatRequestDto request) {
        SseEmitter emitter = new SseEmitter(120_000L);

        // 未配置 KEY：本地模拟流式回复（开箱即跑）
        if (apiKey.isEmpty()) {
            log.warn("[ai] 未配置 DASHSCOPE_API_KEY，使用本地模拟回复");
            mockStream(emitter, request.message());
            return emitter;
        }

        // 组装消息列表：system + history + 本轮问题
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        if (request.history() != null) {
            for (ChatMessageDto m : request.history()) {
                if (m.role() != null && m.content() != null && !m.content().isBlank()) {
                    messages.add(Map.of("role", m.role(), "content", m.content()));
                }
            }
        }
        messages.add(Map.of("role", "user", "content", request.message()));

        Map<String, Object> payload = Map.of(
                "model", model,
                "messages", messages,
                "stream", true
        );

        AtomicReference<Disposable> ref = new AtomicReference<>();
        emitter.onCompletion(() -> {
            Disposable d = ref.get();
            if (d != null && !d.isDisposed()) d.dispose();
        });
        emitter.onTimeout(() -> {
            Disposable d = ref.get();
            if (d != null && !d.isDisposed()) d.dispose();
            emitter.complete();
        });

        Disposable disposable = webClient.post()
                .uri("/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(payload)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<org.springframework.http.codec.ServerSentEvent<String>>() {
                })
                .subscribe(
                        sse -> handleSseData(emitter, sse.data()),
                        err -> {
                            log.error("[ai] 百炼调用失败", err);
                            String msg = err.getMessage() == null ? "未知错误" : err.getMessage();
                            sendEvent(emitter, Map.of("type", "error", "message", "AI 服务调用失败：" + msg));
                            emitter.complete();
                        },
                        () -> {
                            sendEvent(emitter, Map.of("type", "done"));
                            emitter.complete();
                        }
                );
        ref.set(disposable);
        return emitter;
    }

    /** 解析百炼返回的 SSE 分片，提取增量文本 */
    private void handleSseData(SseEmitter emitter, String data) {
        if (data == null || data.isBlank() || "[DONE]".equals(data.trim())) return;
        try {
            JsonNode root = jsonMapper.readTree(data);
            JsonNode contentNode = root.path("choices").path(0).path("delta").path("content");
            if (contentNode.isMissingNode() || contentNode.isNull()) return;
            String content = contentNode.asString();
            if (!content.isEmpty()) {
                sendEvent(emitter, Map.of("type", "delta", "content", content));
            }
        } catch (Exception e) {
            log.debug("[ai] 忽略无法解析的分片: {}", data);
        }
    }

    private void sendEvent(SseEmitter emitter, Map<String, ?> data) {
        try {
            emitter.send(SseEmitter.event().data(data));
        } catch (Exception e) {
            // 客户端断开等异常，静默结束
            emitter.completeWithError(e);
        }
    }

    /** 本地模拟流式输出：按 3 字符一段推送，模拟打字机效果 */
    private void mockStream(SseEmitter emitter, String message) {
        String reply = buildMockReply(message);
        Thread worker = new Thread(() -> {
            try {
                for (int i = 0; i < reply.length(); i += 3) {
                    sendEvent(emitter, Map.of("type", "delta", "content", reply.substring(i, Math.min(i + 3, reply.length()))));
                    Thread.sleep(35);
                }
                sendEvent(emitter, Map.of("type", "done"));
                emitter.complete();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception ignored) {
                // 客户端断开
            }
        }, "mock-ai-stream");
        worker.setDaemon(true);
        worker.start();
    }

    private String buildMockReply(String message) {
        String m = message == null ? "" : message;
        if (m.contains("成都") || m.contains("重庆") || m.contains("火锅")) {
            return """
                    🌶️ 川渝之行小粉给你安排～

                    【成都 3 日美食路线】
                    Day1：宽窄巷子 → 人民公园鹤鸣茶社 → 锦里夜色
                    Day2：大熊猫基地（8:30 开园就冲！）→ 太古里 → 火锅晚宴
                    Day3：都江堰半日游 → 返程前撸一顿串串

                    💰 人均预算约 1500 元（不含大交通）
                    🐼 小贴士：熊猫基地一定赶早，看到滚滚吃早餐的概率最高！""";
        }
        if (m.contains("大理") || m.contains("云南") || m.contains("洱海")) {
            return """
                    🌅 大理是治愈系天花板！

                    【大理 3 日慢生活】
                    Day1：大理古城闲逛 → 人民路民谣酒吧
                    Day2：租小电驴环洱海（S 湾看日出 → 喜洲稻田 → 双廊发呆）
                    Day3：苍山索道 → 寂照庵吃素斋 → 带一扎染手作回家

                    💰 人均约 1200 元｜🛵 环海电驴一天 60 元左右
                    📷 洱海拍照记得穿浅色长裙，出片率翻倍！""";
        }
        if (m.contains("三亚") || m.contains("海岛") || m.contains("海边")) {
            return """
                    🏝️ 三亚度假模式启动！

                    【三亚 4 日躺平计划】
                    Day1：亚龙湾沙滩 + 日落
                    Day2：蜈支洲岛一日游（潜水 + 环岛电瓶车）
                    Day3：后海村学冲浪 → 椰梦长廊骑行
                    Day4：第一市场海鲜加工 → 返程

                    💰 人均约 2500 元（淡季）
                    🤿 蜈支洲岛潜水建议提前一天线上购票，便宜 20% 左右""";
        }
        return """
                收到！小粉帮你参谋参谋 😊

                最近这几个地方人气很高：
                🐼 成都 — 美食 + 熊猫，慢生活首选
                🌅 大理 — 苍山洱海，治愈系风光
                🏯 西安 — 千年古都，历史迷天堂
                🏝️ 三亚 — 阳光沙滩，度假放松
                🐫 敦煌 — 大漠孤烟，丝路艺术

                告诉我你的出发城市、天数和预算，小粉帮你定制详细行程哦～

                （当前为本地模拟回复，配置 DASHSCOPE_API_KEY 后可体验真实 AI 对话）""";
    }
}
