using Microsoft.AspNetCore.Identity;

namespace AuthService.Models;

public class AppUser : IdentityUser
{
    // за бажанням можна додати:
    // public string FullName { get; set; } = string.Empty;
}
