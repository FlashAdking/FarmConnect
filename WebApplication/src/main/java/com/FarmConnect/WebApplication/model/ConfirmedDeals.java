package com.FarmConnect.WebApplication.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "confirmeddeals")
public class ConfirmedDeals {

    @Id
    private String dealId;
    private String pickupLocation;
    private String deliveryLocation;
    private Farmer farmer;
    private  Wholesaler user;
    private Transporter transporter;

}
