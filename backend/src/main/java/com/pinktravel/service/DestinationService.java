package com.pinktravel.service;

import com.pinktravel.dto.DestinationDetailDto;
import com.pinktravel.dto.DestinationSummaryDto;
import com.pinktravel.dto.PageResultDto;
import com.pinktravel.entity.Destination;
import com.pinktravel.repository.DestinationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/** 目的地服务：分类筛选 / 关键词搜索 / 分页 */
@Service
public class DestinationService {

    private final DestinationRepository repository;

    public DestinationService(DestinationRepository repository) {
        this.repository = repository;
    }

    public List<DestinationSummaryDto> featured() {
        return repository.findByFeaturedTrue().stream().map(this::toSummary).toList();
    }

    /**
     * 搜索列表。
     * 数据量小（种子 8 条），采用内存过滤；生产数据量大请改用 Specification / @Query。
     */
    public PageResultDto<DestinationSummaryDto> search(String category, String keyword, int page, int size) {
        List<Destination> all = repository.findAll();

        List<Destination> filtered = all.stream()
                .filter(d -> category == null || category.isBlank() || category.equals(d.getCategory()))
                .filter(d -> {
                    if (keyword == null || keyword.isBlank()) return true;
                    String kw = keyword.toLowerCase(Locale.ROOT);
                    return containsIgnoreCase(d.getName(), kw)
                            || containsIgnoreCase(d.getCity(), kw)
                            || containsIgnoreCase(d.getProvince(), kw)
                            || containsIgnoreCase(d.getSummary(), kw)
                            || d.getTags().stream().anyMatch(t -> containsIgnoreCase(t, kw));
                })
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .toList();

        int from = Math.min(page * size, filtered.size());
        int to = Math.min(from + size, filtered.size());
        List<DestinationSummaryDto> pageList = filtered.subList(from, to).stream()
                .map(this::toSummary)
                .toList();
        return new PageResultDto<>(pageList, filtered.size());
    }

    public DestinationDetailDto detail(Long id) {
        Destination d = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "目的地不存在"));
        return new DestinationDetailDto(
                d.getId(), d.getName(), d.getProvince(), d.getCity(), d.getCategory(),
                d.getSummary(), d.getDescription(), d.getHighlights(), d.getFoods(),
                d.getBestSeason(), d.getAvgCost(), d.getRating(), d.getEmoji(),
                d.getGradient(), d.getTags(), d.getFeatured()
        );
    }

    public List<String> categories() {
        return repository.findAll().stream()
                .map(Destination::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    private DestinationSummaryDto toSummary(Destination d) {
        return new DestinationSummaryDto(
                d.getId(), d.getName(), d.getProvince(), d.getCity(), d.getCategory(),
                d.getSummary(), d.getRating(), d.getEmoji(), d.getGradient(),
                d.getTags(), d.getFeatured()
        );
    }

    private boolean containsIgnoreCase(String src, String lowerKw) {
        return src != null && src.toLowerCase(Locale.ROOT).contains(lowerKw);
    }
}
