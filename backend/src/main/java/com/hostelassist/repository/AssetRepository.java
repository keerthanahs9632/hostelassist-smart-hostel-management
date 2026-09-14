package com.hostelassist.repository;

import com.hostelassist.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {
    Optional<Asset> findByAssetCode(String assetCode);
    List<Asset> findByBlock(String block);
    List<Asset> findByCategory(String category);
    List<Asset> findByConditionStatus(String conditionStatus);
}
