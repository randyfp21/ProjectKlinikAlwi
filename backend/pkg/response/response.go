package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	TotalPages  int   `json:"total_pages"`
	PerPage     int   `json:"per_page"`
	TotalItems  int64 `json:"total_items"`
}

func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func SuccessWithMeta(c *gin.Context, statusCode int, message string, data interface{}, meta interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

func Error(c *gin.Context, statusCode int, message string, err interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Message: message,
		Error:   err,
	})
}

func ValidationError(c *gin.Context, err interface{}) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Message: "Validation failed",
		Error:   err,
	})
}

func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized access"
	}
	c.JSON(http.StatusUnauthorized, APIResponse{
		Success: false,
		Message: message,
	})
}

func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Access forbidden"
	}
	c.JSON(http.StatusForbidden, APIResponse{
		Success: false,
		Message: message,
	})
}

func NotFound(c *gin.Context, message string) {
	if message == "" {
		message = "Resource not found"
	}
	c.JSON(http.StatusNotFound, APIResponse{
		Success: false,
		Message: message,
	})
}

func InternalServerError(c *gin.Context, message string, err interface{}) {
	if message == "" {
		message = "Internal server error"
	}
	c.JSON(http.StatusInternalServerError, APIResponse{
		Success: false,
		Message: message,
		Error:   err,
	})
}
