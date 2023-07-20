import { Injectable } from '@angular/core';

import pptxgen from "pptxgenjs";


@Injectable({
  providedIn: 'root'
})
export class PptxjsService {

  constructor() { }

  createPres() {
    const pptx = new pptxgen();
    const LAYOUT_NAME = 'CUSTOM_LAYOUT';
    pptx.defineSlideMaster({
      title: LAYOUT_NAME,
      background: { color: 'F7F7F7' },
      objects: [
        // Add a 'title' placeholder
        { placeholder: { options: { name: 'title', type: 'title', x: 1.0, y: 0.5, w: 8.0, h: 1.5, fontSize: 28, align: 'center' }, text: 'Title Area' } },
        // Add a 'content' placeholder
        { placeholder: { options: { name: 'content', type: 'body', x: 1.0, y: 2.0, w: 8.0, h: 4.0, fontSize: 20, align: 'left' }, text: 'Content Area' } },
      ],
    });

    // Add a slide using the custom layout
    const slide = pptx.addSlide({ masterName: LAYOUT_NAME });

    // Add title and content
    slide.addText('Custom Slide Title', { placeholder: 'title' });
    slide.addText('This is the custom content area where you can add text.', { placeholder: 'content' });

    // Add an image to the slide
  
    // Save the presentation
    pptx.writeFile({ fileName: "Sample Presentation.pptx" });
  }
}
