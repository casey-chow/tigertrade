package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"github.com/satori/go.uuid"
	"net/http"
)

// CreatePhoto uploads the photo in r to Amazon S3 and writes its location to w
func CreatePhoto(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while retrieving photo")
		Error(w, http.StatusInternalServerError)
		return
	}
	defer file.Close()

	fileUUID := uuid.NewV4().String()
	path := "/photos/" + fileUUID + "/" + fileHeader.Filename

	res, err := uploader.Upload(&s3manager.UploadInput{
		Bucket:       aws.String("tigertrade"),
		CacheControl: aws.String("max-age=31536000, public"),
		Key:          aws.String(path),
		Body:         file,
	})
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while uploading photo")
		Error(w, http.StatusInternalServerError)
		return
	}

	log.WithField("location", res.Location).Info("successfully uploaded file")

	w.WriteHeader(http.StatusCreated)
	Serve(w, map[string]string{
		"location": res.Location,
	})
}
