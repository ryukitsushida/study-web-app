package com.example.todoapi.service;

import com.example.todoapi.dto.request.CreateTodoRequest;
import com.example.todoapi.dto.request.UpdateTodoRequest;
import com.example.todoapi.entity.Todo;
import com.example.todoapi.exception.TodoNotFoundException;
import com.example.todoapi.repository.TodoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @Transactional(readOnly = true)
    public List<Todo> getTodos() {
        return todoRepository.findAllByOrderByCreatedAtDescIdDesc();
    }

    @Transactional(readOnly = true)
    public Todo getTodo(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(TodoNotFoundException::new);
    }

    public Todo createTodo(CreateTodoRequest request) {
        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        return todoRepository.save(todo);
    }

    public Todo updateTodo(Long id, UpdateTodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(TodoNotFoundException::new);

        if (request.hasField("title")) {
            todo.setTitle(request.getTitle());
        }
        if (request.hasField("description")) {
            todo.setDescription(request.getDescription());
        }
        if (request.hasField("completed")) {
            todo.setCompleted(request.getCompleted());
        }

        return todoRepository.save(todo);
    }

    public void deleteTodo(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(TodoNotFoundException::new);
        todoRepository.delete(todo);
    }
}
