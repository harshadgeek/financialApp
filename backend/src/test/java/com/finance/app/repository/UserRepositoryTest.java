package com.finance.app.repository;

import com.finance.app.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUsername_ReturnsUser() {
        String uniqueUsername = "testuser_" + System.currentTimeMillis();
        User user = new User();
        user.setUsername(uniqueUsername);
        user.setEmail("test@example.com");
        user.setPassword("password");
        userRepository.save(user);

        Optional<User> found = userRepository.findByUsername(uniqueUsername);
        assertTrue(found.isPresent());
        assertEquals("test@example.com", found.get().getEmail());
        
        userRepository.delete(user);
    }
}
