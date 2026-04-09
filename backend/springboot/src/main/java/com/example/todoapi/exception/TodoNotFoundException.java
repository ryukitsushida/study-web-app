package com.example.todoapi.exception;

import org.springframework.http.HttpStatus;

public class TodoNotFoundException extends AppException {

    public TodoNotFoundException() {
        super(HttpStatus.NOT_FOUND, "TODO not found");
    }
}
