package com.example.demo.domain.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RestResponse<T> {
     int statusCode;
     String error;
     // message có thể là String hoặc Arraylisst
     Object message;
     T data;
}
