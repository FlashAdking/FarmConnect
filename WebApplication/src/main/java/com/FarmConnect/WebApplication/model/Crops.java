package com.FarmConnect.WebApplication.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Document (collection = "crops")
public class Crops {
    @Id
    private int cropId;
    private int quantity;
    private String category;
    private int price;

}


