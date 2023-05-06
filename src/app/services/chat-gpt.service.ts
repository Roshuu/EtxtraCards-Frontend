
import { Injectable } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private openai: OpenAIApi;
  configuration = new Configuration({
    apiKey: "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",
  });

  constructor() {
    this.openai = new OpenAIApi(this.configuration);
  }

  generateText(prompt: string):Promise<string | undefined>{
    return this.openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt: prompt,
      max_tokens: 256
    }).then(response => {
      return response.data.choices[0].text;
    }).catch(error=>{
      return 'gg';
    });
  }
}
