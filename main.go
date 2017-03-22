package main

import (
	"os"
	"log"
    "net/http"

	"github.com/gin-gonic/gin"
)

const DefaultPort = "5000"

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		log.Printf("$PORT not set - using default %s", DefaultPort)
		port = DefaultPort
	}

	router := gin.New()
	router.Use(gin.Logger())

	router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello World!")
	})

    router.Run(":" + port)
}
