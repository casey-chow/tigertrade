package server

import (
//	"fmt"
//	"github.com/appleboy/gofight"
	. "github.com/smartystreets/goconvey/convey"
//	"gopkg.in/h2non/gock.v1"
//	"net/http"
	"testing"
)

func TestSearch(t *testing.T) {
	Convey("When a listing is inserted, a search on a word in its title returns it", t,
		func() {
			So(nil, ShouldNotBeNil)
		})
	Convey("... a search on a word in its description returns it", t,
		func() {
			So(nil, ShouldNotBeNil)
		})
	Convey("... a search on two words in its title/description returns it exactly once", t,
		func() {
			So(nil, ShouldNotBeNil)
		})
	Convey("... searching a word that is not in the title/description will not return it", t,
		func() {
			So(nil, ShouldNotBeNil)
		})
}
