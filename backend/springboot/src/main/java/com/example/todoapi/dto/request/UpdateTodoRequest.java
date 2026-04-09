package com.example.todoapi.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

public class UpdateTodoRequest {

    @JsonIgnore
    private final Set<String> presentFields = new HashSet<>();

    @Size(min = 1, max = 255)
    private String title;

    @Size(max = 1024)
    private String description;

    private Boolean completed;

    @JsonIgnore
    public boolean hasField(String field) {
        return presentFields.contains(field);
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.presentFields.add("title");
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.presentFields.add("description");
        this.description = description;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.presentFields.add("completed");
        this.completed = completed;
    }
}
