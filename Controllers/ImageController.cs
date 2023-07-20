using DocumentFormat.OpenXml.Office2010.ExcelAc;
using matgit.Model;
using Microsoft.AspNetCore.Mvc;

namespace matgit.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostEnvironment;
        private static List<string> imageFiles = new List<string>();

        public ImageController(IWebHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }



        [HttpPost("uploadImage")]
        public ResultDto UploadImage(IFormFile image)
        {
            ResultDto result= new ResultDto();
            string fileName = "";

            //string escapedPath = filePath.Replace("\\", "\\\\").Replace("\"", "\\\"");

            // Wrap the escaped path in double quotes
            //string jsonString = $"\"{escapedPath}\"";
            if (image != null && image.Length > 0)
            {
                // Specify the directory where the images will be saved
                //string template = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "img", "temp.jpg");
                //string temporary = System.IO.Path.GetRandomFileName() + ".jpg";

                //string imageFile = System.IO.Path.Combine(_hostEnvironment.WebRootPath, "img", temporary);

                var outputDir = Path.Combine(_hostEnvironment.WebRootPath,"img");

                //System.IO.File.Copy(template, imageFile);

                // Generate a unique filename
                fileName = $"{Path.GetRandomFileName()}.jpg";

                // Combine the output directory and filename
               string filePath = Path.Combine(outputDir, fileName);
               

                // Save the image to the specified path
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    image.CopyTo(fileStream);
                    if(fileStream!=null)
                    {
                        imageFiles.Add(fileName);
                        result.text = fileName;
                    }
                }
                //string escapedPath = filePath.Replace("\\", "\\\\").Replace("\"", "\\\"");
                //string jsonString = $"\"{escapedPath}\"";
                
                
                return result;
            }

            result.text="error";
            return result;
        }

    }
}
