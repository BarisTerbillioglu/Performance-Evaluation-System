using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PerformanceEvaluation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDeleteBehaviorsForCascading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evaluations_Users_EvaluatorID",
                table: "Evaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_EvaluationScores_Evaluations_EvaluationID",
                table: "EvaluationScores");

            migrationBuilder.DropForeignKey(
                name: "FK_EvaluatorAssignments_Users_EvaluatorID",
                table: "EvaluatorAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleAssignments_Users_UserID",
                table: "RoleAssignments");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "RoleAssignments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "EvaluationScores",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Evaluations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "RoleAssignments",
                keyColumn: "ID",
                keyValue: 1,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "RoleAssignments",
                keyColumn: "ID",
                keyValue: 2,
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "ID",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$2AsZka8fR4cWQR7ykVRTV.KEhAghuukqVYUYalSxh1wGaghg7MbbO");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluations_Users_EvaluatorID",
                table: "Evaluations",
                column: "EvaluatorID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EvaluationScores_Evaluations_EvaluationID",
                table: "EvaluationScores",
                column: "EvaluationID",
                principalTable: "Evaluations",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EvaluatorAssignments_Users_EvaluatorID",
                table: "EvaluatorAssignments",
                column: "EvaluatorID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleAssignments_Users_UserID",
                table: "RoleAssignments",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Evaluations_Users_EvaluatorID",
                table: "Evaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_EvaluationScores_Evaluations_EvaluationID",
                table: "EvaluationScores");

            migrationBuilder.DropForeignKey(
                name: "FK_EvaluatorAssignments_Users_EvaluatorID",
                table: "EvaluatorAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleAssignments_Users_UserID",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "EvaluationScores");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Evaluations");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "ID",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$RG4s4bsGIi5uI1V6W5EDUuDkKKAbB/71u5MwEWh85L7tBFKfi3qZ6");

            migrationBuilder.AddForeignKey(
                name: "FK_Evaluations_Users_EvaluatorID",
                table: "Evaluations",
                column: "EvaluatorID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvaluationScores_Evaluations_EvaluationID",
                table: "EvaluationScores",
                column: "EvaluationID",
                principalTable: "Evaluations",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvaluatorAssignments_Users_EvaluatorID",
                table: "EvaluatorAssignments",
                column: "EvaluatorID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleAssignments_Users_UserID",
                table: "RoleAssignments",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
