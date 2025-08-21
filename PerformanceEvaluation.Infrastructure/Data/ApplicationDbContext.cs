using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Core.Entities;

namespace PerformanceEvaluation.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Criteria> Criteria { get; set; }
        public DbSet<CriteriaCategory> CriteriaCategories { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<EvaluationScore> EvaluationScores { get; set; }
        public DbSet<EvaluatorAssignment> EvaluatorAssignments { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RoleCriteriaDescription> RoleCriteriaDescriptions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RoleAssignment> RoleAssignments { get; set; }

        public DbSet<Comment> Comments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Team> Teams { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Department config
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.ID);

                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            //JobRole config
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.ID);

                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            //User config
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.ID);

                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash);

                entity.HasIndex(e => e.Email).IsUnique();

                //One to many relation with Department
                entity.HasOne(e => e.Department)
                    .WithMany(d => d.Users)
                    .HasForeignKey(e => e.DepartmentID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            //UserRole config
            modelBuilder.Entity<RoleAssignment>(entity =>
            {
                entity.HasKey(e => e.ID);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.RoleAssignments)
                    .HasForeignKey(e => e.UserID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Role)
                    .WithMany(u => u.RoleAssignments)
                    .HasForeignKey(e => e.RoleID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.UserID, e.RoleID }).IsUnique();
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ActionUrl).HasMaxLength(500);
                entity.Property(e => e.Metadata).HasMaxLength(2000);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Indexes for performance
                entity.HasIndex(e => new { e.UserId, e.IsRead })
                    .HasDatabaseName("IX_Notifications_UserId_IsRead");

                entity.HasIndex(e => e.CreatedDate)
                    .HasDatabaseName("IX_Notifications_CreatedDate");

                entity.HasIndex(e => e.Type)
                    .HasDatabaseName("IX_Notifications_Type");

                // Default values
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETUTCDATE()");
            });

            //Criteria config
            modelBuilder.Entity<Criteria>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.BaseDescription).HasMaxLength(500);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasOne(e => e.CriteriaCategory)
                    .WithMany(r => r.Criteria)
                    .HasForeignKey(e => e.CategoryID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            //CriteriaCategory config
            modelBuilder.Entity<CriteriaCategory>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Weight).HasColumnType("decimal(5,2)");
                entity.HasIndex(e => e.Name).IsUnique();
            });

            //RoleCriteriaDescription config
            modelBuilder.Entity<RoleCriteriaDescription>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Example).HasMaxLength(500);

                entity.HasOne(e => e.Criteria)
                    .WithMany(u => u.RoleCriteriaDescriptions)
                    .HasForeignKey(e => e.CriteriaID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Role)
                    .WithMany(u => u.RoleCriteriaDescriptions)
                    .HasForeignKey(e => e.RoleID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.CriteriaID, e.RoleID });
            });

            //Evaluation config
            modelBuilder.Entity<Evaluation>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Period).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.TotalScore).HasColumnType("decimal(5,2)");
                entity.Property(e => e.GeneralComments).HasMaxLength(1000);

                entity.HasOne(e => e.Evaluator)
                    .WithMany(u => u.EvaluatorEvaluations)
                    .HasForeignKey(e => e.EvaluatorID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Employee)
                .WithMany(u => u.EmployeeEvaluations)
                .HasForeignKey(e => e.EmployeeID)
                .OnDelete(DeleteBehavior.Restrict);

            });

            //EvaluationScore config
            modelBuilder.Entity<EvaluationScore>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Score).IsRequired();

                entity.HasOne(e => e.Criteria)
                    .WithMany(u => u.EvaluationScores)
                    .HasForeignKey(e => e.CriteriaID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Evaluation)
                .WithMany(u => u.EvaluationScores)
                .HasForeignKey(e => e.EvaluationID)
                .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.CriteriaID, e.EvaluationID }).IsUnique();
            });

            //EvaluationAssignment config
            modelBuilder.Entity<EvaluatorAssignment>(entity =>
            {
                entity.HasKey(e => e.ID);

                entity.HasOne(e => e.Evaluator)
                    .WithMany(u => u.EvaluatorAssignments)
                    .HasForeignKey(e => e.EvaluatorID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Employee)
                    .WithMany(u => u.EmployeeAssignments)
                    .HasForeignKey(e => e.EmployeeID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Team)
                    .WithMany(u => u.EvaluatorAssignments)
                    .HasForeignKey(e => e.TeamID)
                    .OnDelete(DeleteBehavior.Restrict);


                entity.HasIndex(e => new { e.TeamID, e.EvaluatorID }).IsUnique();
            });

            //Comment config
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
                entity.HasOne(e => e.EvaluationScore)
                    .WithMany(u => u.Comments)
                    .HasForeignKey(e => e.ScoreID)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(e => e.Description).IsUnique();
            });

            SeedData(modelBuilder);

            modelBuilder.Entity<Team>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Description).IsUnique();
            });
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Department>().HasData(
                new Department
                {
                    ID = 1,
                    Name = "Money Transfer Department",
                    IsActive = true,
                    CreatedDate = new DateTime(2025, 7, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<Role>().HasData(

                new Role { ID = 1, Name = "Admin", Description = "System Administrator", IsActive = true },
                new Role { ID = 2, Name = "Evaluator", Description = "Can evaluate employees", IsActive = true },
                new Role { ID = 3, Name = "Employee", Description = "Regular employee", IsActive = true },

                new Role { ID = 4, Name = "Business Analyst", Description = "Business Analyst", IsActive = true },
                new Role { ID = 5, Name = "Developer", Description = "Software Developer", IsActive = true },
                new Role { ID = 6, Name = "QA Specialist", Description = "Quality Assurance Specialist", IsActive = true }

            );

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    ID = 1,
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@vakifbank.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    DepartmentID = 1,
                    IsActive = true,
                    CreatedDate = new DateTime(2025, 7, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<RoleAssignment>().HasData(
                new RoleAssignment
                {
                    ID = 1,
                    UserID = 1,
                    RoleID = 1, // Admin system role
                    AssignedDate = new DateTime(2025, 7, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new RoleAssignment
                {
                    ID = 2,
                    UserID = 1,
                    RoleID = 5, // Developer job role
                    AssignedDate = new DateTime(2025, 7, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings => 
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }
    }
}

