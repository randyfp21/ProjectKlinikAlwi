package middleware

import (
	"backend/internal/domain"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuditLogMiddleware(db *gorm.DB, action, module string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Record audit log after handler execution
		userID, _ := c.Get("user_id")
		email, _ := c.Get("email")
		role, _ := c.Get("role")

		uID := uint(0)
		if val, ok := userID.(uint); ok {
			uID = val
		}

		uEmail := ""
		if val, ok := email.(string); ok {
			uEmail = val
		}

		uRole := ""
		if val, ok := role.(string); ok {
			uRole = val
		}

		logEntry := domain.AuditLog{
			UserID:      uID,
			UserEmail:   uEmail,
			UserRole:    uRole,
			Action:      action,
			Module:      module,
			Description: c.Request.Method + " " + c.Request.URL.Path,
			IPAddress:   c.ClientIP(),
		}

		_ = db.Create(&logEntry)
	}
}
