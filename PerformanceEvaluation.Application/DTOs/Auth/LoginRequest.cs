using System.ComponentModel.DataAnnotations;


namespace PerformanceEvaluation.Application.DTOs.Auth
{
    public class LoginRequest
    {

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MinLength(8)]
        public required string Password { get; set; }

    }

}