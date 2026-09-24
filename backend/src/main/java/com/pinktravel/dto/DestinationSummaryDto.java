package com.pinktravel.dto;

import java.util.List;

/** 目的地摘要（列表/卡片用），与前端 DestinationSummary 类型对应 */
public record DestinationSummaryDto(
        Long id,
        String name,
        String province,
        String city,
        String category,
        String summary,
        Double rating,
        String emoji,
        String gradient,
        List<String> tags,
        Boolean featured
) {
}
