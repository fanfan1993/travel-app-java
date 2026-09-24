package com.pinktravel.dto;

import java.util.List;

/** 目的地详情（含地方特色、美食、最佳季节、预算），与前端 DestinationDetail 对应 */
public record DestinationDetailDto(
        Long id,
        String name,
        String province,
        String city,
        String category,
        String summary,
        String description,
        List<String> highlights,
        List<String> foods,
        String bestSeason,
        Integer avgCost,
        Double rating,
        String emoji,
        String gradient,
        List<String> tags,
        Boolean featured
) {
}
