package com.FarmConnect.WebApplication.controller;


import lombok.Data;

@Data
public class Product {

    String name;
    int age;
    int Salary;
    String designation;

    Product(){

    }

    public int getAge() {
        return age;
    }

    public Product(String name, int age, int salary, String designation){
        this.name = name;
        this.age  = age;
        this.Salary = salary;
        this.designation = designation;

    }

}
