package com.pinktravel.repository;

import com.pinktravel.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByFeaturedTrue();
}
