package server

import (
	"github.com/bitly/go-simplejson"
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"testing"
)

func TestSearch(t *testing.T) {
	app := App()

	// Uses hardcoded data from the current testing database
	Convey("when a listing is inserted", t, func() {
		Convey("a search on a word in its title returns it", func() {
			keyword := "ignore"
			req, _ := http.NewRequest("GET", "/api/search/"+keyword, nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldContainSubstring, "application/json")
			So(res.Body.String(), shouldBeJSON)

			result, err := simplejson.NewJson([]byte(res.Body.String()))
			So(err, ShouldBeNil)

			resultAsArray, err := result.Array()
			So(err, ShouldBeNil)
			So(len(resultAsArray), ShouldEqual, 1)

			listing := result.GetIndex(0)
			So(listing.Get("userId").MustInt(), ShouldEqual, 1)
			So(listing.Get("title").MustString(), ShouldContainSubstring, keyword)
		})

		Convey("a search on a word in its description returns it", nil)

		Convey("a search on two words in its title/description returns it exactly once", nil)

		Convey("searching a word that is not in the title/description will not return it", nil)

		Convey("searching a word that is in multiple listings returns both", nil)

	})
}
