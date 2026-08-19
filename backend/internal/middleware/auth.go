package middleware

import (
	"strings"

	"backend/pkg/jwt"
	"backend/pkg/response"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header missing")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Unauthorized(c, "Invalid Authorization header format")
			c.Abort()
			return
		}

		claims, err := jwt.ValidateToken(parts[1], secret)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			response.Forbidden(c, "User role not identified")
			c.Abort()
			return
		}

		roleStr := userRole.(string)
		allowed := false
		for _, r := range allowedRoles {
			if r == roleStr {
				allowed = true
				break
			}
		}

		if !allowed {
			response.Forbidden(c, "You do not have permission to access this resource")
			c.Abort()
			return
		}

		c.Next()
	}
}
