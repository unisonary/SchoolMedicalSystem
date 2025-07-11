using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MedicalManagement.Helpers
{
    public class EmailJwtHelper
    {
        private readonly string _secret;

        public EmailJwtHelper(string secret)
        {
            _secret = secret;
        }

        public string GenerateToken(int consentId, string status, int expiresMinutes = 15)
        {
            var claims = new[]
            {
            new Claim("consentId", consentId.ToString()),
            new Claim("status", status)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal ValidateToken(string token)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var handler = new JwtSecurityTokenHandler();

            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return principal;
        }

        public (int consentId, string status) DecodeToken(string token)
        {
            var principal = ValidateToken(token);
            var id = int.Parse(principal.FindFirst("consentId")!.Value);
            var status = principal.FindFirst("status")!.Value;
            return (id, status);
        }
    }

}
