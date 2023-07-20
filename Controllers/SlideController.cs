using matgit.Model;
using Microsoft.AspNetCore.Mvc;
using PowerPoint = Microsoft.Office.Interop.PowerPoint;

namespace matgit.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class SlideController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        public SlideController(IWebHostEnvironment hostEnvironment) { 
        _hostEnvironment= hostEnvironment;
        }

        [HttpPost]
public ResultDto AddSlideToPresentation(ResultDto filep)
    {

            string filePath = Path.Combine(_hostEnvironment.WebRootPath, "presentations","temp.pptx");
        // Create a new PowerPoint application
        PowerPoint.Application powerPointApp = new PowerPoint.Application();

        // Create a new presentation
        PowerPoint.Presentation presentation = powerPointApp.Presentations.Add();

        // Add a new slide to the presentation
        PowerPoint.Slide slide = presentation.Slides.Add(1, PowerPoint.PpSlideLayout.ppLayoutText);

        // Set the title for the slide
        PowerPoint.TextRange titleRange = slide.Shapes.Title.TextFrame.TextRange;
        titleRange.Text = "Title";

        // Set the content for the slide
        PowerPoint.TextRange contentRange = slide.Shapes[2].TextFrame.TextRange;
        contentRange.Text = "1. first item\r\n2. second item";

        // Save the presentation
        presentation.SaveAs(filePath);

        // Close the presentation and PowerPoint application
       // presentation.Close();
        powerPointApp.Quit();
            filep.text = "success";
            return filep;
    }

}
}
