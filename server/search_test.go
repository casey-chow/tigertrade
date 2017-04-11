package server

import (
//	"encoding/json"
	"fmt"
	"github.com/buger/jsonparser"
    . "github.com/smartystreets/goconvey/convey"
	"net/http"
    "testing"
)

func TestSearch(t *testing.T) {
    app := App()

	// Uses hardcoded data from the current testing database
    Convey("When a listing is inserted,", t, func() {
        Convey("a search on a word in its title returns it", func() {
			keyword := "ignore"
			req, _ := http.NewRequest("GET", fmt.Sprintf("/api/search/%s", keyword), nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldEqual, "application/json;charset=utf-8")
			So(isJSON(res.Body.String()), ShouldBeTrue)

			body := []byte(res.Body.String())
			fUcKgO, _, _, err := jsonparser.Get(body)
			value := string(fUcKgO)
			So(err, ShouldBeNil)
			So(value, ShouldNotBeEmpty)
			So(value, ShouldHaveLength, 1)
//			user_id, _, _, err := jsonparser.Get(value[0])
//			So(v[0]["user_id"], ShouldEqual, 1)
//			So(v[0]["title"], ShouldContain, keyword)
//			So(v[0]["description"], ShouldContain, keyword)
		})
        Convey("a search on a word in its description returns it", func() {
			So(nil, ShouldNotBeNil)
		})
		Convey("a search on two words in its title/description returns it exactly once", func() {
			So(nil, ShouldNotBeNil)
		})
		Convey("searching a word that is not in the title/description will not return it", func() {
			So(nil, ShouldNotBeNil)
		})
		Convey("searching a word that is in multiple listings returns both", func() {
			So(nil, ShouldNotBeNil)
		})
    })
}
