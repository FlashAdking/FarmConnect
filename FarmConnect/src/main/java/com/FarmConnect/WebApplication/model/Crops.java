package com.FarmConnect.WebApplication.model;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.Date;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Document (collection = "crops")
public class Crops {

    @Id
    private String cropId;

    private String name;
    private String description;
    private double price;
    private String category;
    private boolean productAvailable;

    private String label;
    private String color;
    private Double rating;

    @JsonFormat(pattern="dd-MM-yyyy")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private Date releaseDate;
    private int quantity;


    private String imageUrl;


//    relationship between farmer and crops
    private String farmerId;
}


