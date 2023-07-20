using matgit.Model;
using Microsoft.AspNetCore.Mvc;

namespace matgit.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class ContactController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        public ContactController(IWebHostEnvironment hostEnvironment)
        {
            _hostEnvironment = hostEnvironment;
        }
        [HttpPost]
        public ResultDto addContactMsg (iContact contact)
        {

            ResultDto result = new ResultDto();
            if(contact != null)
            {
                try
                {
                    result.text = "Your message is sent! Thank you!";
                    string filePath = Path.Combine(_hostEnvironment.WebRootPath,"contact", "contact.csv");

                    // Open the CSV file for writing
                    using (StreamWriter writer = new StreamWriter(filePath, append: true))
                    {
                        // Write data to the CSV file
                        string text= contact.name+ ","+ contact.email+ ","+ contact.message;
                        writer.WriteLine(text);

                        // You can continue writing more data here...

                        // Close the writer to release system resources
                        writer.Close();
                    }
                }
                catch { }
               
            }
            else
            {
                result.text = "Error: Null Message";
            }
            return result;
        }


        [HttpPost("errorlog")]
        public ResultDto addErrorLog(ResultDto error)
        {

            ResultDto result = new ResultDto();
            if (error != null)
            {
                try
                {
                    result.text = "Error log is saved";
                    string filePath = Path.Combine(_hostEnvironment.WebRootPath, "contact", "errorlog.csv");

                    // Open the CSV file for writing
                    using (StreamWriter writer = new StreamWriter(filePath, append: true))
                    {
                        // Write data to the CSV file
                        string text = error.Id + "," + error.text;
                        writer.WriteLine(text);

                        // You can continue writing more data here...

                        // Close the writer to release system resources
                        writer.Close();
                    }
                }
                catch { }

            }
            else
            {
                result.text = "Error: Null Message";
            }
            return result;
        }
    }
}
