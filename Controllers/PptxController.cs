

using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using Drawing = DocumentFormat.OpenXml.Drawing;
using matgit.Model;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Vml;
using System.Drawing.Imaging;


namespace matgit.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PptxController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        private static List<string> tempFiles = new List<string>();

        private static List<string> images = new List<string>();

      //  private readonly ILogger<PptxController> _logger; // Logger

       // private static string presentationFile;
        public PptxController(IWebHostEnvironment HostEnvironment)
        {
            _hostEnvironment = HostEnvironment;
         //   _logger = logger;
        }



        [HttpPost("create/{temp}")]
        public ResultDto GenPresentation(List<iSlide> slides, int temp)
        {


            ResultDto resultPptx=new ResultDto(); 

            string template = System.IO.Path.Combine(_hostEnvironment.WebRootPath,"presentations", "temp" + temp + ".pptx");


            string temporary = System.IO.Path.GetRandomFileName() + ".pptx";
            resultPptx.Id= 1;
            resultPptx.text = temporary;
            string presentationFile = System.IO.Path.Combine(_hostEnvironment.WebRootPath,"presentations", temporary);

        //    string imagePath = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "img", "image.jpg");

            System.IO.File.Copy(template, presentationFile);


            InsertNewSlide(presentationFile, 1, slides.GetRange(0,slides.Count));
            if (slides[0].title=="images")
            {
                string[] imagesAdd = slides[0].content.Split(",");

                // AddImageToPptx(presentationFile, imagePath);
                InsertNewSlideWithImg(presentationFile, slides.Count+1, imagesAdd);

            }

            DeleteSlide(presentationFile, 0);
            DeleteSlide(presentationFile, 1);
            tempFiles.Add(presentationFile);
            //FileStream fs = new FileStream(presentationFile, FileMode.Open, FileAccess.Read);

            //System.IO.File.Delete(presentationFile);
            //return File(fs, "application/vnd.openxmlformats-officedocument.presentationml.presentation", "NewPresentation.pptx");
            return resultPptx;
        }

        [HttpPost("addSlides/{presentationFile}")]
        public ResultDto AddSlidesToPresentation(List<iSlide> slides, string presentationFile)
        {


            ResultDto resultPptx = new ResultDto();
            resultPptx.text= presentationFile;
            //string template = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "presentations", "temp" + temp + ".pptx");


            //string temporary = System.IO.Path.GetRandomFileName() + ".pptx";
            //resultPptx.Id = temp;
            //resultPptx.text = temporary;
             presentationFile = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "presentations", presentationFile);

            ////    string imagePath = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "img", "image.jpg");

            //System.IO.File.Copy(template, presentationFile);


            InsertNewSlide(presentationFile, -1, slides.GetRange(0, slides.Count));
            //if (slides[0].title == "images")
            //{
            //    string[] imagesAdd = slides[0].content.Split(",");

            //    // AddImageToPptx(presentationFile, imagePath);
            //    InsertNewSlideWithImg(presentationFile, slides.Count + 1, imagesAdd);

            //}

            //DeleteSlide(presentationFile, 0);
            //DeleteSlide(presentationFile, 1);
            //tempFiles.Add(presentationFile);
            ////FileStream fs = new FileStream(presentationFile, FileMode.Open, FileAccess.Read);

            ////System.IO.File.Delete(presentationFile);
            ////return File(fs, "application/vnd.openxmlformats-officedocument.presentationml.presentation", "NewPresentation.pptx");
            return resultPptx;
        }



        [HttpDelete]
        public List<string> DeleteTempFiles ()
        {
            //  foreach(string t in tempFiles)
            //{
            //  System.IO.File.Delete(t);
            //}
            tempFiles.Clear();
            return tempFiles;
           // 
        }

        [HttpDelete("deleteImages")]
        public List<string> DeleteImages()
        {
            foreach (string im in images)
            {
                System.IO.File.Delete(System.IO.Path.Combine(_hostEnvironment.WebRootPath,"img",im));
            }
            images.Clear();
            return images;
            // 
        }


        [HttpPost("getPptx")]
        public FileStreamResult GetPresentation(ResultDto fileName)
        {
            string presentationFile = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "presentations", fileName.text);
            FileStream fs = new FileStream(presentationFile, FileMode.Open, FileAccess.Read);

            //System.IO.File.Delete(presentationFile);
            return File(fs, "application/vnd.openxmlformats-officedocument.presentationml.presentation", "NewPresentation.pptx");


        }

        // Insert a slide into the specified presentation.


        // Insert a slide into the specified presentation.
        public void InsertNewSlide(string presentationFile, int position, List<iSlide> slides)
        {

            // Open the source document as read/write. 
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true))
            {
                InsertNewSlide(presentationDocument, 1, slides.Last().title, slides.Last().content);
                foreach (iSlide s in slides.GetRange(0, slides.Count - 1))
                {
                 
                    if(s.title!="images")
                    {
                        
                        // Pass the source document and the position and title of the slide to be inserted to the next method.
                        InsertNewSlide(presentationDocument, 3, s.title, s.content);

                    }
            
                }

            }
        }






   

        // Insert the specified slide into the presentation at the specified position.
        public static void InsertNewSlide(PresentationDocument presentationDocument, int position, string slideTitle, string slideContent)
        {

            if (presentationDocument == null)
            {
                throw new ArgumentNullException("presentationDocument");
            }

            if (slideTitle == null)
            {
                throw new ArgumentNullException("slideTitle");
            }

            if (slideContent == null)
            {
                throw new ArgumentNullException("slideContent");
            }
            string putContent = "";
            if (slideContent!="") {
                string[] sentences = Regex.Split(slideContent, @"(?<=[\.!\?])\s+");
                foreach (string sentence in sentences)
                {
                    putContent += sentence + "\r\n";
                }
                putContent = putContent.Substring(0,putContent.Length-2);
            }
           
           
            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Verify that the presentation is not empty.
            if (presentationPart == null)
            {
                throw new InvalidOperationException("The presentation document is empty.");
            }

            // Declare and instantiate a new slide.
            Slide slide = new Slide(new CommonSlideData(new ShapeTree()));
            uint drawingObjectId = 1;

            // Construct the slide content.            
            // Specify the non-visual properties of the new slide.
            NonVisualGroupShapeProperties nonVisualProperties = slide.CommonSlideData.ShapeTree.AppendChild(new NonVisualGroupShapeProperties());
            nonVisualProperties.NonVisualDrawingProperties = new NonVisualDrawingProperties() { Id = 1, Name = "" };
            nonVisualProperties.NonVisualGroupShapeDrawingProperties = new NonVisualGroupShapeDrawingProperties();
            nonVisualProperties.ApplicationNonVisualDrawingProperties = new ApplicationNonVisualDrawingProperties();

            // Specify the group shape properties of the new slide.
            slide.CommonSlideData.ShapeTree.AppendChild(new GroupShapeProperties());








            // Declare and instantiate the title shape of the new slide.
            DocumentFormat.OpenXml.Presentation.Shape titleShape = slide.CommonSlideData.ShapeTree.AppendChild(new DocumentFormat.OpenXml.Presentation.Shape());

            drawingObjectId++;

            // Specify the required shape properties for the title shape. 
            titleShape.NonVisualShapeProperties = new NonVisualShapeProperties
                (new NonVisualDrawingProperties() { Id = drawingObjectId, Name = "Title" },
                new NonVisualShapeDrawingProperties(new Drawing.ShapeLocks() { NoGrouping = true }),
                new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.Title }));
            titleShape.ShapeProperties = new ShapeProperties();

            // Specify the text of the title shape.
            titleShape.TextBody = new TextBody(new Drawing.BodyProperties(),
                    new Drawing.ListStyle(),
                    new Drawing.Paragraph(new Drawing.Run(new Drawing.Text() { Text = slideTitle })));

            // Declare and instantiate the body shape of the new slide.
            DocumentFormat.OpenXml.Presentation.Shape bodyShape = slide.CommonSlideData.ShapeTree.AppendChild(new DocumentFormat.OpenXml.Presentation.Shape());
            drawingObjectId++;

            // Specify the required shape properties for the body shape.
            bodyShape.NonVisualShapeProperties = new NonVisualShapeProperties(new NonVisualDrawingProperties() { Id = drawingObjectId, Name = "Content Placeholder" },
                    new NonVisualShapeDrawingProperties(new Drawing.ShapeLocks() { NoGrouping = true }),
                    new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Index = 1 }));
            bodyShape.ShapeProperties = new ShapeProperties();

            // Specify the text of the body shape.
            bodyShape.TextBody = new TextBody(new Drawing.BodyProperties(),
                    new Drawing.ListStyle(),
                    new Drawing.Paragraph(new Drawing.Run(new Drawing.Text() { Text = putContent })));





            // Create the slide part for the new slide.
            SlidePart slidePart = presentationPart.AddNewPart<SlidePart>();







            // Save the new slide part.
            slide.Save(slidePart);

            // Modify the slide ID list in the presentation part.
            // The slide ID list should not be null.
            SlideIdList slideIdList = presentationPart.Presentation.SlideIdList;

            // Find the highest slide ID in the current list.
            uint maxSlideId = 1;
            SlideId prevSlideId = null;

            foreach (SlideId slideId in slideIdList.ChildElements)
            {
                if (slideId.Id > maxSlideId)
                {
                    maxSlideId = slideId.Id;
                }

                position--;
                if (position == 0)
                {
                    prevSlideId = slideId;
                }

            }

            maxSlideId++;

            // Get the ID of the previous slide.
            SlidePart lastSlidePart;

            if (prevSlideId != null)
            {
                lastSlidePart = (SlidePart)presentationPart.GetPartById(prevSlideId.RelationshipId);
            }
            else
            {
                lastSlidePart = (SlidePart)presentationPart.GetPartById(((SlideId)(slideIdList.ChildElements[0])).RelationshipId);
            }

            // Use the same slide layout as that of the previous slide.
            if (null != lastSlidePart.SlideLayoutPart)
            {
                slidePart.AddPart(lastSlidePart.SlideLayoutPart);
            }

            // Insert the new slide into the slide list after the previous slide.
            SlideId newSlideId = slideIdList.InsertAfter(new SlideId(), prevSlideId);
            newSlideId.Id = maxSlideId;
            newSlideId.RelationshipId = presentationPart.GetIdOfPart(slidePart);

            // Save the modified presentation.
            presentationPart.Presentation.Save();
        }





        public void InsertNewSlideWithImg(PresentationDocument presentationDocument, int position, string imagePath)
        {


            if (presentationDocument == null)
            {
                throw new ArgumentNullException("presentationDocument");
            }

            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Verify that the presentation is not empty.
            if (presentationPart == null)
            {
                throw new InvalidOperationException("The presentation document is empty.");
            }
            images.Add(imagePath);
            imagePath = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "img", imagePath);

            // Declare and instantiate a new slide.
            Slide slide = new Slide(new CommonSlideData(new ShapeTree()));
            uint drawingObjectId = 1;

            // Construct the slide content.            
            // Specify the non-visual properties of the new slide.
            NonVisualGroupShapeProperties nonVisualProperties = slide.CommonSlideData.ShapeTree.AppendChild(new NonVisualGroupShapeProperties());
            nonVisualProperties.NonVisualDrawingProperties = new NonVisualDrawingProperties() { Id = 1, Name = "" };
            nonVisualProperties.NonVisualGroupShapeDrawingProperties = new NonVisualGroupShapeDrawingProperties();
            nonVisualProperties.ApplicationNonVisualDrawingProperties = new ApplicationNonVisualDrawingProperties();

            // Specify the group shape properties of the new slide.
            slide.CommonSlideData.ShapeTree.AppendChild(new GroupShapeProperties());

            DocumentFormat.OpenXml.Presentation.Shape pictureShape = slide.CommonSlideData.ShapeTree.AppendChild(new DocumentFormat.OpenXml.Presentation.Shape());

            drawingObjectId++;

            // Size of PowerPoint slide in EMUs
            long slideWidthEmus = 9144000;  // 10 inches
            long slideHeightEmus = 6858000;  // 7.5 inches

            // Image dimensions in EMUs
            long imageWidthEmus = 3048000; // e.g. 3.33 inches
            long imageHeightEmus = 3048000; // e.g. 3.33 inches

            // Calculate position to center image
            long centerX = (slideWidthEmus - imageWidthEmus) / 2;
            long centerY = (slideHeightEmus - imageHeightEmus) / 2;


            pictureShape.NonVisualShapeProperties = new NonVisualShapeProperties
                (new NonVisualDrawingProperties() { Id = drawingObjectId, Name = "Picture" },
                new NonVisualPictureDrawingProperties(new Drawing.PictureLocks { NoChangeAspect = true }),
                new NonVisualShapeDrawingProperties(new Drawing.ShapeLocks() { NoGrouping = true }),
                new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.Picture }));

            pictureShape.ShapeProperties = new ShapeProperties(
               new Drawing.Transform2D(new Drawing.Offset { X = 50, Y = 50 }, new Drawing.Extents { Cx = imageWidthEmus, Cy = imageHeightEmus }),
    new Drawing.PresetGeometry(new Drawing.AdjustValueList()) { Preset = Drawing.ShapeTypeValues.Rectangle });

            // Create the slide part for the new slide.
            SlidePart slidePart = presentationPart.AddNewPart<SlidePart>();

            ImagePart imagePart = slidePart.AddImagePart(ImagePartType.Jpeg);
            try
            {
                using (FileStream imageStream = new FileStream(imagePath, FileMode.Open))
                {
                    imagePart.FeedData(imageStream);

                    imageStream.Seek(0, SeekOrigin.Begin);

                    using (System.Drawing.Image im = System.Drawing.Image.FromStream(imageStream))
                    {

                        imageWidthEmus = (long)(im.Width * 914400 / im.HorizontalResolution);
                        imageHeightEmus = (long)(im.Height * 914400 / im.VerticalResolution);
                    }


                }

            }
            catch
            {
                return;

            }
            
            Picture picture = new Picture();
            drawingObjectId++;

            picture.NonVisualPictureProperties = new NonVisualPictureProperties(
                new NonVisualDrawingProperties() { Id = drawingObjectId, Name = "Picture" },
                new NonVisualPictureDrawingProperties(new Drawing.PictureLocks { NoChangeAspect = true }),
                new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.Picture }));

            picture.BlipFill = new BlipFill(
                new Drawing.Blip() { Embed = slidePart.GetIdOfPart(imagePart) },
                new Drawing.Stretch(new Drawing.FillRectangle()));

            picture.ShapeProperties = new ShapeProperties(
               new Drawing.Transform2D(new Drawing.Offset { X = centerX, Y = centerY }, new Drawing.Extents { Cx = imageWidthEmus, Cy = imageHeightEmus }),
    new Drawing.PresetGeometry(new Drawing.AdjustValueList()) { Preset = Drawing.ShapeTypeValues.Rectangle });

            slide.CommonSlideData.ShapeTree.AppendChild(picture);

            // Save the new slide part.
            slide.Save(slidePart);

            // Modify the slide ID list in the presentation part.
            SlideIdList slideIdList = presentationPart.Presentation.SlideIdList;

            uint maxSlideId = 1;
            SlideId prevSlideId = null;

            foreach (SlideId slideId in slideIdList.ChildElements)
            {
                if (slideId.Id > maxSlideId)
                {
                    maxSlideId = slideId.Id;
                }

                position--;
                if (position == 0)
                {
                    prevSlideId = slideId;
                }
            }

            maxSlideId++;

            SlidePart lastSlidePart;

            if (prevSlideId != null)
            {
                lastSlidePart = (SlidePart)presentationPart.GetPartById(prevSlideId.RelationshipId);
            }
            else
            {
                lastSlidePart = (SlidePart)presentationPart.GetPartById(((SlideId)(slideIdList.ChildElements[0])).RelationshipId);
            }

            if (null != lastSlidePart.SlideLayoutPart)
            {
                slidePart.AddPart(lastSlidePart.SlideLayoutPart);
            }

            SlideId newSlideId = slideIdList.InsertAfter(new SlideId(), prevSlideId);
            newSlideId.Id = maxSlideId;
            newSlideId.RelationshipId = presentationPart.GetIdOfPart(slidePart);

            // Save the modified presentation.
            presentationPart.Presentation.Save();
        }


        public void InsertNewSlideWithImg(string presentationFile, int position, string[] images)
        {

            // Open the source document as read/write. 
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true))
            {
                foreach (string im in images)
                {
                    InsertNewSlideWithImg(presentationDocument, position, im);

                }


            }
        }



        // Get the presentation object and pass it to the next CountSlides method.
        public static int CountSlides(string presentationFile)
        {
            // Open the presentation as read-only.
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, false))
            {
                // Pass the presentation to the next CountSlide method
                // and return the slide count.
                return CountSlides(presentationDocument);
            }
        }

        // Count the slides in the presentation.
        public static int CountSlides(PresentationDocument presentationDocument)
        {
            // Check for a null document object.
            if (presentationDocument == null)
            {
                throw new ArgumentNullException("presentationDocument");
            }

            int slidesCount = 0;

            // Get the presentation part of document.
            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Get the slide count from the SlideParts.
            if (presentationPart != null)
            {
                slidesCount = presentationPart.SlideParts.Count();
            }

            // Return the slide count to the previous method.
            return slidesCount;
        }
        //
        // Get the presentation object and pass it to the next DeleteSlide method.
        public static void DeleteSlide(string presentationFile, int slideIndex)
        {
            // Open the source document as read/write.

            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true))
            {
                // Pass the source document and the index of the slide to be deleted to the next DeleteSlide method.
                DeleteSlide(presentationDocument, slideIndex);
            }
        }

        // Delete the specified slide from the presentation.
        public static void DeleteSlide(PresentationDocument presentationDocument, int slideIndex)
        {
            if (presentationDocument == null)
            {
                throw new ArgumentNullException("presentationDocument");
            }

            // Use the CountSlides sample to get the number of slides in the presentation.
            int slidesCount = CountSlides(presentationDocument);

            if (slideIndex < 0 || slideIndex >= slidesCount)
            {
                throw new ArgumentOutOfRangeException("slideIndex");
            }

            // Get the presentation part from the presentation document. 
            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Get the presentation from the presentation part.
            Presentation presentation = presentationPart.Presentation;

            // Get the list of slide IDs in the presentation.
            SlideIdList slideIdList = presentation.SlideIdList;

            // Get the slide ID of the specified slide
            SlideId slideId = slideIdList.ChildElements[slideIndex] as SlideId;

            // Get the relationship ID of the slide.
            string slideRelId = slideId.RelationshipId;

            // Remove the slide from the slide list.
            slideIdList.RemoveChild(slideId);

            //
            // Remove references to the slide from all custom shows.
            if (presentation.CustomShowList != null)
            {
                // Iterate through the list of custom shows.
                foreach (var customShow in presentation.CustomShowList.Elements<CustomShow>())
                {
                    if (customShow.SlideList != null)
                    {
                        // Declare a link list of slide list entries.
                        LinkedList<SlideListEntry> slideListEntries = new LinkedList<SlideListEntry>();
                        foreach (SlideListEntry slideListEntry in customShow.SlideList.Elements())
                        {
                            // Find the slide reference to remove from the custom show.
                            if (slideListEntry.Id != null && slideListEntry.Id == slideRelId)
                            {
                                slideListEntries.AddLast(slideListEntry);
                            }
                        }

                        // Remove all references to the slide from the custom show.
                        foreach (SlideListEntry slideListEntry in slideListEntries)
                        {
                            customShow.SlideList.RemoveChild(slideListEntry);
                        }
                    }
                }
            }

            // Save the modified presentation.
            presentation.Save();

            // Get the slide part for the specified slide.
            SlidePart slidePart = presentationPart.GetPartById(slideRelId) as SlidePart;

            // Remove the slide part.
            presentationPart.DeletePart(slidePart);
        }



        static void AddImageToPptx(string pptxFilePath, string imagePath)
        {
            // Open the presentation
            using (PresentationDocument presentationDocument = PresentationDocument.Open(pptxFilePath, true))
            {
                PresentationPart presentationPart = presentationDocument.PresentationPart;

                // Get or create the first slide
                SlidePart slidePart = GetFirstSlidePart(presentationPart);
                if (slidePart == null)
                    throw new Exception("The presentation should have at least one slide.");

                // Embed the image into the presentation
                ImagePart imagePart = slidePart.AddImagePart(ImagePartType.Jpeg);
                using (FileStream imageStream = new FileStream(imagePath, FileMode.Open))
                {
                    imagePart.FeedData(imageStream);
                }

                // Add the embedded image to the first slide
                string imageId = slidePart.GetIdOfPart(imagePart);
                AddPictureToSlide(slidePart, imageId);
                presentationDocument.Save();
            }
        }

        static SlidePart GetFirstSlidePart(PresentationPart presentationPart)
        {
            SlideId slideId = presentationPart.Presentation.SlideIdList?.GetFirstChild<SlideId>();
            return slideId == null ? null : (SlidePart)presentationPart.GetPartById(slideId.RelationshipId);
        }

        static void AddPictureToSlide(SlidePart slidePart, string imageId)
        {
            // Create Picture instance
            var picture = new Picture();
            var nonVisualPictureProperties = new NonVisualPictureProperties(
                new Drawing.NonVisualDrawingProperties { Id = (UInt32Value)4U, Name = "Picture" },
                new Drawing.NonVisualPictureDrawingProperties(new Drawing.PictureLocks { NoChangeAspect = true })
            );
            var blipFill = new Drawing.BlipFill(
                new Drawing.Blip { Embed = imageId },
                new Drawing.Stretch(new Drawing.FillRectangle())
            );
            var shapeProperties = new Drawing.ShapeProperties(
                new Drawing.Transform2D(new Drawing.Offset { X = 0L, Y = 0L }, new Drawing.Extents { Cx = 3048000L, Cy = 3048000L }),
                new Drawing.PresetGeometry(new Drawing.AdjustValueList()) { Preset = Drawing.ShapeTypeValues.Rectangle }
            );

            // Append Picture elements
            picture.Append(nonVisualPictureProperties);
            picture.Append(blipFill);
            picture.Append(shapeProperties);

            // Append the Picture to the Slide
            slidePart.Slide.CommonSlideData.ShapeTree.AppendChild(picture);
        }
    


}



}




