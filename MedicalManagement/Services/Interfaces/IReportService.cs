using MedicalManagement.Models.DTOs;

namespace MedicalManagement.Services.Interfaces
{
    public interface IReportService
    {
        Task<List<VaccinationReportDTO>> GetVaccinationReportAsync(VaccinationReportFilterDTO filter);

        Task<List<HealthCheckupReportDTO>> GetHealthCheckupReportAsync(HealthCheckupReportFilterDTO filter);

        Task<List<InventoryReportDTO>> GetInventoryReportAsync(InventoryReportFilterDTO filter);

        Task<byte[]> ExportVaccinationReportToExcel(VaccinationReportFilterDTO filter);
        Task<byte[]> ExportHealthCheckupReportToExcelAsync(HealthCheckupReportFilterDTO filter);
        Task<byte[]> ExportInventoryReportToExcelAsync(InventoryReportFilterDTO filter);

    }

}
