package com.pinktravel.dto;

import java.util.List;

/** 分页结果 */
public record PageResultDto<T>(List<T> list, long total) {
}
