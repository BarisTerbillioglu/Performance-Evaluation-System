
using System.ComponentModel.DataAnnotations;
using Microsoft.VisualBasic;

namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class CreateEvaluationRequest
    {
        public int EmployeeID { get; set; }
        public required string Period { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}