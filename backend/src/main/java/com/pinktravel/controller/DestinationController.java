package com.pinktravel.controller;

import com.pinktravel.dto.DestinationDetailDto;
import com.pinktravel.dto.DestinationSummaryDto;
import com.pinktravel.dto.PageResultDto;
import com.pinktravel.service.DestinationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 目的地接口（与 preview/mock-server.mjs 完全一致） */
@RestController
@RequestMapping("/api")
public class DestinationController {

    private final DestinationService service;

    public DestinationController(DestinationService service) {
        this.service = service;
    }

    /** 精选目的地 */
    @GetMapping("/destinations/featured")
    public List<DestinationSummaryDto> featured() {
        return service.featured();
    }

    /** 列表：分类 / 关键词 / 分页 */
    @GetMapping("/destinations")
    public PageResultDto<DestinationSummaryDto> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.search(category, keyword, page, size);
    }

    /** 详情 */
    @GetMapping("/destinations/{id}")
    public DestinationDetailDto detail(@PathVariable Long id) {
        return service.detail(id);
    }

    /** 分类列表 */
    @GetMapping("/categories")
    public List<String> categories() {
        return service.categories();
    }

    /** 健康检查（区分于 Mock：mode=java） */
    @GetMapping("/health")
    public Object health() {
        return java.util.Map.of("ok", true, "mode", "java", "app", "pink-travel");
    }
}
