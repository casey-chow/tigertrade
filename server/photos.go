package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	// "github.com/casey-chow/tigertrade/server/models"
	"bytes"
	"github.com/disintegration/imaging"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"github.com/satori/go.uuid"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"net/http"
)

func CreatePhoto(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if !isAuthenticated(r) {
		Error(w, http.StatusUnauthorized)
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while reading uploaded file")
		Error(w, http.StatusInternalServerError)
		return
	}
	defer file.Close()

	fileUUID := uuid.NewV4().String()
	path := "/photos/" + fileUUID + "/" + fileHeader.Filename

	img, imgType, err := image.Decode(file)
	if err != nil || (imgType != "jpeg" && imgType != "gif" && imgType != "png") {
		if err != nil {
			log.WithError(err).Error("error while parsing image")
		}
		Error(w, http.StatusUnsupportedMediaType)
		return
	}

	resized, err := resizeImage(img, imgType)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while resizing photo")
		Error(w, http.StatusInternalServerError)
		return
	}

	res, err := uploader.Upload(&s3manager.UploadInput{
		Bucket:       aws.String("tigertrade"),
		CacheControl: aws.String("max-age=31536000, public"),
		Key:          aws.String(path),
		Body:         resized,
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

func resizeImage(img image.Image, imgType string) (*bytes.Buffer, error) {
	var err error
	newImg := imaging.Fit(img, 900, 900, imaging.Lanczos)
	outBuf := new(bytes.Buffer)

	if imgType == "gif" {
		err = gif.Encode(outBuf, newImg, nil)
	} else if imgType == "jpeg" {
		err = jpeg.Encode(outBuf, newImg, &jpeg.Options{Quality: 60})
	} else {
		err = png.Encode(outBuf, newImg)
	}

	return outBuf, err
}
