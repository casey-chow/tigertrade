package server

import (
	"fmt"
	"log"

	"github.com/buaazp/fasthttprouter"
	"github.com/valyala/fasthttp"
)

func Index(ctx *fasthttp.RequestCtx) {
	fmt.Fprint(ctx, "Welcome dude!!\n")
}

func Hello(ctx *fasthttp.RequestCtx) {
	fmt.Fprintf(ctx, "hello, %s!\n", ctx.UserValue("name"))
}

func Main() {
	fmt.Errorf("test")
	router := fasthttprouter.New()
	router.GET("/", Index)
	router.GET("/hello/:name", Hello)

	fmt.Printf("Listening on port 3000")
	log.Fatal(fasthttp.ListenAndServe(":3000", router.Handler))
}
