package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
)

func isJSONString(s string) bool {
	var js string
	return json.Unmarshal([]byte(s), &js) == nil
}

// https://semaphoreci.com/community/tutorials/building-and-testing-a-rest-api-in-go-with-gorilla-mux-and-postgresql
func executeRequest(app http.Handler, req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	app.ServeHTTP(rr, req)

	return rr
}

func shouldHaveContentType(actual interface{}, expected ...interface{}) string {
	expectedHeader, ok := expected[0].(string)
	if !ok {
		return "the expected header should be a string"
	}

	response, ok := actual.(*httptest.ResponseRecorder)
	if !ok {
		return "expected a ResponseRecorder"
	}

	actualHeader := response.Header().Get("Content-Type")
	if strings.Contains(expectedHeader, actualHeader) {
		return fmt.Sprintf("expected Content-Type to contain %s, got %s", expectedHeader, actualHeader)
	}

	return ""
}

// http://stackoverflow.com/a/22129435/237904
func shouldBeJSON(actual interface{}, expected ...interface{}) string {
	testStr, ok := actual.(string)
	if !ok {
		return "expected a string, got not a string"
	}

	var js json.RawMessage
	if err := json.Unmarshal([]byte(testStr), &js); err != nil {
		return fmt.Sprintf("expected %s to be JSON", testStr)
	}

	return ""
}
