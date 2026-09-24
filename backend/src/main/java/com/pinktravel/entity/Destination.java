package com.pinktravel.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/** 目的地实体（含地方特色、美食等） */
@Entity
@Table(name = "destinations")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String province;
    private String city;
    private String category;
    @Column(length = 500)
    private String summary;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String bestSeason;
    private Integer avgCost;
    private Double rating;
    private String emoji;
    @Column(length = 200)
    private String gradient;
    private Boolean featured;

    /** 必体验 */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "destination_highlights", joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "item", length = 200)
    private List<String> highlights = new ArrayList<>();

    /** 特色美食 */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "destination_foods", joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "item", length = 100)
    private List<String> foods = new ArrayList<>();

    /** 标签 */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "destination_tags", joinColumns = @JoinColumn(name = "destination_id"))
    @Column(name = "item", length = 50)
    private List<String> tags = new ArrayList<>();

    public Destination() {
    }

    public Destination(String name, String province, String city, String category, String summary,
                       String description, String bestSeason, Integer avgCost, Double rating,
                       String emoji, String gradient, Boolean featured,
                       List<String> highlights, List<String> foods, List<String> tags) {
        this.name = name;
        this.province = province;
        this.city = city;
        this.category = category;
        this.summary = summary;
        this.description = description;
        this.bestSeason = bestSeason;
        this.avgCost = avgCost;
        this.rating = rating;
        this.emoji = emoji;
        this.gradient = gradient;
        this.featured = featured;
        this.highlights = highlights;
        this.foods = foods;
        this.tags = tags;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBestSeason() { return bestSeason; }
    public void setBestSeason(String bestSeason) { this.bestSeason = bestSeason; }

    public Integer getAvgCost() { return avgCost; }
    public void setAvgCost(Integer avgCost) { this.avgCost = avgCost; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public String getGradient() { return gradient; }
    public void setGradient(String gradient) { this.gradient = gradient; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }

    public List<String> getFoods() { return foods; }
    public void setFoods(List<String> foods) { this.foods = foods; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
