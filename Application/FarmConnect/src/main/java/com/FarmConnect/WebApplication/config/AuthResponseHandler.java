import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class AuthResponseHandler {

    @ModelAttribute
    public void handleHtmlResponse(HttpServletRequest request, HttpServletResponse response) {
        // Add security headers if needed
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // Token is present, you can use it for additional verification if needed
            response.setHeader("X-Auth-Status", "Authenticated");
        }
    }
}