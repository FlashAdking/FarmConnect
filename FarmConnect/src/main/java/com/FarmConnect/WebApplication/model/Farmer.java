package com.FarmConnect.WebApplication.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.persistence.Lob;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document (collection = "farmers")
public class Farmer {
    @Id
    private String uniqueId;
    private String fullName;

    @Indexed(unique = true)
    private String emailOrPhone;

    private String password;
    private String address;
    private String state;
    private float landInAcre;

    private String imageUrl;


    @DBRef
    private List<Crops> crops;
    private List<ConfirmedDeals> confirmedDeals;
}
