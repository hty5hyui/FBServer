using FBServer.Controller;
using FBServer.Entity;
using FBServer.Repo;
using FBServer.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbFBContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DbConnectionStudent"));
});


//-----------------------DI-----------------------------------------------------
builder.Services.AddScoped<SystemInfoRepo>();
builder.Services.AddScoped<SystemStatusService>();
builder.Services.AddScoped<StatusController>();
//------------------------------------------------------------------------------



builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // указывает, будет ли валидироватьс€ издатель при валидации токена
            ValidateIssuer = true,
            // строка, представл€юща€ издател€
            ValidIssuer = AuthOptions.ISSUER,
            // будет ли валидироватьс€ потребитель токена
            ValidateAudience = true,
            // установка потребител€ токена
            ValidAudience = AuthOptions.AUDIENCE,
            // будет ли валидироватьс€ врем€ существовани€
            ValidateLifetime = true,
            // установка ключа безопасности
            IssuerSigningKey = AuthOptions.GetSymmetricSecurityKey(),
            // валидаци€ ключа безопасности
            ValidateIssuerSigningKey = true,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FBServer API",
        Version = "V1",
        Description = "FBServer API"
    });
});

///TODO: ƒобавление сервисов CORS дабы браузер не ругалс€ (потом переделать под более точную настройку)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()   // –азрешить любой источник
                  .AllowAnyMethod()   // –азрешить любой HTTP-метод
                  .AllowAnyHeader();  // –азрешить любой заголовок
        });
});


var app = builder.Build();

//-----------------------------использование middleware--------------------------------------------- 
//ƒл€ аутентифакции и авторизации
app.UseAuthentication();   
app.UseAuthorization();
//ƒл€ использовани€ автоматического предоставлени€ страниц
app.UseDefaultFiles();
app.UseStaticFiles();
//--------------------------------------------------------------------------------------------------
//»спользуем CORS
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student API v1");
        c.RoutePrefix = "swagger";
    });
}

app.MapControllers();

app.Run();
