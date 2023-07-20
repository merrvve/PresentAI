import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, ViewChild } from '@angular/core';
import { getBaseUrl } from '../../main';
import { IResultDto } from '../Model/i-result-dto';
import { iImage } from '../Model/iImage';
import { iSlide } from '../Model/iSlide';
import { OpenaiService } from '../services/openai.service';
import { PdfTextExtractionService } from '../services/pdf-text-extraction.service';
import { createClient } from 'pexels';
import { iContact } from '../Model/iContact';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { iArticlePart } from '../Model/iArticlePart';

//import { blob } from 'stream/consumers';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  @ViewChild("processDiv") processDiv;
  public fileToUpload: File;
  public error: string = "";
  public input: string = "";
  public output: string = "";
  public isLoading: boolean;
  public isComplete: boolean = false;
  public slides: iSlide[]=[];
  public status: IResultDto = {id:0, text:"No Document"};
  public baseUrl = getBaseUrl();
  public title: string = "";
  public step1: boolean = true;
  public step2: boolean = true;
  public step3: boolean = true;
  public selectedTemp: number = 1;
  public errorCount: number = 0;
  public downloadFile: IResultDto;
  public isSum: boolean = false;
  public statusLoad: string = "";
  public sendd: iImage[] = [];
  public images: any[] = [];
  public selectedImageIndices: number[] = [];
  public isStarted: boolean = false;
  public comment: string = "";
  public article: iArticlePart[] = [];
  public showId: number = -1;
  selectedLanguage: string ="gb-eng";
  public selectedParts: number[] = [];
  supportedLanguages = [
    { value: 'gb-eng', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'tr', label: 'Turkish' },
    { value: 'in', label: 'Indian' },  ]

  constructor(private sanitizer: DomSanitizer, private os: OpenaiService, private http: HttpClient, private pdfTextExtractionService: PdfTextExtractionService) {

  }

  FocusProcess() {
    this.processDiv.nativeElement.focus();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: Event) {
    this.onDeleteFiles();
  }


  async onCreateSlide() {
   // this.isStarted = true;
    this.slides = [];
    this.error = "";
    this.step1 = true;
    this.step2 = false;
    this.step3 = false;
    this.isComplete = false;
    this.status.text = "";
    this.FocusProcess();
    this.isLoading = true;
    
    
this.step2openai();
    //if (this.isSum) {
    //  try {
    //    this.isLoading = true;
    //    this.output = await this.os.getDataFromOpenAI(this.input,1);
    //    if (this.output.length > 1 && this.step2 == false) {
    //      this.step1 = true;
    //      this.step2openai();
    //    }
    //    console.log(this.step1);
    //  } catch (error) {

    //    this.error = "Error occured while contacting to OpenAI. Please retry after a few minutes";
    //    let errorlog: IResultDto = { id: 1, text: this.error + new Date().toString() }
    //    this.http.post<IResultDto>(this.baseUrl + "Contact/errorlog", errorlog).subscribe(result => { console.log(result) }, error => console.log(error));

    //    this.isLoading = false;
    //    this.errorCount += 1;
    //    console.error(error);
    //    return;
    //  } finally {


    //  }
    //}
    //else {
      
    //  this.output = this.input;
    //  this.step2openai();
    //  this.step1 = true;
    //}
       

  }


  async step2openai() {
    this.error = "";
    this.step2 = false;
    this.step3 = false;
    this.isComplete = false;
   


   
    let inputs: string[] = this.partInput(this.input);
    let outputs: string[] = [];
    let slideP: iSlide[] = [];
    let result: string = "";
    let part = "";
    let language = this.getLanguageLabel(this.selectedLanguage);
    let s: iSlide; 
    for (let i = 0; i < inputs.length; i++) {
      this.statusLoad = i + "/" + inputs.length;
      part = "This is part " + (i + 1) + " of " + inputs.length + " of the text";
      console.log(part);
      console.log(this.statusLoad);
     

      try {
        result = await this.os.getDataFromOpenAI(inputs[i], 2 ,part, language);
        outputs.push(result);
        this.statusLoad = inputs.length + "/" + inputs.length;
        outputs[i] = this.correctOutput(outputs[i]);
        s = JSON.parse(outputs[i]);
        console.log(s);
        slideP = slideP.concat(s);
        this.slides = this.slides.concat(s);

        
      }
      catch(error) {
        console.error(error);
        this.error = "Error occured while contacting OpenAI. Please try again after a few minutes.";

        let errorlog: IResultDto = { id: 1, text: this.error + new Date().toString() }
        this.http.post<IResultDto>(this.baseUrl + "Contact/errorlog", errorlog).subscribe(result => { console.log(result) }, error => console.log(error));

        this.errorCount += 1;
      }
      
    }
    this.step2 = true;
    console.log(outputs);
    //for (let j = 0; j < outputs.length; j++) {
    //  outputs[j] = this.correctOutput(outputs[j]);
    //  try {
    //    s = JSON.parse(outputs[j]);
    //    console.log(s);
    //    slideP = slideP.concat(s);
    //    this.slides = this.slides.concat(s);
    //  }
    //  catch (error) {
       
    //    let errorlog: IResultDto = { id: 1, text: error + new Date().toString() }
        
    //    this.errorCount += 1;
    //    if (this.errorCount < 2) {
    //      for (let k = 0; k < outputs.length; k++) {
    //        outputs[k] = await this.os.getDataFromOpenAI(outputs[k], 3,part, language);
    //      }
    //      for (let k = 0; k < outputs.length; k++) {
    //        try {
    //          s = JSON.parse(outputs[j]);
    //          console.log(s);
    //          slideP = slideP.concat(s);
    //        }
    //        catch (error) {
    //          this.error = "Error occured while generating slides. Please try again in a few minutes.";
    //          this.http.post<IResultDto>(this.baseUrl + "Contact/errorlog", errorlog).subscribe(result => { console.log(result) }, error => console.log(error));

    //          this.isLoading = false;
    //          return;
    //        }
    //      }

    //    }
    //    else {
    //      this.error = "Error occured while generating slides.";
    //      this.http.post<IResultDto>(this.baseUrl + "Contact/errorlog", errorlog).subscribe(result => { console.log(result) }, error => console.log(error));

    //      this.isLoading = false;
    //      return;
    //    }
    //  }
     
    //}

    console.log(slideP);

    this.onGetPptx(slideP);
  
  }




  onGetPptx(slides: iSlide[]) {
    this.error = "";
    this.step3 = false;
    this.isComplete = false;
    this.isLoading = true;
    if (PdfTextExtractionService.imagePaths.length > 0) {
      let cont = PdfTextExtractionService.imagePaths.toString();
      if (cont != "" || cont != null) {
        slides.push({ id: 1, title: "images", content: cont });

      }

    }
    slides = slides.reverse();
    slides.push({ id: 0, title: this.title, content: "By PresentAI" });

    let i: number = 0;
    slides.forEach(function (slide) {
      slide.id = i;
      i += 1;

    });
    i = 0;
    console.log(slides);
    //this.http.post(this.baseUrl + 'Pptx/addImages', this.sendd).subscribe(result => {

    this.http.post(this.baseUrl + 'Pptx/create/' + this.selectedTemp, slides)
      .subscribe((result: any) => {

        console.log(result);
        this.downloadFile= result;
          this.isComplete = true;
          this.step3 = true;
          this.isLoading = false;
          
          this.error = "";
          this.title = "";
        this.status.text = "Your file is ready for use. The download will commence automatically. In case it doesn't start, you can manually download the file by clicking on the green button with the .pptx icon. If you would like to generate a different presentation, you can try again. \n Each attempt will result in a unique and distinct presentation."
        this.onDownload(this.downloadFile);
        let errorlog: IResultDto = { id: 1, text: "Success" + new Date().toString() }
          this.http.post<IResultDto>(this.baseUrl + "Contact/errorlog", errorlog).subscribe(result => { console.log(result) }, error => console.log(error));
          //  let im: ImageDto[] = [{ id: 1, imagePath:"path" }]
        }, error => console.error(error));





     // console.log(result)
    //}, error => console.log(error));

   
  }

  async onTry() {
    
    let slides: iSlide[] = [{ id: 1, title: "örnek1", content: "örnek1" }, { id: 2, title: "örnek2", content:"2" }];
    //slides.push({ id: 1, title: "images", content: "2yiuokol.hkn.jpg" });
    slides = slides.reverse();
    slides.push({ id: 0, title: this.title, content: "By PresentAI" });

    //let i: number = 0;
    //slides.forEach(function (slide) {
    //  slide.id = i;
    //  i += 1;

    //});
    //i = 0;
    //console.log(slides);
    ////this.http.post(this.baseUrl + 'Pptx/addImages', this.sendd).subscribe(result => {
    
    this.http.post(this.baseUrl + 'Pptx/addSlides/' + "2eoggvlb.cpj.pptx", slides)
      .subscribe((result: any) => {

        console.log(result);
       

            });
    
}
  correctOutput(inputString: string) {

   
    let result: string = "";
    const regex: RegExp = /{([^}]+)}/g;
    const matches: RegExpMatchArray | null = inputString.match(regex);

    if (matches !== null) {
      for (const match of matches) {
       
        result += match + ","
      }
      result= result.slice(0, -1);
    }
    let i = this.nthIndex(result, '{', 2);
    if ( i < result.indexOf('}')) {
      result = result.slice(i);
    }

    result = "[ " + result + " ]";
  

    return result;
  }

  nthIndex(str, pat, n) {
    var L = str.length, i = -1;
    while (n-- && i++ < L) {
      i = str.indexOf(pat, i);
      if (i < 0) break;
    }
    return i;
  }

  onSelectTemp(t: number) {
    this.selectedTemp = t;
  }

  onDownload(downloadFile: IResultDto) {
    let downloadUrl = "";
    this.http.post(this.baseUrl + "Pptx/getPptx", downloadFile, { responseType: 'blob' })
      .subscribe((blob: any) => {

        const url = window.URL.createObjectURL(blob);
        downloadUrl = url;
        this.isComplete = true;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'NewPresentation.pptx';
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        //  let im: ImageDto[] = [{ id: 1, imagePath:"path" }]
      }, error => console.error(error));


  }

  onDeleteFiles() {
    this.http.delete(this.baseUrl + 'Pptx').subscribe((result) => { console.log(result) }, error => console.log(error));
    this.http.delete(this.baseUrl + 'Pptx/deleteImages').subscribe((result) => { console.log(result) }, error => console.log(error));

  }

  reloadPage() {
   
    window.location.reload();
  }

  //onExtractPdf() {
  //  this.http.get<IResultDto>(this.baseUrl + 'Pdf/pdftotext').subscribe((result) => { console.log(result.text) }, error => console.log(error));
  //}

  

  onFileUpload(event: Event) {
    if (document.getElementById("imageView")) {
      document.getElementById("imageView").innerHTML = "";
     
    }
    if ((event.target as HTMLInputElement).files[0].size > 5097152) {
      window.alert("File is too big!");
      (event.target as HTMLInputElement).value = null;
      return;
    }
    else {
      this.fileToUpload = (event.target as HTMLInputElement).files[0];
      //this.onDeleteFiles();
      console.log(this.fileToUpload.name);

    }
    

  }


  onExtractText(): void {
    if (this.fileToUpload) {
      this.pdfTextExtractionService.extractText(this.fileToUpload)
        .then((text: string) => {
          
          this.article = this.pdfTextExtractionService.annotationOfText(text);
          this.title = this.pdfTextExtractionService.title;
          this.input = this.title;

          for (let i = 0; i < this.article.length; i++) {
           // if (!this.article[i].annotation.includes("Abstract") && !this.article[i].annotation.includes("References") && !this.article[i].annotation.includes("Summary")) {
              this.input += this.article[i].text;

            //}
          }
          console.log(this.input)

          //this.pdfTextExtractionService.imagePaths.forEach((x) => { this.filePathList.push({ id:1, text: "aa" }); console.log(x) });
          
          //this.sendd = [];
          //console.log(PdfTextExtractionService.imagePaths);
          //for (var i = 0; i < PdfTextExtractionService.imagePaths.length; i++) {

          //  this.sendd.push({ imagePath: PdfTextExtractionService.imagePaths[i] });
            
          //}
         
         // this.http.post(this.baseUrl + 'Pptx/addImages', this.sendd).subscribe(result => { console.log(result)});
         // console.log(this.sendd);

        })
        .catch((error) => {
          console.error('Error extracting text:', error);
        });
   
    }
  }

  dontSum() {
    if (this.isSum == true) {
      this.isSum = false;
    }
    else {
      this.isSum = true;
    }
    console.log(this.isSum);
  }

  async genTitle() {

    if (this.input.length > 50 && !this.fileToUpload) {
      try {
        console.log("gentitle");
        this.title = await this.os.getDataFromOpenAI(this.input, 0,"","");
        this.title = this.extractSubstringBetweenQuotes(this.title);
        //if (this.title.length>1) {
        //  this.onSearchGoogle(this.title);
        //}
        //else {
        //  this.onSearchGoogle(this.input.substr(0, 25));
        //  console.log("no title");
        //}
        console.log(this.title);
      }
      catch(error) {
        console.log(error);
      }
    }
    else {
      this.title = "No Title";
    }
  }

  extractSubstringBetweenQuotes(input: string): string {
    const regex = /"(.*?)"/;
    const match = input.match(regex);

    if (match && match.length >= 2) {
      return match[1];
    }

    return input;
  }

  partInput(inputToPart: string) {
    let partedInput: string[] =[];
    if (inputToPart.length > 0 && inputToPart.length < 6501) {
      partedInput.push(inputToPart);
    }
    else if (inputToPart.length > 6500 && inputToPart.length < 15001) {
      let sliceP: number = inputToPart.substr(6500, 8000).indexOf('.');
      partedInput.push(inputToPart.slice(0, sliceP + 6500));
      partedInput.push(inputToPart.slice(sliceP + 6500));
    }
    else if (inputToPart.length > 15000 && inputToPart.length < 20001) {
      let sliceP: number = inputToPart.substr(6500, 8000).indexOf('.');
      let sliceP2: number = inputToPart.substr(14000, 15000).indexOf('.');
      partedInput.push(inputToPart.slice(0, sliceP + 6500));
      partedInput.push(inputToPart.slice(sliceP + 6500, sliceP2 + 14000));
      partedInput.push(inputToPart.slice(sliceP2 + 14000));
    }
    else if (inputToPart.length > 20000) {
      let sliceP: number = inputToPart.substr(6500, 8000).indexOf('.');
      let sliceP2: number = inputToPart.substr(14000, 15000).indexOf('.');
      partedInput.push(inputToPart.slice(0, sliceP + 6500));
      partedInput.push(inputToPart.slice(sliceP + 6500, sliceP2 + 14000));
      partedInput.push(inputToPart.slice(sliceP2 + 14000, 20000));
    }
    console.log(partedInput);
    return partedInput;
  }

  convertToJsonString(filePath: string): string {
    const escapedPath = filePath.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  const jsonString = `"${escapedPath}"`;

  return jsonString;
}
 

  onSearchGoogle(query: string ) {
    this.http.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        key: 'AIzaSyAhn4M2k3Soy-HP6wzjglE2sHEoAYkl5Wc',
        cx: 'f578345e7c8aa424a',
        q: query,
        searchType: 'image'
      }
    }).subscribe(
      (result : any) => {
        console.log(result);
        
        for (var i = 0; i < 5; i++) {
          this.images.push({
            id: 'img' + i,
            src: result.items[i].link,
            value: i
          });
         
          //var image = new Image();
          //image.id = "img" + i;
          ////image.onclick = this.onClickImage(i);
          //this.imageIds.push(image.id);
          //image.src = result.items[i].link;
        
          //document.getElementById("imageView2").appendChild(image);
        }
      },
      error => console.error('There was an error:', error)
    );
  }
  onClickImage(index: number) {
    // Toggle the selection of the image
    if (this.selectedImageIndices.includes(index)) {
      // If already selected, remove from selection
      this.selectedImageIndices = this.selectedImageIndices.filter(i => i !== index);
    } else {
      // Otherwise, add to selection
      this.selectedImageIndices.push(index);
    }
    console.log('Selected Image Indices:', this.selectedImageIndices);
  }

  isSelected(index: number): boolean {
    // Check if the image is selected
    return this.selectedImageIndices.includes(index);
  }
  onSearchPexels() {
    const client = createClient('wEQcx6Zfz97qXZPoxyyUlTZL1FpqQmhcKeje6H96dlPY3jsOJ8oyyMuE');
    const query = 'about anthony hopkins';
    let photosPexels: any
    client.photos.search({ query, per_page: 5 }).then(photos => {
      photosPexels = photos
      for (var i = 0; i < 5; i++) {
        var image = new Image();
        image.src = photosPexels.photos[i].src.small;
      
        document.getElementById("imageView2").appendChild(image);


      }



      


      console.log(photos)
    });
   
  }

  onComment() {
    let contact: iContact = { name: "", email: "", message: this.comment };
    this.http.post<iContact>(this.baseUrl + "Contact", contact).subscribe(result => { console.log(result) }, error => console.log(error));
  }


  selectLanguage(language: string) {
    this.selectedLanguage = language;
    console.log(this.selectedLanguage);

  }

  getLanguageLabel(language: string) {
    const selectedLanguage = this.supportedLanguages.find(lang => lang.value === language);
    return selectedLanguage ? selectedLanguage.label : '';
  
  }


  onCancelRequest() {
    this.os.cancelRequest();
  }

  onShowText(i: number) {
    if (this.showId == i) {
      this.showId = -1;
    }
    else {
      this.showId = i;
    }
    
  }
  onAddPart(i: number) {
    this.selectedParts.push(i);
  }
  onRemovePart(i: number) {
    let index = this.selectedParts.indexOf(i);
    if (index > -1) {
      this.selectedParts.splice(index, 1);
    }
  
  }

  isSelectedPart(i: number) {
    console.log(this.selectedParts);
    if (this.selectedParts.includes(i)) {
      return true;
    }
    else {
      return false;
    }
  }

  onOrganise() {
    if (this.fileToUpload) {
      let out = this.title;
      for (let i = 0; i < this.article.length; i++) {
        if (this.selectedParts.includes(i)) {
          out += this.article[i].text;
        }
      }
      this.input = out;
    }

  }
}
