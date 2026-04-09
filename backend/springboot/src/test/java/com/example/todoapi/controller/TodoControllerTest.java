package com.example.todoapi.controller;

import com.example.todoapi.entity.Todo;
import com.example.todoapi.repository.TodoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class TodoControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        todoRepository.deleteAll();
    }

    // --- Health Check ---

    @Test
    void healthCheck_returnsHealthy() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("healthy")));
    }

    // --- GET /api/todos ---

    @Test
    void getTodos_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getTodos_returnsList() throws Exception {
        createSampleTodo("First Todo", null);
        createSampleTodo("Second Todo", "Description");

        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Second Todo")))
                .andExpect(jsonPath("$[1].title", is("First Todo")));
    }

    // --- GET /api/todos/{id} ---

    @Test
    void getTodo_found() throws Exception {
        Todo todo = createSampleTodo("Test Todo", "Test Description");

        mockMvc.perform(get("/api/todos/{id}", todo.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(todo.getId().intValue())))
                .andExpect(jsonPath("$.title", is("Test Todo")))
                .andExpect(jsonPath("$.description", is("Test Description")))
                .andExpect(jsonPath("$.completed", is(false)))
                .andExpect(jsonPath("$.created_at", notNullValue()))
                .andExpect(jsonPath("$.updated_at", notNullValue()));
    }

    @Test
    void getTodo_notFound() throws Exception {
        mockMvc.perform(get("/api/todos/{id}", 999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail", is("TODO not found")));
    }

    // --- POST /api/todos ---

    @Test
    void createTodo_success() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("title", "New Todo"));

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("New Todo")))
                .andExpect(jsonPath("$.description", nullValue()))
                .andExpect(jsonPath("$.completed", is(false)))
                .andExpect(jsonPath("$.created_at", notNullValue()))
                .andExpect(jsonPath("$.updated_at", notNullValue()));
    }

    @Test
    void createTodo_withDescription() throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("title", "New Todo", "description", "A description"));

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("New Todo")))
                .andExpect(jsonPath("$.description", is("A description")));
    }

    @Test
    void createTodo_missingTitle() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("description", "No title"));

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", notNullValue()));
    }

    @Test
    void createTodo_emptyTitle() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("title", ""));

        mockMvc.perform(post("/api/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", notNullValue()));
    }

    // --- PATCH /api/todos/{id} ---

    @Test
    void updateTodo_partialUpdateTitle() throws Exception {
        Todo todo = createSampleTodo("Original", "Original Description");

        String body = objectMapper.writeValueAsString(Map.of("title", "Updated"));

        mockMvc.perform(patch("/api/todos/{id}", todo.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated")))
                .andExpect(jsonPath("$.description", is("Original Description")))
                .andExpect(jsonPath("$.completed", is(false)));
    }

    @Test
    void updateTodo_partialUpdateCompleted() throws Exception {
        Todo todo = createSampleTodo("Test", null);

        String body = objectMapper.writeValueAsString(Map.of("completed", true));

        mockMvc.perform(patch("/api/todos/{id}", todo.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Test")))
                .andExpect(jsonPath("$.completed", is(true)));
    }

    @Test
    void updateTodo_setDescriptionToNull() throws Exception {
        Todo todo = createSampleTodo("Test", "Has description");

        String body = "{\"description\": null}";

        mockMvc.perform(patch("/api/todos/{id}", todo.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", nullValue()));
    }

    @Test
    void updateTodo_notFound() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("title", "Updated"));

        mockMvc.perform(patch("/api/todos/{id}", 999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail", is("TODO not found")));
    }

    // --- DELETE /api/todos/{id} ---

    @Test
    void deleteTodo_success() throws Exception {
        Todo todo = createSampleTodo("To Delete", null);

        mockMvc.perform(delete("/api/todos/{id}", todo.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/todos/{id}", todo.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTodo_notFound() throws Exception {
        mockMvc.perform(delete("/api/todos/{id}", 999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail", is("TODO not found")));
    }

    private Todo createSampleTodo(String title, String description) {
        Todo todo = new Todo();
        todo.setTitle(title);
        todo.setDescription(description);
        return todoRepository.save(todo);
    }
}
