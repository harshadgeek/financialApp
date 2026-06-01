package com.finance.app.repository;

import com.finance.app.model.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
    Optional<OtpVerification> findTopByEmailOrderByExpiryTimeDesc(String email);
    void deleteByEmail(String email);
}
