package com.FarmConnect.WebApplication.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document (collection = "farmer")
public class Farmer {
    @Id
    private int uniqueId;
    private String fullName;
    private String email;
    private String address;
    private long contact;
    private String state;

    private List<ConfirmedDeals> confirmedDeals;
}
