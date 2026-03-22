package com.finance.app.controller;

import com.finance.app.dto.UserDto;
import com.finance.app.service.UserService;
import com.finance.app.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "testuser")
    void getProfile_ReturnsUserDto() throws Exception {
        UserDto userDto = new UserDto("testuser", "test@example.com", "/url");
        when(userService.getProfile("testuser")).thenReturn(userDto);

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(userService).getProfile("testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void changePassword_Success_ReturnsOk() throws Exception {
        mockMvc.perform(post("/api/users/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"oldPass\", \"newPassword\":\"newPass\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Password changed successfully."));

        verify(userService).changePassword("testuser", "oldPass", "newPass");
    }

    @Test
    @WithMockUser(username = "testuser")
    void changePassword_Error_ReturnsBadRequest() throws Exception {
        doThrow(new IllegalArgumentException("Wrong password"))
                .when(userService).changePassword(anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/users/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"wrong\", \"newPassword\":\"new\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Wrong password"));
    }
}
