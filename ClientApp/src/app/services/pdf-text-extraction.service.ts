import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import { promisify } from 'util';
import { getBaseUrl } from '../../main';
import { iArticlePart } from '../Model/iArticlePart';

@Injectable({
  providedIn: 'root'
})
export class PdfTextExtractionService {
  baseUrl = getBaseUrl();
  imageUrl: string;
  public images: string[] = [];
  public title: string = "";
  public sizes: number[] = [];
  public static imagePaths: any[] = [];


  constructor(private http: HttpClient) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';
    PdfTextExtractionService.imagePaths = [];
  }

  findJpegStartSignatures(byteArray: Uint8Array): number[] {
    const firstBeginSignatureSymbol = 0xff;
    const secondBeginSignatureSymbol = 0xd8;

    const indexes = [];
    byteArray.forEach((byte, index) => {
      if (byte === firstBeginSignatureSymbol &&
        byteArray[index + 1] === secondBeginSignatureSymbol &&
        byteArray[index + 2] === firstBeginSignatureSymbol &&
        (byteArray[index + 3] >= 0xe0 && byteArray[index + 3] <= 0xef)) {
        indexes.push(index);
      }
    });
    return indexes;
  }


  extractText(file: File): Promise<string> {
    this.sizes = []
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const pdfData = new Uint8Array(event.target.result);
        this.extractJpegImagesFromPdf(pdfData, "/");

        pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf: any) => {
          const totalPages = pdf.numPages;
          const textContent: string[] = [];
          let pagePromises: Promise<pdfjsLib.PDFPageProxy>[] = [];

          for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            pagePromises.push(pdf.getPage(pageNumber));
          }

          Promise.all(pagePromises).then((pages: pdfjsLib.PDFPageProxy[]) => {
            const pageTextPromises: Promise<string>[] = [];

            pages.forEach(async (page: pdfjsLib.PDFPageProxy) => {

              pageTextPromises.push(page.getTextContent().then((textContentData: any) => {
                let lastY, text = '', lastFontSize, lastX = 0;
                for (let i = 0; i < textContentData.items.length; i++) {
                  let item = textContentData.items[i];
                  // add a new line if y position of the current item is below the last item
                  // or if the difference in y is greater than font size (blank line)
                  if (lastY != item.transform[5] && lastFontSize != item.transform[3]) {
                    
                    text += '\n[' + Math.round(item.transform[3]) + ']';
                  }
                  //if (Math.abs(lastY - item.transform[5]) > (lastFontSize*1.5)) {
                  //  text += '\n\n';
                  //}
                  if (Math.abs(lastY - item.transform[5]) > (lastFontSize * 1.5) && lastFontSize != item.transform[3]) {
                    text += '\n\n[' + Math.round(item.transform[3]) + ']';
                  }
                  if (Math.abs(lastX - item.transform[4]) > (lastFontSize * 2.5)) {
                    text += '\t';
                  }

                  text += item.str + ' ';
                  lastY = item.transform[5];
                  lastX = item.transform[4];
                  //if (lastFontSize < item.transform[3]) {
                  //  text += " ** bigger ** " + item.transform[3];
                  //}
                  //if (lastFontSize > item.transform[3]) {
                  //  text += " ** smaller ** ";
                  //}
                  lastFontSize = item.transform[3]; // keep track of font size
                  this.sizes.push(Math.round(item.transform[3]));
                }
                return text;
              }));

            });

            Promise.all(pageTextPromises).then((pageTexts: string[]) => {
              pageTexts.forEach((pageText: string) => {
                textContent.push(pageText);
              });
              resolve(textContent.join('\n'));
            }).catch((error) => {
              reject(error);
            });
          }).catch((error) => {
            reject(error);
          });
        }).catch((error) => {
          reject(error);
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }




  async extractJpegImagesFromPdf(byteArray: Uint8Array, outputDir: string): Promise<void> {
    try {
      PdfTextExtractionService.imagePaths = [];
      const startSignatures = this.findJpegStartSignatures(byteArray);

      const promises = startSignatures.map((startIndex, i) => {
        const imageBytes = byteArray.slice(startIndex);
        const blob = new Blob([imageBytes], { type: 'image/jpeg' });
        this.imageUrl = URL.createObjectURL(blob);
        this.images.push(this.imageUrl);

        var image = new Image();
        image.src = URL.createObjectURL(blob);
        document.getElementById("imageView").appendChild(image);


        const formData = new FormData();
        formData.append('image', blob, `image_${i}.jpg`);

        try {
          this.http.post(this.baseUrl + "Image/uploadImage", formData).subscribe(
            (result: any) => {
              if (result.text != "error") {
                PdfTextExtractionService.imagePaths.push(result.text)
              }
              else {
                console.log("error writing to file");
              }
            }, error => console.log(error));

          console.log(`Image ${i} uploaded successfully.`, PdfTextExtractionService.imagePaths);
        } catch (error) {
          console.error(`Failed to upload Image ${i}:`, error);
        }
      });






      await Promise.all(promises);
      console.log('Images extracted successfully');

    } catch (error) {
      console.error('Failed to extract images from PDF:', error);
    }

    //  this.http.post<ImageDto>(this.baseUrl + "Image/saveImage/", this.idto).subscribe(result => { console.log(result) }, error => console.log(error));

  }
  //convertUint8ArrayToNumberArray(uint8Array: Uint8Array): number[] {
  //  const numberArray: number[] = [];

  //  for (let i = 0; i < uint8Array.length; i++) {
  //    numberArray.push(uint8Array[i]);
  //  }

  //  return numberArray;
  //}

  annotationOfText(text: string) {
    console.log(this.sizes);
    let parts: iArticlePart[] = [];
    let textParts = text.split('\n\n');
    for (let i = 1; i < textParts.length; i++) {
      let first = textParts[i].indexOf('[');
      let second = textParts[i].indexOf(']');
      // console.log(textParts[i].substr(first + 1, second-1));
      parts.push({
        size: Number(textParts[i].substr(first + 1, second - 1)),
        text: textParts[i].substr(second + 1),
        annotation: ''
      })

    }
    parts = parts.filter(x => x.text.length > 3);
    let minSize = Math.min.apply(null, this.sizes);
    let maxSize = Math.max.apply(null, this.sizes);
    console.log(parts);
    let max = parts
      .slice(0, 5).find(x => x.size == maxSize);
    //.filter(item => item.size != undefined) // --> here
    //.reduce(function (prev, current) {
    //  return (prev.size > current.size) ? prev : current
    //}) //returns object


    if (max == null) {
      max = parts.slice(5, 10).find(x => x.size == maxSize);
      if (max == null) {
        max = { size: maxSize, text: "", annotation: "" }
      }
    } //returns object



    // parts = parts.filter(x => (x.text.match(/\n/g) || []).length != 1);
    parts = parts.filter(x => x.text.length > 50);
    let lastAnnot = "";
    for (let i = 0; i < parts.length; i++) {
      parts[i].annotation = parts[i].text.slice(0, parts[i].text.indexOf('\n') - 1)

      if (parts[i].annotation.length > 50 && i != 0) {
        parts[i].annotation = parts[i - 1].annotation;
      }
      const regex = /\[\d+\]/g;
      parts[i].text = parts[i].text.replace(regex, '');



      //if (parts[i].text.split('\n').length > 1 && parts[i].annotation != "") {
      //  parts[i].text = parts[i].text.split('\n')[1];
      //  //.slice(parts[i].text.indexOf(']'))
      //}


    }


    this.title = max.text.slice(0, max.text.indexOf('\n') - 1);
   // console.log(parts);
    parts = this.joinedObjects(parts);
    console.log(parts);
    return parts;
  }


  joinedObjects(objects: iArticlePart[]) {
    return objects.reduce((result: iArticlePart[], current: iArticlePart) => {
      const existingObject = result.find(obj => obj.annotation === current.annotation);

      if (existingObject) {
        existingObject.text += current.text; // Append the text value
      } else {
        result.push(current); // Add a new object to the result array
      }

      return result;
    }, []);
      
}
}
