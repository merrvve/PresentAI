import { Injectable } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';
import { filter, from, map, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  readonly apiKey: string = "";
  public configuration = new Configuration({
    apiKey: this.apiKey
  });

  private requestSubscription: Subscription;
  private isCancelled = false;
 
  public openai;
  
  constructor() {
    delete this.configuration.baseOptions.headers['User-Agent'];
    this.openai = new OpenAIApi(this.configuration);
  }

  splitString(str: string): string[] {
  const maxLength = 200;
  const result: string[] = [];

  for (let i = 0; i < str.length; i += maxLength) {
    const substring = str.substr(i, maxLength);
    result.push(substring);
  }

  return result;
}

  async getDataFromOpenAI(text: string, mod: number, part: string, language: string): Promise<string> {

   
    if (mod == 0) {
      text = "Provide a title for this text: " + text.substr(0,50);
    }
    if (mod == 1) {
      text = "Provide a summary of the given text for a presentation content with the key points or main ideas in the text: " + text;
    }
    if (mod == 2) {
      text = "Organise this content into summarised slides for a coherent and engaging presentation in " + language + " language. Give the result as a valid JSON array of objects. Use slash before all double quotes. Don't use double quotes inside content.  Sample result: [{    \"id\": \"id\", \"title\": \"Slide title\", \"content\": \"line1. 'single quote content' \" }] " + part + text;

    }
    if (mod == 3) {
      text = "Correct this JSON object result as a valid JSON array of objects. Use slash before all double quotes.  Sample result: [{    \"id\": \"id\", \"title\": \"Slide title\", \"content\": \"line1. 'content with single quote'\" }]" + text;

    }

    if (mod == 4) {
      text = "Organise this content into summarised slides for a coherent and engaging presentation in. Give the result as a typsecript variable that is a list of slide objects with 'id', 'title' and 'content' properties. Don't use double quotes in the content:" + text;

    }
    //Create powerpoint slides by summarising this text, first slide should just contain title: 
    


      try {
        this.isCancelled = false;
        const result: string = await new Promise((resolve, reject) => {
          this.requestSubscription = from(this.openai.createCompletion({
            model: "text-davinci-003",
            prompt: text,
            max_tokens: 2000
          })).pipe(
            filter((resp: any) => !!resp && !!resp.data),
            map((resp: any) => resp.data),
            filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].text),
            map((data: any) => data.choices[0].text)
          ).subscribe({
            next: (data: string) => resolve(data),
            error: (error: any) => reject(error)
          });
        });

        console.log(result);
        return result;
      } catch (error) {
        console.error(error);
        throw error;
      }

    //  const result: string = await new Promise((resolve, reject) => {
    //    from(this.openai.createCompletion({
    //      model: "text-davinci-003",
    //      prompt: text,
    //      max_tokens: 2000
    //    })).pipe(
    //      filter((resp: any) => !!resp && !!resp.data),
    //      map((resp: any) => resp.data),
    //      filter((data: any) => data.choices && data.choices.length > 0 && data.choices[0].text),
    //      map((data: any) => data.choices[0].text)
    //    ).subscribe({
    //      next: (data: string) => resolve(data),
    //      error: (error: any) => reject(error)
    //    });
    //  });

    //  console.log(result);
    //  return result;
    //} catch (error) {
    //  console.error(error);
    //  throw error;
    //}

  }
  cancelRequest() {
    this.isCancelled = true;
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }
  }




}
