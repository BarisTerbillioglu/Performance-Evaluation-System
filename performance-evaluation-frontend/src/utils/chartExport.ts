import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ChartExportOptions {
  format: 'png' | 'jpg' | 'pdf';
  width?: number;
  height?: number;
  backgroundColor?: string;
  filename?: string;
}

export const exportChartAsImage = async (
  chartElement: HTMLElement,
  options: ChartExportOptions
): Promise<void> => {
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      width: options.width,
      height: options.height,
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true
    });

    const dataUrl = canvas.toDataURL(`image/${options.format}`);

    if (options.format === 'pdf') {
      // Convert to PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
      });

      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${options.filename || 'chart'}.pdf`);
    } else {
      // Download as image
      const link = document.createElement('a');
      link.download = `${options.filename || 'chart'}.${options.format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Chart export failed:', error);
    throw new Error('Failed to export chart');
  }
};

export const exportMultipleCharts = async (
  chartElements: HTMLElement[],
  options: ChartExportOptions & { title?: string }
): Promise<void> => {
  try {
    if (options.format === 'pdf') {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm'
      });

      let yOffset = 20;

      // Add title if provided
      if (options.title) {
        pdf.setFontSize(16);
        pdf.text(options.title, 20, yOffset);
        yOffset += 15;
      }

      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i];
        const canvas = await html2canvas(element, {
          backgroundColor: options.backgroundColor || '#ffffff',
          width: options.width,
          height: options.height,
          scale: 2,
          useCORS: true,
          allowTaint: true
        });

        const imgWidth = 170; // Fit within A4 width
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (yOffset + imgHeight > 280) {
          pdf.addPage();
          yOffset = 20;
        }

        const dataUrl = canvas.toDataURL('image/png');
        pdf.addImage(dataUrl, 'PNG', 20, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10;
      }

      pdf.save(`${options.filename || 'analytics-report'}.pdf`);
    } else {
      // Export individual images
      for (let i = 0; i < chartElements.length; i++) {
        await exportChartAsImage(chartElements[i], {
          ...options,
          filename: `${options.filename || 'chart'}-${i + 1}`
        });
      }
    }
  } catch (error) {
    console.error('Multiple charts export failed:', error);
    throw new Error('Failed to export charts');
  }
};

export const exportDashboardAsPDF = async (
  dashboardElement: HTMLElement,
  options: ChartExportOptions & { title?: string }
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm'
    });

    const canvas = await html2canvas(dashboardElement, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: 1,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: dashboardElement.scrollWidth,
      windowHeight: dashboardElement.scrollHeight
    });

    const imgWidth = 190; // A4 width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Split into multiple pages if needed
    const pageHeight = 277; // A4 height minus margins
    const pages = Math.ceil(imgHeight / pageHeight);

    for (let i = 0; i < pages; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const sourceY = i * pageHeight * (canvas.height / imgHeight);
      const sourceHeight = Math.min(
        pageHeight * (canvas.height / imgHeight),
        canvas.height - sourceY
      );

      const dataUrl = canvas.toDataURL('image/png');
      pdf.addImage(
        dataUrl,
        'PNG',
        10,
        10,
        imgWidth,
        imgHeight,
        undefined,
        'FAST',
        0
      );
    }

    pdf.save(`${options.filename || 'analytics-dashboard'}.pdf`);
  } catch (error) {
    console.error('Dashboard export failed:', error);
    throw new Error('Failed to export dashboard');
  }
};
