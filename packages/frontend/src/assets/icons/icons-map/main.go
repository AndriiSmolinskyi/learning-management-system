package main

import (
	"bufio"
	"bytes"
	"math"
	"os"
	"path/filepath"
	"text/template"
)

type Icon struct {
	Path string
	Name string
	Size float64
}

func roundFloat(val float64, precision uint) float64 {
	ratio := math.Pow(10, float64(precision))
	return math.Round(val*ratio) / ratio
}

func formIconsMap() {
	var icons []Icon

	filepath.Walk("../", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			panic(err.Error())
		}

		if filepath.Ext(info.Name()) == ".svg" {
			icons = append(icons, Icon{
				Path: "../../" + info.Name(),
				Name: info.Name(),
				Size: roundFloat(float64(info.Size())/1024, 2),
			})
		}

		return nil
	})

	templatesPath := []string{"./templates/content.tmpl", "./templates/footer.tmpl", "./templates/header.tmpl", "./templates/page.tmpl"}

	templates, err := template.ParseFiles(templatesPath...)
	if err != nil {
		panic(err)
	}

	var processed bytes.Buffer

	templates.ExecuteTemplate(&processed, "page", icons)

	outputPath := "./static/index.html"

	f, err := os.Create(outputPath)
	if err != nil {
		panic(err)
	}

	w := bufio.NewWriter(f)
	w.WriteString(processed.String())
	w.Flush()
}

func main() {
	formIconsMap()
}
