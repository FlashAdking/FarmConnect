# 🌾 **FarmConnect**  

*Empowering Farmers | Transparent Trade | Sustainable Future*  

---

## 🌟 **Project Overview**  

In India, intermediaries often prevent farmers from receiving fair compensation for their hard work.  
**FarmConnect** is a web platform that directly connects **farmers**, **wholesalers**, and **transporters**, enabling transparent transactions that benefit everyone.  

This system is designed to:  
✅ Empower **farmers** to sell their produce directly.  
✅ Provide **wholesalers** with easy access to quality crops.  
✅ Enable **transporters** to bid competitively for delivery jobs.  

Together, we simplify agriculture, promote fair trade, and build a **recommendation model for government adoption**. 🌍✨  

---

## 🏗️ **How It Works**  
1. **Farmers** register and upload crop details.  
2. **Wholesalers** browse listed crops and make direct deals with farmers.  
3. **Transporters** bid on finalized deals to provide efficient delivery services.  
 

> A **win-win solution** for all stakeholders! 🎉  

---

## 🛠️ **Tech Stack**   

FarmConnect leverages cutting-edge technologies for scalability and performance:  

- **Frontend**: `HTML`, `CSS`, `JavaScript`  
- **Backend**: `Java Spring Boot`, `REST API`, `Thymleaf-(render HTML)`  
- **Database**: `MongoDB`  

---

## ✨ **Features at a Glance**  
🔹 Seamless registration for farmers, wholesalers, and transporters.  
🔹 Crop listing and search functionality for efficient matching.  
🔹 Transporter bidding system for cost-effective logistics.  
🔹 Transparent pricing to ensure farmers get what they deserve.  
🔹 Clean and intuitive interface for ease of use.  

---
## 🔧 **Setup Instructions**  

Follow these steps to set up and run the project locally:  

1. **Prerequisites**  
   - Install **Java 23** (JDK 23).  
   - Install **Maven** (if not already available).  
   - **Recommended IDE**: IntelliJ IDEA (comes with Maven integration, no need to install Maven separately).  
   - **Other IDEs**: Require Maven to be installed locally.  

2. **Clone the Repository**  
   ```bash
   git clone https://github.com/FlashAdking/FarmConnect.git
   cd FarmConnect
   ```

3. **Open in IDE**  
   - Open the project in IntelliJ IDEA.  
   - Navigate to and open the `pom.xml` file:  
     ```text
     WebApplication/pom.xml
     ```  
   - In the top-right corner, click the **Maven symbol**.  
   - Select **Reload/Download all dependencies**.  
   - Wait until all errors in `pom.xml` are resolved.  
   - **Note**: In the future, some dependencies may be deprecated or updated. That’s fine—warnings can be ignored as long as there are no errors.  

4. **Run the Application**  
   - **Option A: From IntelliJ IDEA**  
     - Open the main class:  
       ```text
       WebApplication/src/main/java/com/FarmConnect/WebApplication/WebApplication.java
       ```  
     - Click **Run → Run 'WebApplication.java'**.  

   - **Option B: From Command Line (requires Maven installed locally)**  
     ```bash
     mvn spring-boot:run
     ```

5. **Access the Application**  
   - By default, the app runs at:  
     ```text
     http://localhost:8080
     ```  
   - If the port is changed, check the application logs and replace `<PORT>` accordingly:  
     ```text
     http://localhost:<PORT>
     ```


