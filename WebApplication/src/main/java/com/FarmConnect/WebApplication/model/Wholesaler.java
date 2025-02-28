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
@Document ( collection = "wholesaler")
public class Wholesaler {

    @Id
    private String _id;
    private String fullName;
    private String email;
    private String address;
    private long phoneNumber;
    private String password;

    private List<ConfirmedDeals> confirmedDeals;
}
