using Microsoft.AspNetCore.Mvc;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.parser;
using matgit.Model;
using System.Drawing.Imaging;
using System.Drawing;
using System.Runtime.InteropServices;
using DocumentFormat.OpenXml.Drawing;
using System.Text;

namespace matgit.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PdfController : ControllerBase
    {
        public static ResultDto result = new ResultDto();
        private readonly IWebHostEnvironment _hostEnvironment;
       
        public PdfController(IWebHostEnvironment HostEnvironment)
        {
            _hostEnvironment = HostEnvironment;

            
        }
        

        public static ResultDto ExtractContentFromPDF(string filePath)
        {
            
            
            try
            {
                StringBuilder text = new StringBuilder();
                using (PdfReader reader = new PdfReader(filePath))
                {
                    for (int page = 1; page < reader.NumberOfPages; page++)
                    {
                        ITextExtractionStrategy its = new iTextSharp.text.pdf.parser.LocationTextExtractionStrategy();
                        text.Append(PdfTextExtractor.GetTextFromPage(reader, page, its));






                    }


                }
                result.text = text.ToString();
                //PdfReader reader = new PdfReader(filePath);

                //for (int pageNum = 1; pageNum <= reader.NumberOfPages; pageNum++)
                //{
                //    var strategy = new SimpleTextExtractionStrategy();

                //    // Extract text content from the page
                //    string pageText = PdfTextExtractor.GetTextFromPage(reader, pageNum, strategy);
                //    Console.WriteLine("Page {0} Text Content: {1}", pageNum, pageText);
                //    result.text += " " + pageNum + " "+ pageText;
                //    result.Id = 0;
                //    // Extract images from the page
                //   // PdfDictionary pageDict = reader.GetPageN(pageNum);
                //   // PdfDictionary resources = pageDict.GetAsDict(PdfName.RESOURCES);
                //   // ExtractImagesFromResources(resources, pageNum);
                //}

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                result.text= ex.Message;
                return result;
            }
        }

        public void ExtractImagesFromResources(PdfReader reader, int pageNum)
        {
            PdfObject pdfObject = reader.GetPdfObject(pageNum);
            if (pdfObject == null || !pdfObject.IsStream())
            {
                return;
            }
            PdfStream stream = (PdfStream)pdfObject;
            PdfObject pdfsubtype = stream.Get(PdfName.SUBTYPE);
        }


        [HttpPost("upload")]
        public ResultDto UploadFile(IFormFile file)
        {
            ResultDto result = new ResultDto();
            // Validate file
            if (file == null || file.Length == 0)
            {
                result.text = "No file uploaded.";
                return result;
            }

            // Process the file
            
            string filePath = System.IO.Path.Combine(_hostEnvironment.WebRootPath,"pdf", System.IO.Path.GetRandomFileName() +".pdf");
            ; // Specify the desired file path to save the uploaded file

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(stream);
                stream.Close();
                
              
            }
            

            
            result = ExtractContentFromPDF(filePath);

            // Additional processing logic if needed
            System.IO.File.Delete(filePath);
            return result;
        }


        }
}
