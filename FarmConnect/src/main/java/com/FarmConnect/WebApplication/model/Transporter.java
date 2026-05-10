package com.FarmConnect.WebApplication.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document (collection = "transport")
public class Transporter {
    @Id
    private int Tid ;
    private String contact;
    private int capacityInTons;
    private String vehNameWithModel;
    private String fullName;
    private String address;

}
