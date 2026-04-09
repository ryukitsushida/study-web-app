package com.example.todoapi.service;

import com.example.todoapi.dto.request.CreateTodoRequest;
import com.example.todoapi.dto.request.UpdateTodoRequest;
import com.example.todoapi.entity.Todo;
import com.example.todoapi.exception.TodoNotFoundException;
import com.example.todoapi.repository.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @InjectMocks
    private TodoService todoService;

    private Todo sampleTodo;

    @BeforeEach
    void setUp() {
        sampleTodo = new Todo();
        sampleTodo.setId(1L);
        sampleTodo.setTitle("Test Todo");
        sampleTodo.setDescription("Test Description");
        sampleTodo.setCompleted(false);
        sampleTodo.setCreatedAt(LocalDateTime.of(2024, 1, 1, 0, 0, 0));
        sampleTodo.setUpdatedAt(LocalDateTime.of(2024, 1, 1, 0, 0, 0));
    }

    @Test
    void getTodos_returnsList() {
        when(todoRepository.findAllByOrderByCreatedAtDescIdDesc()).thenReturn(List.of(sampleTodo));

        List<Todo> result = todoService.getTodos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Todo");
        verify(todoRepository).findAllByOrderByCreatedAtDescIdDesc();
    }

    @Test
    void getTodos_returnsEmptyList() {
        when(todoRepository.findAllByOrderByCreatedAtDescIdDesc()).thenReturn(List.of());

        List<Todo> result = todoService.getTodos();

        assertThat(result).isEmpty();
    }

    @Test
    void getTodo_found() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));

        Todo result = todoService.getTodo(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Test Todo");
    }

    @Test
    void getTodo_notFound() {
        when(todoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoService.getTodo(999L))
                .isInstanceOf(TodoNotFoundException.class)
                .hasMessage("TODO not found");
    }

    @Test
    void createTodo_success() {
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("New Todo");
        request.setDescription("New Description");

        when(todoRepository.save(any(Todo.class))).thenReturn(sampleTodo);

        Todo result = todoService.createTodo(request);

        assertThat(result).isNotNull();
        verify(todoRepository).save(any(Todo.class));
    }

    @Test
    void createTodo_withoutDescription() {
        CreateTodoRequest request = new CreateTodoRequest();
        request.setTitle("New Todo");

        when(todoRepository.save(any(Todo.class))).thenReturn(sampleTodo);

        Todo result = todoService.createTodo(request);

        assertThat(result).isNotNull();
        verify(todoRepository).save(any(Todo.class));
    }

    @Test
    void updateTodo_partialUpdateTitle() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));
        when(todoRepository.save(any(Todo.class))).thenReturn(sampleTodo);

        UpdateTodoRequest request = new UpdateTodoRequest();
        request.setTitle("Updated Title");

        Todo result = todoService.updateTodo(1L, request);

        assertThat(result).isNotNull();
        verify(todoRepository).save(any(Todo.class));
    }

    @Test
    void updateTodo_partialUpdateCompleted() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));
        when(todoRepository.save(any(Todo.class))).thenReturn(sampleTodo);

        UpdateTodoRequest request = new UpdateTodoRequest();
        request.setCompleted(true);

        todoService.updateTodo(1L, request);

        assertThat(sampleTodo.getCompleted()).isTrue();
        verify(todoRepository).save(any(Todo.class));
    }

    @Test
    void updateTodo_notFound() {
        when(todoRepository.findById(999L)).thenReturn(Optional.empty());

        UpdateTodoRequest request = new UpdateTodoRequest();
        request.setTitle("Updated");

        assertThatThrownBy(() -> todoService.updateTodo(999L, request))
                .isInstanceOf(TodoNotFoundException.class);
    }

    @Test
    void deleteTodo_success() {
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));

        todoService.deleteTodo(1L);

        verify(todoRepository).delete(sampleTodo);
    }

    @Test
    void deleteTodo_notFound() {
        when(todoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoService.deleteTodo(999L))
                .isInstanceOf(TodoNotFoundException.class);
        verify(todoRepository, never()).delete(any());
    }
}
